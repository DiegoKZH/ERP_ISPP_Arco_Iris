<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmisionProcesoRequest;
use App\Http\Resources\AdmisionProcesoResource;
use App\Models\AdmisionEvaluacion;
use App\Models\AdmisionModalidad;
use App\Models\AdmisionProceso;
use App\Models\AdmisionProgramaOfertado;
use App\Models\PeriodoAcademico;
use App\Models\ProgramaEstudio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class AdmisionProcesoController extends Controller
{
    /**
     * List all admission processes with filters.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = AdmisionProceso::with([
            'periodoAcademico',
            'programasOfertados.programaEstudio',
            'programasOfertados.modalidad',
            'evaluaciones'
        ]);

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $procesos = $query->orderByDesc('fecha_inicio_inscripcion')->paginate(10);
        $procesos = $query->orderByDesc('id')->paginate(10);

        return AdmisionProcesoResource::collection($procesos);
    }

    /**
     * Show detailed admission process info.
     */
    public function show(AdmisionProceso $proceso): JsonResponse
    {
        $proceso->load([
            'periodoAcademico',
            'programasOfertados.programaEstudio',
            'programasOfertados.modalidad',
            'evaluaciones'
        ]);

        return response()->json([
            'data' => new AdmisionProcesoResource($proceso),
        ]);
    }

    /**
     * Crear una nueva convocatoria de admisión.
     * REGLA: Solo habrá 2 programas definidos: Educación Física y Educación Inicial.
     */
    public function store(StoreAdmisionProcesoRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $proceso = DB::transaction(function () use ($validated) {
            $periodoId = $validated['periodo_academico_id'] ?? null;
            if (!$periodoId) {
                $periodo = PeriodoAcademico::where('is_vigente', true)->first()
                    ?? PeriodoAcademico::latest()->first();
                $periodoId = $periodo?->id;
            }

            // 1. Crear Convocatoria / Proceso
            $proceso = AdmisionProceso::create([
                'periodo_academico_id' => $periodoId,
                'nombre' => $validated['nombre'],
                'codigo' => strtoupper($validated['codigo']),
                'fecha_inicio_inscripcion' => $validated['fecha_inicio_inscripcion'],
                'fecha_fin_inscripcion' => $validated['fecha_fin_inscripcion'],
                'fecha_evaluacion' => $validated['fecha_evaluacion'],
                'fecha_publicacion_resultados' => $validated['fecha_publicacion_resultados'],
                'puntaje_minimo_aprobatorio' => $validated['puntaje_minimo_aprobatorio'] ?? 11.00,
                'estado' => $validated['estado'] ?? AdmisionProceso::ESTADO_ABIERTA,
            ]);

            // 2. Modalidad Ordinaria por defecto
            $modalidadOrd = AdmisionModalidad::firstOrCreate(
                ['codigo' => 'ORD'],
                [
                    'nombre' => 'Admisión Ordinaria',
                    'descripcion' => 'Modalidad general para egresados de secundaria.',
                    'tipo' => 'ORDINARIO',
                    'is_active' => true,
                ]
            );

            // 3. REGLA ESTRICTA: Solo 2 programas definidos (Educación Inicial y Educación Física)
            $progInicial = ProgramaEstudio::firstOrCreate(
                ['codigo' => 'EI-01'],
                [
                    'nombre' => 'Educación Inicial',
                    'nivel_academico' => 'Pregrado',
                    'duracion_semestres' => 10,
                    'is_active' => true,
                ]
            );

            $progFisica = ProgramaEstudio::where('codigo', 'EF-01')
                ->orWhere('nombre', 'like', '%Educación F%sica%')
                ->first();

            if (!$progFisica) {
                $progFisica = ProgramaEstudio::create([
                    'codigo' => 'EF-01',
                    'nombre' => 'Educación Física',
                    'nivel_academico' => 'Pregrado',
                    'duracion_semestres' => 10,
                    'is_active' => true,
                ]);
            }

            // Crear ofertas exclusivas
            AdmisionProgramaOfertado::firstOrCreate(
                [
                    'admision_proceso_id' => $proceso->id,
                    'programa_estudio_id' => $progInicial->id,
                    'admision_modalidad_id' => $modalidadOrd->id,
                ],
                [
                    'vacantes' => $validated['vacantes_inicial'] ?? 30,
                ]
            );

            AdmisionProgramaOfertado::firstOrCreate(
                [
                    'admision_proceso_id' => $proceso->id,
                    'programa_estudio_id' => $progFisica->id,
                    'admision_modalidad_id' => $modalidadOrd->id,
                ],
                [
                    'vacantes' => $validated['vacantes_fisica'] ?? 30,
                ]
            );

            // 4. Crear Evaluación base si no tiene
            AdmisionEvaluacion::firstOrCreate(
                [
                    'admision_proceso_id' => $proceso->id,
                    'nombre' => 'Prueba de Competencias Fundamentales',
                ],
                [
                    'peso_porcentual' => 100.00,
                    'puntaje_maximo' => 20.00,
                    'orden' => 1,
                ]
            );

            return $proceso;
        });

        $proceso->load([
            'periodoAcademico',
            'programasOfertados.programaEstudio',
            'programasOfertados.modalidad',
            'evaluaciones'
        ]);

        return response()->json([
            'message' => 'Convocatoria de admisión creada con éxito.',
            'data' => new AdmisionProcesoResource($proceso),
        ], 201);
    }

    /**
     * Alternar estado de la convocatoria: Convocatoria Abierta <-> Convocatoria Cerrada.
     */
    public function toggleEstado(AdmisionProceso $proceso): JsonResponse
    {
        if ($proceso->isCerrada()) {
            $proceso->estado = AdmisionProceso::ESTADO_ABIERTA;
            $mensaje = 'La convocatoria ha sido ABIERTA exitosamente.';
        } else {
            $proceso->estado = AdmisionProceso::ESTADO_CERRADA;
            $mensaje = 'La convocatoria ha sido CERRADA exitosamente.';
        }

        $proceso->save();

        $proceso->load([
            'periodoAcademico',
            'programasOfertados.programaEstudio',
            'programasOfertados.modalidad',
            'evaluaciones'
        ]);

        return response()->json([
            'message' => $mensaje,
            'estado' => $proceso->estado,
            'data' => new AdmisionProcesoResource($proceso),
        ]);
    }
}

