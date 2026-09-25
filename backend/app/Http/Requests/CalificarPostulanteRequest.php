<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CalificarPostulanteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'calificaciones' => ['required', 'array', 'min:1'],
            'calificaciones.*.admision_evaluacion_id' => ['required', 'exists:admision_evaluaciones,id'],
            'calificaciones.*.puntaje' => ['required', 'numeric', 'min:0', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'calificaciones.required' => 'Debe enviar el conjunto de calificaciones.',
            'calificaciones.*.puntaje.required' => 'El puntaje es obligatorio para cada evaluación.',
            'calificaciones.*.puntaje.min' => 'El puntaje mínimo es 0.',
            'calificaciones.*.puntaje.max' => 'El puntaje máximo es 20.',
        ];
    }
}

