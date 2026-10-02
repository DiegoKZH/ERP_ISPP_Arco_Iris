<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdmisionProcesoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'periodo_academico_id' => ['nullable', 'exists:periodos_academicos,id'],
            'nombre' => ['required', 'string', 'max:150'],
            'codigo' => ['required', 'string', 'max:30', 'unique:admision_procesos,codigo'],
            'fecha_inicio_inscripcion' => ['required', 'date'],
            'fecha_fin_inscripcion' => ['required', 'date', 'after_or_equal:fecha_inicio_inscripcion'],
            'fecha_evaluacion' => ['required', 'date', 'after_or_equal:fecha_fin_inscripcion'],
            'fecha_publicacion_resultados' => ['required', 'date', 'after_or_equal:fecha_evaluacion'],
            'puntaje_minimo_aprobatorio' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'estado' => ['nullable', 'string', 'in:CONVOCATORIA_ABIERTA,CONVOCATORIA_CERRADA,ABIERTA,CERRADA'],
            'vacantes_inicial' => ['nullable', 'integer', 'min:1'],
            'vacantes_fisica' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la convocatoria es obligatorio.',
            'codigo.required' => 'El código identificador de la convocatoria es obligatorio.',
            'codigo.unique' => 'Ya existe una convocatoria registrada con ese código.',
            'fecha_inicio_inscripcion.required' => 'La fecha de inicio de inscripciones es requerida.',
            'fecha_fin_inscripcion.required' => 'La fecha de fin de inscripciones es requerida.',
            'fecha_evaluacion.required' => 'La fecha de evaluación es requerida.',
            'fecha_publicacion_resultados.required' => 'La fecha de publicación de resultados es requerida.',
        ];
    }
}
