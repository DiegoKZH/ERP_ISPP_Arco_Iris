<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmisionPostulacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $persona = $this->persona;
        $resultado = $this->resultado;

        return [
            'id' => $this->id,
            'codigo_postulante' => $this->codigo_postulante,
            'fecha_inscripcion' => $this->fecha_inscripcion?->toIso8601String(),
            'estado_inscripcion' => $this->estado_inscripcion,
            'codigo_tesoreria' => $this->codigo_tesoreria,
            'estado_pago' => $this->estado_pago,
            'fecha_pago' => $this->fecha_pago?->toIso8601String(),
            'comprobante_pago' => $this->comprobante_pago,
            'monto_pago' => (float) $this->monto_pago,
            'numero_fut' => $this->numero_fut,
            'fecha_emision_fut' => $this->fecha_emision_fut?->toIso8601String(),
            'expediente_escolar' => [
                'colegio' => $this->colegio_fin_secundaria,
                'codigo_modular' => $this->codigo_modular_colegio,
                'anio_egreso' => $this->anio_egreso_colegio,
                'tipo_gestion' => $this->colegio_tipo_gestion,
                'departamento' => $this->colegio_departamento,
                'provincia' => $this->colegio_provincia,
                'distrito' => $this->colegio_distrito,
            ],
            'requisitos_verificados' => [
                'foto_url' => $this->foto_url,
                'tiene_copia_dni_color' => (bool) $this->tiene_copia_dni_color,
                'tiene_partida_nacimiento' => (bool) $this->tiene_partida_nacimiento,
                'tiene_certificado_nacimiento_original' => (bool) $this->tiene_certificado_nacimiento_original,
            ],
            'observaciones' => $this->observaciones,
            'persona' => [
                'id' => $persona?->id,
                'tipo_documento' => $persona?->tipo_documento,
                'numero_documento' => $persona?->numero_documento,
                'nombre_completo' => $persona?->nombre_completo,
                'nombres' => $persona?->nombres,
                'apellido_paterno' => $persona?->apellido_paterno,
                'apellido_materno' => $persona?->apellido_materno,
                'celular' => $persona?->celular,
                'email_personal' => $persona?->email_personal,
                'direccion' => $persona?->direccion,
            ],
            'programa_postulado' => [
                'id' => $this->programaOfertado?->programaEstudio?->id,
                'nombre' => $this->programaOfertado?->programaEstudio?->nombre,
                'codigo' => $this->programaOfertado?->programaEstudio?->codigo,
                'modalidad' => $this->programaOfertado?->modalidad?->nombre,
            ],
            'ambiente' => [
                'aula' => $this->ambienteAsignado?->ambiente?->codigo_aula,
                'pabellon' => $this->ambienteAsignado?->ambiente?->pabellon,
                'numero_asiento' => $this->ambienteAsignado?->numero_asiento,
                'asistio' => $this->ambienteAsignado?->asistio,
            ],
            'calificaciones' => $this->calificaciones->map(fn($c) => [
                'evaluacion' => $c->evaluacion?->nombre,
                'peso' => (float) $c->evaluacion?->peso_porcentual,
                'puntaje' => (float) $c->puntaje,
            ]),
            'resultado' => $resultado ? [
                'puntaje_final' => (float) $resultado->puntaje_final,
                'orden_merito' => $resultado->orden_merito,
                'condicion' => $resultado->condicion,
                'es_adjudicado' => $resultado->es_adjudicado,
                'constancia' => $this->constancia ? [
                    'codigo_constancia' => $this->constancia->codigo_constancia,
                    'fecha_emision' => $this->constancia->fecha_emision?->format('Y-m-d'),
                ] : null,
            ] : null,
        ];
    }
}

