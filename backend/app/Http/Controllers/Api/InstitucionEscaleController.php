<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstitucionEscale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstitucionEscaleController extends Controller
{
    public function buscar(Request $request, string $codigo): JsonResponse
    {
        if (!preg_match('/^\d{7}$/', $codigo)) {

            return response()->json([
                'message' => 'El código modular debe contener 7 dígitos.',
            ], 422);
        }

        $institucion = InstitucionEscale::query()
            ->where('COD_MOD', $codigo)
            ->first();

        if (!$institucion) {
            return response()->json([
                'message' => 'No se encontró una institución con ese código modular.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'id_institucion' => $institucion->id_institucion,
                'codigo_modular' => $institucion->COD_MOD,
                'nombre' => $institucion->CEN_EDU,
                'tipo_gestion' => $institucion->D_GESTION,
                'codigo_geografico' => $institucion->CODGEO,
                'departamento' => $institucion->D_DPTO,
                'provincia' => $institucion->D_PROV,
                'distrito' => $institucion->D_DIST,
            ],
        ]);
    }
}