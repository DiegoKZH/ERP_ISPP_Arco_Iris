<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgramaEstudio;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EspecialidadController extends Controller
{
    /**
     * Convertir el estado de la base de datos
     * al formato que utiliza el formulario.
     */
    private function formatoEspecialidad(ProgramaEstudio $programa): array
    {
        return [
            'id' => $programa->id,
            'codigo' => $programa->codigo,
            'nombre' => $programa->nombre,
            'estado' => $programa->is_active ? 'ACTIVO' : 'INACTIVO',
        ];
    }

    /**
     * Listar y filtrar especialidades.
     */
    public function index(Request $request)
    {
        $query = ProgramaEstudio::query();

        if ($request->input('solo_activos') == 1) {
            $query->where('is_active', true);
        }

        if ($request->filled('buscar')) {
            $buscar = trim($request->input('buscar'));

            $query->where(function ($q) use ($buscar) {
                $q->where('codigo', 'ilike', "%{$buscar}%")
                  ->orWhere('nombre', 'ilike', "%{$buscar}%");
            });
        }

        $programas = $query->orderBy('codigo')
            ->get()
            ->map(fn ($programa) => $this->formatoEspecialidad($programa));

        return response()->json($programas->values());
    }

    /**
     * Obtener un registro por código.
     */
    public function show(string $codigo)
    {
        $programa = ProgramaEstudio::where('codigo', $codigo)
            ->firstOrFail();

        return response()->json([
            'data' => $this->formatoEspecialidad($programa),
        ]);
    }

    /**
     * Registrar una especialidad.
     */
    public function store(Request $request)
    {
        $datos = $request->validate([
            'codigo' => [
                'required',
                'string',
                'max:30',
                'unique:programas_estudio,codigo',
            ],
            'nombre' => 'required|string|max:150',
            'estado' => 'required|in:ACTIVO,INACTIVO',
        ]);

        $datos['codigo'] = strtoupper(trim($datos['codigo']));
        $datos['nombre'] = trim($datos['nombre']);

        // Campos propios de ProgramaEstudio.
        $datosPrograma = [
            'codigo' => $datos['codigo'],
            'nombre' => $datos['nombre'],
            'nivel_academico' => 'Pregrado',
            'duracion_semestres' => 10,
            'is_active' => $datos['estado'] === 'ACTIVO',
        ];

        $programa = ProgramaEstudio::create($datosPrograma);

        return response()->json([
            'message' => 'Especialidad creada correctamente.',
            'data' => $this->formatoEspecialidad($programa),
        ], 201);
    }

    /**
     * Actualizar una especialidad por código.
     */
    public function update(Request $request, string $codigo)
    {
        $programa = ProgramaEstudio::where('codigo', $codigo)
            ->firstOrFail();

        $datos = $request->validate([
            'codigo' => [
                'sometimes',
                'required',
                'string',
                'max:30',
                Rule::unique('programas_estudio', 'codigo')
                    ->ignore($programa->id),
            ],
            'nombre' => 'required|string|max:150',
            'estado' => 'required|in:ACTIVO,INACTIVO',
        ]);

        $programa->update([
            'codigo' => strtoupper(trim(
                $datos['codigo'] ?? $programa->codigo
            )),
            'nombre' => trim($datos['nombre']),
            'is_active' => $datos['estado'] === 'ACTIVO',
        ]);

        return response()->json([
            'message' => 'Especialidad actualizada correctamente.',
            'data' => $this->formatoEspecialidad($programa),
        ]);
    }

    /**
     * Eliminar por código mediante borrado lógico.
     */
    public function destroy(string $codigo)
    {
        $programa = ProgramaEstudio::where('codigo', $codigo)
            ->firstOrFail();

        $programa->delete();

        return response()->json([
            'message' => 'Especialidad eliminada correctamente.',
        ]);
    }
}