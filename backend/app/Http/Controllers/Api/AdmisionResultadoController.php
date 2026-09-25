<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CalificarPostulanteRequest;
use App\Http\Resources\AdmisionResultadoResource;
use App\Models\AdmisionCalificacion;
use App\Models\AdmisionConstancia;
use App\Models\AdmisionEvaluacion;
use App\Models\AdmisionPostulacion;
use App\Models\AdmisionProceso;
use App\Models\AdmisionResultado;
use App\Models\Estudiante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class AdmisionResultadoController extends Controller
{
    /**
     * Get Merit Table / Results for a given admission process.
     */
    public function cuadroMerito(Request $request, AdmisionProceso $proceso): AnonymousResourceCollection
    {
        $query = AdmisionResultado::whereHas('postulacion', function ($q) use ($proceso) {
            $q->where('admision_proceso_id', $proceso->id);
        })->with([
            'postulacion.persona',
            'postulacion.programaOfertado.programaEstudio',
            'postulacion.programaOfertado.modalidad',
            'postulacion.constancia'
        ]);

        if ($request->filled('programa_estudio_id')) {
            $progId = $request->input('programa_estudio_id');
            $query->whereHas('postulacion.programaOfertado', fn($q) => $q->where('programa_estudio_id', $progId));
        }

        if ($request->filled('condicion')) {
            $query->where('condicion', $request->input('condicion'));
        }

        $resultados = $query->orderBy('orden_merito')->paginate($request->input('per_page', 20));

        return AdmisionResultadoResource::collection($resultados);
    }

    /**
     * Grade applicant and automatically recalculate their weighted score.
     */
    public function calificar(CalificarPostulanteRequest $request, AdmisionPostulacion $postulacion): JsonResponse
    {
        $validated = $request->validated();
        $proceso = $postulacion->proceso;

        DB::transaction(function () use ($validated, $postulacion, $request) {
            foreach ($validated['calificaciones'] as $calif) {
                AdmisionCalificacion::updateOrCreate(
                    [
                        'admision_postulacion_id' => $postulacion->id,
                        'admision_evaluacion_id' => $calif['admision_evaluacion_id'],
                    ],
                    [
                        'puntaje' => $calif['puntaje'],
                        'evaluador_user_id' => $request->user()?->id,
                    ]
                );
            }

            // Recalcular puntaje final ponderado
            $evaluaciones = $postulacion->proceso->evaluaciones;
            $puntajePonderado = 0;
            foreach ($evaluaciones as $eval) {
                $nota = AdmisionCalificacion::where('admision_postulacion_id', $postulacion->id)
                    ->where('admision_evaluacion_id', $eval->id)
                    ->value('puntaje') ?? 0;
                $puntajePonderado += ($nota * ($eval->peso_porcentual / 100));
            }

            $condicion = ($puntajePonderado >= $postulacion->proceso->puntaje_minimo_aprobatorio)
                ? 'INGRESANTE'
                : 'NO_INGRESANTE';

            AdmisionResultado::updateOrCreate(
                ['admision_postulacion_id' => $postulacion->id],
                [
                    'puntaje_final' => $puntajePonderado,
                    'orden_merito' => 999, // se recalcula en cierre
                    'condicion' => $condicion,
                    'es_adjudicado' => ($condicion === 'INGRESANTE'),
                ]
            );
        });

        return response()->json([
            'message' => 'Calificaciones registradas y puntaje ponderado actualizado exitosamente.',
            'postulacion_id' => $postulacion->id,
        ]);
    }

    /**
     * Issue official admission certificate for an admitted applicant.
     */
    public function emitirConstancia(Request $request, AdmisionPostulacion $postulacion): JsonResponse
    {
        $resultado = $postulacion->resultado;
        if (! $resultado || $resultado->condicion !== 'INGRESANTE') {
            return response()->json([
                'message' => 'Solo se puede emitir constancia de ingreso a postulantes con condición de INGRESANTE.',
            ], 422);
        }

        $constancia = AdmisionConstancia::firstOrCreate(
            ['admision_postulacion_id' => $postulacion->id],
            [
                'codigo_constancia' => 'CONST-ING-' . str_replace(['-', ' '], '', $postulacion->codigo_postulante),
                'fecha_emision' => now()->toDateString(),
                'hash_seguridad' => hash('sha256', $postulacion->codigo_postulante . '-INGRESANTE-' . now()->timestamp),
                'emitido_por_user_id' => $request->user()?->id,
            ]
        );

        return response()->json([
            'message' => 'Constancia oficial de ingreso emitida correctamente.',
            'data' => [
                'codigo_constancia' => $constancia->codigo_constancia,
                'fecha_emision' => $constancia->fecha_emision->format('Y-m-d'),
                'hash_seguridad' => $constancia->hash_seguridad,
                'postulante' => $postulacion->persona?->nombre_completo,
                'programa' => $postulacion->programaOfertado?->programaEstudio?->nombre,
            ],
        ]);
    }

    /**
     * Transfer admitted applicant into formal student in Academic module.
     */
    public function ratificarMatricula(Request $request, AdmisionPostulacion $postulacion): JsonResponse
    {
        $resultado = $postulacion->resultado;
        if (! $resultado || $resultado->condicion !== 'INGRESANTE') {
            return response()->json([
                'message' => 'El postulante no cuenta con condición de INGRESANTE.',
            ], 422);
        }

        $estudiante = Estudiante::firstOrCreate(
            ['persona_id' => $postulacion->persona_id],
            [
                'programa_estudio_id' => $postulacion->programaOfertado->programa_estudio_id,
                'admision_postulacion_id' => $postulacion->id,
                'codigo_estudiante' => 'EST-' . date('Y') . sprintf('%04d', $postulacion->id),
                'fecha_ingreso' => now()->toDateString(),
                'estado_academico' => 'REGULAR',
                'is_active' => true,
            ]
        );

        return response()->json([
            'message' => 'Estudiante generado y ratificado con éxito en el Módulo Académico.',
            'data' => [
                'id' => $estudiante->id,
                'codigo_estudiante' => $estudiante->codigo_estudiante,
                'persona' => $postulacion->persona?->nombre_completo,
                'programa' => $estudiante->programaEstudio?->nombre,
                'fecha_ingreso' => $estudiante->fecha_ingreso->format('Y-m-d'),
            ],
        ]);
    }
}

