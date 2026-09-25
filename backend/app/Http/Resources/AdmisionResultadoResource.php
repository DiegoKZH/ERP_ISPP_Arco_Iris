<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmisionResultadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $postulacion = $this->postulacion;
        $persona = $postulacion?->persona;
        $programa = $postulacion?->programaOfertado?->programaEstudio;
        $modalidad = $postulacion?->programaOfertado?->modalidad;

        return [
            'id' => $this->id,
            'orden_merito' => $this->orden_merito,
            'codigo_postulante' => $postulacion?->codigo_postulante,
            'documento' => $persona?->numero_documento,
            'postulante' => $persona?->nombre_completo,
            'programa' => $programa?->nombre,
            'modalidad' => $modalidad?->nombre,
            'puntaje_final' => (float) $this->puntaje_final,
            'condicion' => $this->condicion,
            'es_adjudicado' => (bool) $this->es_adjudicado,
            'tiene_constancia' => $postulacion?->constancia()->exists(),
            'codigo_constancia' => $postulacion?->constancia?->codigo_constancia,
        ];
    }
}

