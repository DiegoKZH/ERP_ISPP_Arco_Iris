<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estudiante extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'estudiantes';

    protected $fillable = [
        'persona_id',
        'programa_estudio_id',
        'admision_postulacion_id',
        'codigo_estudiante',
        'fecha_ingreso',
        'estado_academico',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'fecha_ingreso' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'persona_id');
    }

    public function programaEstudio(): BelongsTo
    {
        return $this->belongsTo(ProgramaEstudio::class, 'programa_estudio_id');
    }

    public function postulacionOrigen(): BelongsTo
    {
        return $this->belongsTo(AdmisionPostulacion::class, 'admision_postulacion_id');
    }
}

