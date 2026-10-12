<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AlumnoController extends Controller
{
    /**
     * Listar y buscar estudiantes con paginación.
     */
    public function index(Request $request)
    {
        $query = Alumno::query();

        // Buscar por nombres, apellidos, documento o código.
        if ($request->filled('buscar')) {
            $buscar = trim($request->input('buscar'));

            $query->where(function ($q) use ($buscar) {
                $q->where('nombres', 'like', "%{$buscar}%")
                    ->orWhere('apellido_paterno', 'like', "%{$buscar}%")
                    ->orWhere('apellido_materno', 'like', "%{$buscar}%")
                    ->orWhere('numero_documento', 'like', "%{$buscar}%")
                    ->orWhere('codigo_estudiante', 'like', "%{$buscar}%");
            });
        }

        // Permitir entre 1 y 50 registros por página.
        $porPagina = min(
            max((int) $request->input('per_page', 10), 1),
            50
        );

        $alumnos = $query
            ->orderBy('id', 'desc')
            ->paginate($porPagina);

        return response()->json($alumnos);
    }

    /**
     * Registrar un estudiante.
     */
    public function store(Request $request)
    {
        $datos = $request->validate([
            'tipo_documento' => [
                'required',
                'string',
                'max:50',
            ],

            'numero_documento' => [
                'required',
                'string',
                'max:20',
                'unique:alumnos,numero_documento',
            ],

            'nombres' => [
                'required',
                'string',
                'max:100',
            ],

            // Reemplazo de 'apellidos'
            'apellido_paterno' => [
                'required',
                'string',
                'max:100',
            ],

            'apellido_materno' => [
                'nullable',
                'string',
                'max:100',
            ],

            'sexo' => [
                'nullable',
                'Rule' => Rule::in([
                    'MASCULINO',
                    'FEMENINO',
                    'OTRO',
                ]),
            ],

            'fecha_nacimiento' => [
                'nullable',
                'date',
            ],

            'codigo_estudiante' => [
                'required',
                'string',
                'max:30',
                'unique:alumnos,codigo_estudiante',
            ],

            'celular' => [
                'nullable',
                'string',
                'max:20',
            ],

            'correo_institucional' => [
                'nullable',
                'email',
                'max:150',
                'unique:alumnos,correo_institucional',
            ],

            'correo_personal' => [
                'nullable',
                'email',
                'max:150',
            ],
        ]);

        $alumno = Alumno::create($datos);

        return response()->json([
            'message' => 'Estudiante registrado correctamente.',
            'data' => $alumno,
        ], 201);
    }

    /**
     * Consultar un estudiante por su ID.
     */
    public function show(Alumno $alumno)
    {
        return response()->json([
            'data' => $alumno,
        ]);
    }

    /**
     * Actualizar los datos de un estudiante.
     */
    public function update(Request $request, Alumno $alumno)
    {
        $datos = $request->validate([
            'tipo_documento' => [
                'required',
                'string',
                'max:50',
            ],

            'numero_documento' => [
                'required',
                'string',
                'max:20',
                Rule::unique('alumnos', 'numero_documento')
                    ->ignore($alumno->id),
            ],

            'nombres' => [
                'required',
                'string',
                'max:100',
            ],

            // Reemplazo de 'apellidos'
            'apellido_paterno' => [
                'required',
                'string',
                'max:100',
            ],

            'apellido_materno' => [
                'nullable',
                'string',
                'max:100',
            ],

            'sexo' => [
                'nullable',
                'Rule' => Rule::in([
                    'MASCULINO',
                    'FEMENINO',
                    'OTRO',
                ]),
            ],

            'fecha_nacimiento' => [
                'nullable',
                'date',
            ],

            'codigo_estudiante' => [
                'required',
                'string',
                'max:30',
                Rule::unique('alumnos', 'codigo_estudiante')
                    ->ignore($alumno->id),
            ],

            'celular' => [
                'nullable',
                'string',
                'max:20',
            ],

            'correo_institucional' => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('alumnos', 'correo_institucional')
                    ->ignore($alumno->id),
            ],

            'correo_personal' => [
                'nullable',
                'email',
                'max:150',
            ],
        ]);

        $alumno->update($datos);

        return response()->json([
            'message' => 'Estudiante actualizado correctamente.',
            'data' => $alumno->fresh(),
        ]);
    }
}