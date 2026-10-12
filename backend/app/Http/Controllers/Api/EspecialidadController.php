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

        // Filtrar por ID de Programa Académico
        if ($request->filled('programa_academico_id')) {
            $query->where('programa_academico_id', $request->programa_academico_id);
        }

        // Filtrar solo los activos si el checkbox está marcado en React
        if ($request->input('solo_activos') == 1) {
            $query->where('estado', 'ACTIVO');
        }

        // Devuelve ordenado alfabéticamente por código
        return response()->json($query->orderBy('codigo', 'asc')->get());
    }

    /**
     * Crear una nueva especialidad
     */
    public function store(Request $request)
    {
        $datos = $request->validate([
            'programa_academico_id' => 'required|integer',
            'codigo'            => 'required|string|max:50|unique:especialidades,codigo',
            'nombre'            => 'required|string|max:200',
            'estado'            => 'required|string|in:ACTIVO,INACTIVO',
            'agil'              => 'required|string|in:SI,NO',
            'calendario'        => 'required|string|in:SI,NO',
            'admision'          => 'required|string|in:SI,NO',
            'solicitar_datos'   => 'required|string|in:SI,NO',
            'email_coordinador' => 'nullable|email|max:150',
            'grado_bachiller'   => 'nullable|string|max:150',
            'grado_titulo'      => 'nullable|string|max:150',
        ]);

        $especialidad = Especialidad::create($datos);

        return response()->json([
            'message' => 'Especialidad creada correctamente.',
            'data' => $especialidad
        ], 201);
    }

    /**
     * Actualizar especialidad existente
     */
    public function update(Request $request, Especialidad $especialidade) // Nota: Laravel usa 'especialidade' por defecto en español
    {
        $datos = $request->validate([
            'programa_academico_id' => 'required|integer',
            'codigo' => [
                'required', 'string', 'max:50',
                Rule::unique('especialidades', 'codigo')->ignore($especialidade->id)
            ],
            'nombre'            => 'required|string|max:200',
            'estado'            => 'required|string|in:ACTIVO,INACTIVO',
            'agil'              => 'required|string|in:SI,NO',
            'calendario'        => 'required|string|in:SI,NO',
            'admision'          => 'required|string|in:SI,NO',
            'solicitar_datos'   => 'required|string|in:SI,NO',
            'email_coordinador' => 'nullable|email|max:150',
            'grado_bachiller'   => 'nullable|string|max:150',
            'grado_titulo'      => 'nullable|string|max:150',
        ]);

        $especialidade->update($datos);

        return response()->json([
            'message' => 'Especialidad actualizada correctamente.',
            'data' => $especialidade
        ]);
    }

    /**
     * Eliminar especialidad
     */
    public function destroy(Especialidad $especialidade)
    {
        $especialidade->delete();
        
        return response()->json([
            'message' => 'Especialidad eliminada correctamente.'
        ]);
    }
}