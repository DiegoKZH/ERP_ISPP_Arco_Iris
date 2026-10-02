<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ValidarPagoPostulacionRequest;
use App\Http\Resources\AdmisionPostulacionResource;
use App\Models\AdmisionPostulacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TesoreriaPagoController extends Controller
{
    /**
     * Listar postulaciones para gestión de cobros en Tesorería.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AdmisionPostulacion::with([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad',
        ]);

        if ($request->filled('admision_proceso_id')) {
            $query->where('admision_proceso_id', $request->input('admision_proceso_id'));
        }

        if ($request->filled('estado_pago')) {
            $query->where('estado_pago', $request->input('estado_pago'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('codigo_postulante', 'like', "%{$search}%")
                    ->orWhere('numero_fut', 'like', "%{$search}%")
                    ->orWhere('codigo_tesoreria', 'like', "%{$search}%")
                    ->orWhere('comprobante_pago', 'like', "%{$search}%")
                    ->orWhereHas('persona', function ($pq) use ($search) {
                        $pq->where('numero_documento', 'like', "%{$search}%")
                            ->orWhere('nombres', 'like', "%{$search}%")
                            ->orWhere('apellido_paterno', 'like', "%{$search}%")
                            ->orWhere('apellido_materno', 'like', "%{$search}%");
                    });
            });
        }

        // Estadísticas para tarjetas de tesorería
        $baseQuery = clone $query;
        $totalRecaudado = (float) (clone $query)->where('estado_pago', 'PAGADO')->sum('monto_pago');
        $totalPendientes = (clone $query)->where('estado_pago', 'PENDIENTE')->count();
        $totalPagados = (clone $query)->where('estado_pago', 'PAGADO')->count();

        $postulaciones = $query
            ->orderByRaw("CASE WHEN estado_pago = 'PENDIENTE' THEN 0 ELSE 1 END")
            ->orderByDesc('id')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => AdmisionPostulacionResource::collection($postulaciones),
            'meta' => [
                'current_page' => $postulaciones->currentPage(),
                'last_page' => $postulaciones->lastPage(),
                'per_page' => $postulaciones->perPage(),
                'total' => $postulaciones->total(),
            ],
            'stats' => [
                'total_recaudado' => $totalRecaudado,
                'total_pendientes' => $totalPendientes,
                'total_pagados' => $totalPagados,
            ],
        ]);
    }

    /**
     * Consultar deuda o postulación de admisión por DNI (código de tesorería).
     */
    public function consultarDni(string $dni): JsonResponse
    {
        $postulacion = AdmisionPostulacion::with([
            'persona',
            'proceso',
            'programaOfertado.programaEstudio',
            'programaOfertado.modalidad',
        ])
            ->where('codigo_tesoreria', $dni)
            ->orWhereHas('persona', function ($q) use ($dni) {
                $q->where('numero_documento', $dni);
            })
            ->latest()
            ->first();

        if (!$postulacion) {
            return response()->json([
                'message' => "No se encontró ninguna postulación registrada con el DNI o código {$dni}.",
            ], 404);
        }

        return response()->json([
            'data' => new AdmisionPostulacionResource($postulacion),
        ]);
    }

    /**
     * Registrar y validar el pago en Tesorería, habilitando el Código de FUT correlativo.
     */
    public function registrarPago(ValidarPagoPostulacionRequest $request, AdmisionPostulacion $postulacion): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($postulacion, $validated) {
            $year = date('Y');

            // Habilitar y generar número de FUT reutilizando correlativos liberados
            if (!$postulacion->numero_fut) {
                $prefixFut = sprintf('FUT-%s-', $year);
                $existingFuts = AdmisionPostulacion::whereNotNull('numero_fut')
                    ->pluck('numero_fut')
                    ->map(fn($f) => (int) str_replace($prefixFut, '', $f))
                    ->filter()
                    ->toArray();

                $nextFutNum = 1;
                while (in_array($nextFutNum, $existingFuts)) {
                    $nextFutNum++;
                }
                $postulacion->numero_fut = sprintf('%s%04d', $prefixFut, $nextFutNum);
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
            'message' => "Pago registrado exitosamente en Tesorería. Se ha generado y habilitado el Código de FUT: {$postulacion->numero_fut}",
            'numero_fut' => $postulacion->numero_fut,
            'data' => new AdmisionPostulacionResource($postulacion),
        ]);
    }
}
