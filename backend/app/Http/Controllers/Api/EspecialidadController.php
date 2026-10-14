<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Especialidad;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EspecialidadController extends Controller
{
    /**
     * Listar especialidades (con filtros)
     */
    public function index(Request $request)
    {
        $query = Especialidad::query();

        // Filtrar solo los activos si el checkbox está marcado en React
        if ($request->input('solo_activos') == 1) {
            $query->where('estado', 'ACTIVO');
        }

        // Búsqueda opcional por código o nombre
        if ($request->filled('buscar')) {
            $buscar = $request->input('buscar');
            $query->where(function ($q) use ($buscar) {
                $q->where('codigo', 'like', "%{$buscar}%")
                  ->orWhere('nombre', 'like', "%{$buscar}%");
            });
        }

        // Devuelve ordenado alfabéticamente por código
        return response()->json($query->orderBy('codigo', 'asc')->get());
    }

    /**
     * Obtener una especialidad por su código
     */
    public function show(string $codigo)
    {
        $especialidad = Especialidad::where('codigo', $codigo)->firstOrFail();

        return response()->json([
            'data' => $especialidad
        ]);
    }

    /**
     * Crear una nueva especialidad
     */
    public function store(Request $request)
    {
        $datos = $request->validate([
            'codigo' => 'required|string|max:50|unique:especialidades,codigo',
            'nombre' => 'required|string|max:200',
            'estado' => 'required|string|in:ACTIVO,INACTIVO',
        ]);

        $datos['codigo'] = strtoupper(trim($datos['codigo']));
        $datos['nombre'] = trim($datos['nombre']);

        $especialidad = Especialidad::create($datos);

        return response()->json([
            'message' => 'Especialidad creada correctamente.',
            'data'    => $especialidad
        ], 201);
    }

    /**
     * Actualizar especialidad existente buscando por código
     */
    public function update(Request $request, string $codigo)
    {
        $especialidad = Especialidad::where('codigo', $codigo)->firstOrFail();

        $datos = $request->validate([
            'codigo' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('especialidades', 'codigo')->ignore($especialidad->id),
            ],
            'nombre' => 'required|string|max:200',
            'estado' => 'required|string|in:ACTIVO,INACTIVO',
        ]);

        if (isset($datos['codigo'])) {
            $datos['codigo'] = strtoupper(trim($datos['codigo']));
        }
        $datos['nombre'] = trim($datos['nombre']);

        $especialidad->update($datos);

        return response()->json([
            'message' => 'Especialidad actualizada correctamente.',
            'data'    => $especialidad
        ]);
    }

    /**
     * Eliminar especialidad por código
     */
    public function destroy(string $codigo)
    {
        $especialidad = Especialidad::where('codigo', $codigo)->firstOrFail();
        $especialidad->delete();

        return response()->json([
            'message' => 'Especialidad eliminada correctamente.'
        ]);
    }
}