<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmisionPostulacionRequest;
use App\Http\Resources\AdmisionPostulacionResource;
use App\Models\AdmisionPostulacion;
use App\Models\AdmisionProceso;
use App\Models\Persona;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

use App\Http\Requests\CompletarExpedienteRequest;
use App\Http\Requests\PreInscribirPostulacionRequest;
use App\Http\Requests\ValidarPagoPostulacionRequest;
use Illuminate\Support\Carbon;

class AdmisionPostulacionController extends Controller
{
    /**
     * List all applications with search and filters.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = AdmisionPostulacion::with([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad',
            'ambienteAsignado.ambiente',
            'calificaciones.evaluacion',
            'resultado',
            'constancia'
        ]);

        if ($request->filled('admision_proceso_id')) {
            $query->where('admision_proceso_id', $request->input('admision_proceso_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('codigo_postulante', 'like', "%{$search}%")
                    ->orWhere('numero_fut', 'like', "%{$search}%")
                    ->orWhere('codigo_tesoreria', 'like', "%{$search}%")
                    ->orWhere('codigo_modular_colegio', 'like', "%{$search}%")
                    ->orWhereHas('persona', function ($pq) use ($search) {
                        $pq->where('numero_documento', 'like', "%{$search}%")
                            ->orWhere('nombres', 'like', "%{$search}%")
                            ->orWhere('apellido_paterno', 'like', "%{$search}%")
                            ->orWhere('apellido_materno', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('estado_inscripcion')) {
            $query->where('estado_inscripcion', $request->input('estado_inscripcion'));
        }

        if ($request->filled('estado_pago')) {
            $query->where('estado_pago', $request->input('estado_pago'));
        }

        $postulaciones = $query->orderByDesc('id')->paginate($request->input('per_page', 25));

        return AdmisionPostulacionResource::collection($postulaciones);
    }

    /**
     * Paso 1 y 2: Pre-inscripción de postulante y generación de código de tesorería (DNI).
     */
    public function preInscribir(PreInscribirPostulacionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $postulacion = DB::transaction(function () use ($validated) {
            // 1. Crear o actualizar entidad Persona
            $persona = Persona::updateOrCreate(
                ['numero_documento' => $validated['numero_documento']],
                [
                    'tipo_documento' => $validated['tipo_documento'],
                    'nombres' => $validated['nombres'],
                    'apellido_paterno' => $validated['apellido_paterno'],
                    'apellido_materno' => $validated['apellido_materno'],
                    'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
                    'sexo' => $validated['sexo'] ?? null,
                    'direccion' => $validated['direccion'] ?? null,
                    'celular' => $validated['celular'] ?? null,
                    'email_personal' => $validated['email_personal'] ?? null,
                ]
            );

            // 2. Generar correlativo de postulante
            $proceso = AdmisionProceso::findOrFail($validated['admision_proceso_id']);
            $count = AdmisionPostulacion::where('admision_proceso_id', $proceso->id)->count() + 1;
            $codigoPostulante = sprintf('POST-%s-%04d', str_replace(['-', ' '], '', $proceso->codigo), $count);

            // 3. Crear Postulación con código de tesorería = DNI
            return AdmisionPostulacion::create([
                'codigo_postulante' => $codigoPostulante,
                'persona_id' => $persona->id,
                'admision_proceso_id' => $proceso->id,
                'admision_programa_ofertado_id' => $validated['admision_programa_ofertado_id'],
                'codigo_tesoreria' => $persona->numero_documento,
                'estado_pago' => 'PENDIENTE',
                'estado_inscripcion' => 'PENDIENTE_PAGO',
                'observaciones' => $validated['observaciones'] ?? null,
            ]);
        });

        $postulacion->load([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad',
        ]);

        return response()->json([
            'message' => 'Pre-inscripción realizada con éxito. Código de tesorería generado.',
            'codigo_tesoreria' => $postulacion->codigo_tesoreria,
            'data' => new AdmisionPostulacionResource($postulacion),
        ], 201);
    }

    /**
     * Paso 3: Retorno y validación de pago en Tesorería y emisión automática de número de FUT.
     */
    public function validarPago(ValidarPagoPostulacionRequest $request, AdmisionPostulacion $postulacion): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($postulacion, $validated) {
            $year = date('Y');
            
            if (!$postulacion->numero_fut) {
                $countFut = AdmisionPostulacion::whereNotNull('numero_fut')->count() + 1;
                $postulacion->numero_fut = sprintf('FUT-%s-%04d', $year, $countFut);
                $postulacion->fecha_emision_fut = now();
            }

            $postulacion->estado_pago = 'PAGADO';
            $postulacion->fecha_pago = !empty($validated['fecha_pago']) ? Carbon::parse($validated['fecha_pago']) : now();
            $postulacion->comprobante_pago = $validated['comprobante_pago'];
            $postulacion->monto_pago = $validated['monto_pago'] ?? 150.00;
            $postulacion->estado_inscripcion = 'PAGO_VALIDADO';
            $postulacion->save();
        });

        $postulacion->load([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad',
        ]);

        return response()->json([
            'message' => 'Pago validado correctamente por Tesorería. Número de FUT emitido.',
            'numero_fut' => $postulacion->numero_fut,
            'data' => new AdmisionPostulacionResource($postulacion),
        ]);
    }

    /**
     * Paso 4: Completar datos escolares (colegio y código modular) y verificar expediente documentario.
     */
    public function completarExpediente(CompletarExpedienteRequest $request, AdmisionPostulacion $postulacion): JsonResponse
    {
        $validated = $request->validated();

        $postulacion->fill([
            'colegio_fin_secundaria' => $validated['colegio_fin_secundaria'],
            'codigo_modular_colegio' => $validated['codigo_modular_colegio'],
            'anio_egreso_colegio' => $validated['anio_egreso_colegio'],
            'colegio_tipo_gestion' => $validated['colegio_tipo_gestion'] ?? 'PUBLICA',
            'colegio_departamento' => $validated['colegio_departamento'] ?? null,
            'colegio_provincia' => $validated['colegio_provincia'] ?? null,
            'colegio_distrito' => $validated['colegio_distrito'] ?? null,
            'foto_url' => $validated['foto_url'] ?? null,
            'tiene_copia_dni_color' => $validated['tiene_copia_dni_color'],
            'tiene_partida_nacimiento' => $validated['tiene_partida_nacimiento'],
            'tiene_certificado_nacimiento_original' => $validated['tiene_certificado_nacimiento_original'],
            'estado_inscripcion' => 'INSCRITO',
        ]);

        $postulacion->save();

        $postulacion->load([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad',
        ]);

        return response()->json([
            'message' => 'Expediente del postulante completado e inscrito exitosamente.',
            'data' => new AdmisionPostulacionResource($postulacion),
        ]);
    }

    /**
     * Paso 5: Obtener datos oficiales para el Formato Único de Trámite (FUT).
     */
    public function futDocumento(AdmisionPostulacion $postulacion): JsonResponse
    {
        $postulacion->load([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad',
        ]);

        $persona = $postulacion->persona;
        $proceso = $postulacion->proceso;
        $programa = $postulacion->programaOfertado?->programaEstudio;
        $modalidad = $postulacion->programaOfertado?->modalidad;

        return response()->json([
            'institucion' => [
                'nombre' => 'INSTITUTO DE EDUCACIÓN SUPERIOR PEDAGÓGICO PÚBLICO',
                'sede' => 'ARCO IRIS',
                'dre' => 'DIRECCIÓN REGIONAL DE EDUCACIÓN',
                'minedu' => 'MINISTERIO DE EDUCACIÓN DEL PERÚ',
            ],
            'tramite' => [
                'numero_fut' => $postulacion->numero_fut ?? 'SIN EMITIR',
                'fecha_emision' => $postulacion->fecha_emision_fut?->format('d/m/Y H:i') ?? now()->format('d/m/Y'),
                'asunto' => sprintf('SOLICITA: INSCRIPCIÓN AL PROCESO DE ADMISIÓN %s — PROGRAMA: %s', $proceso?->codigo, $programa?->nombre),
                'proceso' => $proceso?->nombre,
                'modalidad' => $modalidad?->nombre,
                'codigo_postulante' => $postulacion->codigo_postulante,
            ],
            'administrado' => [
                'tipo_documento' => $persona?->tipo_documento,
                'numero_documento' => $persona?->numero_documento,
                'apellidos_y_nombres' => $persona?->nombre_completo,
                'direccion' => $persona?->direccion ?? 'NO REGISTRA',
                'celular' => $persona?->celular ?? 'NO REGISTRA',
                'email' => $persona?->email_personal ?? 'NO REGISTRA',
            ],
            'tesoreria' => [
                'codigo_pago' => $postulacion->codigo_tesoreria ?? $persona?->numero_documento,
                'estado' => $postulacion->estado_pago,
                'comprobante' => $postulacion->comprobante_pago ?? 'PENDIENTE',
                'fecha_pago' => $postulacion->fecha_pago?->format('d/m/Y'),
                'monto' => $postulacion->monto_pago ?? 150.00,
            ],
            'colegio_procedencia' => [
                'nombre_ie' => $postulacion->colegio_fin_secundaria ?? 'NO REGISTRADO',
                'codigo_modular' => $postulacion->codigo_modular_colegio ?? 'NO REGISTRADO',
                'anio_egreso' => $postulacion->anio_egreso_colegio ?? 'NO REGISTRADO',
                'gestion' => $postulacion->colegio_tipo_gestion ?? 'PÚBLICA',
                'ubicacion' => sprintf('%s - %s - %s', $postulacion->colegio_departamento ?? '', $postulacion->colegio_provincia ?? '', $postulacion->colegio_distrito ?? ''),
            ],
            'requisitos_adjuntos' => [
                'copia_dni_color' => (bool) $postulacion->tiene_copia_dni_color,
                'partida_nacimiento' => (bool) $postulacion->tiene_partida_nacimiento,
                'certificado_nacimiento_original' => (bool) $postulacion->tiene_certificado_nacimiento_original,
                'fotografia_carnet' => !empty($postulacion->foto_url),
                'recibo_tesoreria' => $postulacion->estado_pago === 'PAGADO',
            ],
            'espacios_en_blanco_lapicero' => [
                'fundamentacion_adicional' => '................................................................................................................................................................',
                'folios_presentados' => '...... folios',
                'sello_mesa_partes' => 'Espacio para firma y sello de recepción de Mesa de Partes',
                'firma_postulante' => 'Firma del Administrado Postulante',
            ],
        ]);
    }

    /**
     * Paso 5: Obtener datos oficiales para la Declaración Jurada de Antecedentes.
     */
    public function declaracionJurada(AdmisionPostulacion $postulacion): JsonResponse
    {
        $postulacion->load([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
        ]);

        $persona = $postulacion->persona;
        $proceso = $postulacion->proceso;
        $programa = $postulacion->programaOfertado?->programaEstudio;

        return response()->json([
            'titulo' => 'DECLARACIÓN JURADA DE NO REGISTRAR ANTECEDENTES PENALES, JUDICIALES NI POLICIALES',
            'base_legal' => 'En concordancia con el Art. 51° del TUO de la Ley N° 27444 — Ley del Procedimiento Administrativo General.',
            'declarante' => [
                'apellidos_y_nombres' => $persona?->nombre_completo,
                'tipo_documento' => $persona?->tipo_documento,
                'numero_documento' => $persona?->numero_documento,
                'direccion' => $persona?->direccion ?? 'NO REGISTRA',
                'programa_postulado' => $programa?->nombre,
                'proceso_admision' => $proceso?->nombre,
            ],
            'texto_declaracion' => 'DECLARO BAJO JURAMENTO NO REGISTRAR ANTECEDENTES PENALES, NI POLICIALES, NI JUDICIALES A NIVEL NACIONAL, GOZAR DE BUENA SALUD FÍSICA Y MENTAL, Y ESTAR EN PLENO EJERCICIO DE MIS DERECHOS CIVILES PARA PARTICIPAR EN EL PROCESO DE ADMISIÓN Y CURSAR ESTUDIOS SUPERIORES PEDAGÓGICOS.',
            'compromiso_legal' => 'En caso de comprobarse falsedad en lo declarado, me someto a las sanciones y responsabilidades penales de conformidad con el Art. 411° del Código Penal.',
            'fecha' => now()->translatedFormat('d \d\e F \d\e Y'),
            'codigo_postulante' => $postulacion->codigo_postulante,
            'numero_fut' => $postulacion->numero_fut,
        ]);
    }

    /**
     * Registro clásico (mantiene compatibilidad retroactiva).
     */
    public function store(StoreAdmisionPostulacionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $postulacion = DB::transaction(function () use ($validated) {
            $persona = Persona::updateOrCreate(
                ['numero_documento' => $validated['numero_documento']],
                [
                    'tipo_documento' => $validated['tipo_documento'],
                    'nombres' => $validated['nombres'],
                    'apellido_paterno' => $validated['apellido_paterno'],
                    'apellido_materno' => $validated['apellido_materno'],
                    'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
                    'sexo' => $validated['sexo'] ?? null,
                    'direccion' => $validated['direccion'] ?? null,
                    'celular' => $validated['celular'] ?? null,
                    'email_personal' => $validated['email_personal'] ?? null,
                ]
            );

            $proceso = AdmisionProceso::findOrFail($validated['admision_proceso_id']);
            $count = AdmisionPostulacion::where('admision_proceso_id', $proceso->id)->count() + 1;
            $codigoPostulante = sprintf('POST-%s-%04d', str_replace(['-', ' '], '', $proceso->codigo), $count);

            return AdmisionPostulacion::create([
                'codigo_postulante' => $codigoPostulante,
                'persona_id' => $persona->id,
                'admision_proceso_id' => $proceso->id,
                'admision_programa_ofertado_id' => $validated['admision_programa_ofertado_id'],
                'codigo_tesoreria' => $persona->numero_documento,
                'estado_pago' => 'PENDIENTE',
                'estado_inscripcion' => 'APTO_EVALUACION',
                'observaciones' => $validated['observaciones'] ?? null,
            ]);
        });

        $postulacion->load([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad'
        ]);

        return response()->json([
            'message' => 'Postulante registrado e inscrito correctamente.',
            'data' => new AdmisionPostulacionResource($postulacion),
        ], 201);
    }

    /**
     * Show single application details.
     */
    public function show(AdmisionPostulacion $postulacion): JsonResponse
    {
        $postulacion->load([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad',
            'ambienteAsignado.ambiente',
            'calificaciones.evaluacion',
            'resultado',
            'constancia'
        ]);

        return response()->json([
            'data' => new AdmisionPostulacionResource($postulacion),
        ]);
    }

    /**
     * Render official printable A4 view for FUT.
     */
    public function imprimirFut(AdmisionPostulacion $postulacion)
    {
        $postulacion->load([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad',
        ]);

        return view('documents.fut', compact('postulacion'));
    }

    /**
     * Render official printable A4 view for Sworn Statement (Declaración Jurada).
     */
    public function imprimirDeclaracion(AdmisionPostulacion $postulacion)
    {
        $postulacion->load([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad',
        ]);

        return view('documents.declaracion_jurada', compact('postulacion'));
    }
}

