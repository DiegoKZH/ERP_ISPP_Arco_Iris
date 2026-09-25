<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdmisionProcesoResource;
use App\Models\AdmisionProceso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
}

