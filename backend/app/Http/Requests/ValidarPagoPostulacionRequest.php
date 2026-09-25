<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidarPagoPostulacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'comprobante_pago' => ['required', 'string', 'max:50'],
            'monto_pago' => ['nullable', 'numeric', 'min:0'],
            'fecha_pago' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'comprobante_pago.required' => 'El número de recibo de tesorería u operación es obligatorio.',
        ];
    }
}

