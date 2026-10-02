<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Override;

class PreInscribirPostulacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // PROCESO DE ADMISION
            'admision_proceso_id' => [
                'required', 
                'integer',
                'exists:admision_procesos,id'
            ],

            // PROGRAMAs OFERTADOs
            'admision_programa_ofertado_id' => [
                'required', 
                'integer',
                'exists:admision_programas_ofertados,id'
            ],

            // TIPO DE DOCUMENTO
            'tipo_documento' => [
                'required', 
                'string', 
                Rule::in(['DNI', 'CE', 'PASAPORTE']),
            ],

            // NUMERO DEL DOCUMENTO
            'numero_documento' => [
                'required',
                'string',
                'max:20',
                'regex:/^[A-Za-z0-9-]+$/',
            ],

            // NOMBRES DEL POSTULANTE
            'nombres' => [
                'required', 
                'string', 
                'max:100'
            ],

            // APELLIDO PATERNO DEL POSTULANTE
            'apellido_paterno' => [
                'required', 
                'string', 
                'max:100'
            ],

            // APELLIDO MATERNO DEL POSTULANTE
            'apellido_materno' => [
                'required', 
                'string', 
                'max:100'
            ],

            // FECHA DE NACIMIENTO
            'fecha_nacimiento' => [
                'nullable',
                'date_format:Y-m-d',
                'before_or_equal:' . now()->subYears(13)->toDateString(),
            ],

            // SEXO DEL POSTULANTE
            'sexo' => [
                'nullable', 
                Rule::in(['M', 'F'])
            ],

            // DIRECCIÓN DEL POSTULANTE
            'direccion' => [
                'nullable', 
                'string', 
                'max:255'
            ],

            // NUMERO DE CELULAR
            'celular' => [
                'nullable', 
                'string', 
                'max:20',
                'regex:/^[0-9+\s()-]+$/'
            ],

            // CORREO ELECTRONICO
            'email_personal' => [
                'nullable', 
                'email', 
                'max:150'
            ],

            // OBSERVACIONES EN CASO LAS HAYA
            'observaciones' => [
                'nullable', 
                'string',
                'max:1000'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'admision_proceso_id.required' => 'Debe seleccionar un proceso de admision.',
            'admision_proceso_id.exists' => 'El proceso de admisión seleccionado no existe.',
            'admision_programa_ofertado_id.required' => 'Debe seleccionar un programa de estudios.',
            'admision_programa_ofertado_id.exists' => 'El programa de estudios no existe.',
            'tipo_documento.required' => 'Debe seleccionar su tipo de documento',
            'tipo_documento.in' => 'El tipo de documento no es valido',
            'numero_documento.required' => 'El número del documento es requerido (será su código de tesorería).',
            'numero_documento.regex' => 'El número del documento contiene caracteres que no estan permitidos.',
            'numero_documento.max' => 'El número del documento no debe tener mas de 20 caracteres.',
            'nombres.required' => 'Los nombres del postulante son obligatorios.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'apellido_materno.required' => 'El apellido materno es obligatorio.',
            'fecha_nacimiento.date' => 'La fecha de nacimientos no tiene un formato valido.',
            'fecha_nacimiento.date_format' => 'Ingrese una fecha de nacimiento válida. Verifique el día, mes y año.',
            'fecha_nacimiento.before_or_equal' => 'El postulante debe tener al menos 13 años de edad.',
            'sexo.in' => 'El sexo seleccionado no es valido.', 
            'celular.regex' => 'El número de celular contiene caracteres no permitidos',
            'email_personal.email' => 'Ingrese un correo electronico valido',
            'observaciones.max' => 'Las observaciones no deben superar mas de los 1000 caracteres'
        ];
    }

    // CONVERTIR TODOS LOS TEXTOS INGRESADOS A MAYUSCULAS     
    protected function prepareForValidation(): void
    {
        $this->merge([

            // TIPO DE DOCUMENTO
            'tipo_documento' => strtoupper(
                trim((string) $this->input('tipo_documento'))
            ),

            // NUMERO DE DOCUMENTO
            'numero_documento' => strtoupper(
                trim((string) $this->input('numero_documento'))
            ),

            // NOMBRES EN MAYUSCULAS
            'nombres' => mb_strtoupper(
                trim((string) $this->input('nombres')),
                'UTF-8'
            ),

            // APELLIDO PATERNO EN MAYUSCULAS
            'apellido_paterno' => mb_strtoupper(
                trim((string) $this->input('apellido_paterno')),
                'UTF-8'
            ),

            // APELLIDO MATERNO EN MAYUSCULAS
            'apellido_materno' => mb_strtoupper(
                trim((string) $this->input('apellido_materno')),
                'UTF-8'
            ),

            // CORREO ELECTRONICO EN MINUSCULAS
            'email_personal' => $this->filled('email_personal')
                ? strtolower(trim($this->input('email_personal')))
                : null,
        ]);
    }
}
