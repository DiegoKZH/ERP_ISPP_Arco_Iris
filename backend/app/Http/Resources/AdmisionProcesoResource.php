<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmisionProcesoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'periodo' => $this->periodoAcademico?->codigo,
            'fecha_inicio_inscripcion' => $this->fecha_inicio_inscripcion?->format('Y-m-d'),
            'fecha_fin_inscripcion' => $this->fecha_fin_inscripcion?->format('Y-m-d'),
            'fecha_evaluacion' => $this->fecha_evaluacion?->format('Y-m-d'),
            'fecha_publicacion_resultados' => $this->fecha_publicacion_resultados?->format('Y-m-d'),
            'puntaje_minimo_aprobatorio' => (float) $this->puntaje_minimo_aprobatorio,
            'estado' => $this->estado,
            'total_postulantes' => $this->postulaciones()->count(),
            'programas_ofertados' => $this->programasOfertados->map(fn($o) => [
                'id' => $o->id,
                'programa' => $o->programaEstudio?->nombre,
                'codigo_programa' => $o->programaEstudio?->codigo,
                'modalidad' => $o->modalidad?->nombre,
                'vacantes' => $o->vacantes,
                'postulantes_inscritos' => $o->postulaciones()->count(),
            ]),
            'evaluaciones' => $this->evaluaciones->map(fn($e) => [
                'id' => $e->id,
                'nombre' => $e->nombre,
                'peso_porcentual' => (float) $e->peso_porcentual,
                'puntaje_maximo' => (float) $e->puntaje_maximo,
                'orden' => $e->orden,
            ]),
        ];
    }
}

