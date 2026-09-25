<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProgramaEstudio extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'programas_estudio';

    protected $fillable = [
        'codigo',
        'nombre',
        'nivel_academico',
        'duracion_semestres',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'duracion_semestres' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function ofertasAdmision(): HasMany
    {
        return $this->hasMany(AdmisionProgramaOfertado::class, 'programa_estudio_id');
    }

    public function estudiantes(): HasMany
    {
        return $this->hasMany(Estudiante::class, 'programa_estudio_id');
    }
}

