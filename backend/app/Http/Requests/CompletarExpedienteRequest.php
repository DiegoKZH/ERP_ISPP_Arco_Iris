<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompletarExpedienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'colegio_fin_secundaria' => ['required', 'string', 'max:200'],
            'codigo_modular_colegio' => ['required', 'string', 'max:10'],
            'anio_egreso_colegio' => ['required', 'integer', 'min:1950', 'max:' . (date('Y') + 1)],
            'colegio_tipo_gestion' => ['nullable', 'string', 'in:PUBLICA,PRIVADA'],
            'colegio_departamento' => ['nullable', 'string', 'max:50'],
            'colegio_provincia' => ['nullable', 'string', 'max:50'],
            'colegio_distrito' => ['nullable', 'string', 'max:50'],
            'foto_url' => ['nullable', 'string', 'max:255'],
            'tiene_copia_dni_color' => ['required', 'boolean'],
            'tiene_partida_nacimiento' => ['required', 'boolean'],
            'tiene_certificado_nacimiento_original' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'colegio_fin_secundaria.required' => 'El nombre del colegio de secundaria es obligatorio.',
            'codigo_modular_colegio.required' => 'El código modular de la institución educativa es obligatorio.',
            'anio_egreso_colegio.required' => 'El año de egreso es obligatorio.',
        ];
    }
}

