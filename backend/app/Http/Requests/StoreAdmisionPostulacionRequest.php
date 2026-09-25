<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdmisionPostulacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'admision_proceso_id' => ['required', 'exists:admision_procesos,id'],
            'admision_programa_ofertado_id' => ['required', 'exists:admision_programas_ofertados,id'],
            // Datos de la Persona
            'tipo_documento' => ['required', 'string', 'in:DNI,CE,PASAPORTE'],
            'numero_documento' => ['required', 'string', 'max:20'],
            'nombres' => ['required', 'string', 'max:100'],
            'apellido_paterno' => ['required', 'string', 'max:100'],
            'apellido_materno' => ['required', 'string', 'max:100'],
            'fecha_nacimiento' => ['nullable', 'date'],
            'sexo' => ['nullable', 'in:M,F'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'celular' => ['nullable', 'string', 'max:20'],
            'email_personal' => ['nullable', 'email', 'max:150'],
            'observaciones' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'admision_proceso_id.required' => 'El proceso de admisión es obligatorio.',
            'admision_programa_ofertado_id.required' => 'Debe seleccionar un programa ofertado con vacante.',
            'numero_documento.required' => 'El número de documento de identidad es obligatorio.',
            'nombres.required' => 'Los nombres son obligatorios.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'apellido_materno.required' => 'El apellido materno es obligatorio.',
        ];
    }
}

