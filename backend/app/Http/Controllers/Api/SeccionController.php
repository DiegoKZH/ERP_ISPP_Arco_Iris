<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SeccionController extends Controller
{
    /**
     * Listar secciones (admite filtros por especialidad_codigo o solo_activos)
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('secciones');

            if ($request->filled('especialidad_codigo')) {
                $query->where('especialidad_codigo', $request->especialidad_codigo);
            }

            if ($request->filled('carrera_id')) {
                $query->where(function ($q) use ($request) {
                    $q->where('especialidad_codigo', $request->carrera_id)
                      ->orWhere('especialidad_id', $request->carrera_id);
                });
            }

            if ($request->has('solo_activos') && $request->solo_activos == 1) {
                $query->where('estado', 'ACTIVO');
            }

            $secciones = $query->orderBy('codigo', 'asc')->get();

            return response()->json([
                'success' => true,
                'data'    => $secciones
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener secciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar una nueva sección
     */
    public function store(Request $request)
    {
        $request->validate([
            'codigo'              => 'required|string|max:10',
            'nombre'              => 'nullable|string|max:100',
            'estado'              => 'nullable|string|in:ACTIVO,INACTIVO',
            'especialidad_codigo' => 'nullable|string|max:20',
            'carrera_id'          => 'nullable|string|max:20'
        ]);

        try {
            $codigo = strtoupper(trim($request->codigo));
            $especialidadCodigo = $request->especialidad_codigo ?? $request->carrera_id;

            $id = DB::table('secciones')->insertGetId([
                'codigo'              => $codigo,
                'nombre'              => $request->nombre ? trim($request->nombre) : "SECCIÓN {$codigo}",
                'estado'              => $request->estado ?? 'ACTIVO',
                'especialidad_codigo' => $especialidadCodigo ? strtoupper(trim($especialidadCodigo)) : null,
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sección registrada correctamente.',
                'data'    => ['id' => $id, 'codigo' => $codigo]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar la sección: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Consultar una sección por código
     */
    public function show($codigo)
    {
        try {
            $seccion = DB::table('secciones')->where('codigo', $codigo)->first();

            if (!$seccion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sección no encontrada.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $seccion
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al consultar sección: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una sección
     */
    public function update(Request $request, $codigo)
    {
        $request->validate([
            'nombre'              => 'nullable|string|max:100',
            'estado'              => 'nullable|string|in:ACTIVO,INACTIVO',
            'especialidad_codigo' => 'nullable|string|max:20'
        ]);

        try {
            $datos = [
                'updated_at' => now(),
            ];

            if ($request->filled('nombre')) {
                $datos['nombre'] = trim($request->nombre);
            }

            if ($request->filled('estado')) {
                $datos['estado'] = $request->estado;
            }

            if ($request->filled('especialidad_codigo')) {
                $datos['especialidad_codigo'] = strtoupper(trim($request->especialidad_codigo));
            }

            $actualizado = DB::table('secciones')->where('codigo', $codigo)->update($datos);

            return response()->json([
                'success' => true,
                'message' => 'Sección actualizada correctamente.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar sección: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una sección (admite borrado por código y especialidad)
     */
    public function destroy(Request $request, $codigo)
    {
        try {
            $query = DB::table('secciones')->where('codigo', $codigo);

            if ($request->filled('especialidad_codigo')) {
                $query->where('especialidad_codigo', $request->especialidad_codigo);
            } elseif ($request->filled('carrera_id')) {
                $query->where('especialidad_codigo', $request->carrera_id);
            }

            $eliminado = $query->delete();

            if (!$eliminado) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró la sección para eliminar.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => "Sección {$codigo} eliminada correctamente."
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar sección: ' . $e->getMessage()
            ], 500);
        }
    }
}