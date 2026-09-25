<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmisionProgramaOfertado extends Model
{
    use HasFactory;

    protected $table = 'admision_programas_ofertados';

    protected $fillable = [
        'admision_proceso_id',
        'programa_estudio_id',
        'admision_modalidad_id',
        'vacantes',
    ];

    protected function casts(): array
    {
        return [
            'vacantes' => 'integer',
        ];
    }

    public function proceso(): BelongsTo
    {
        return $this->belongsTo(AdmisionProceso::class, 'admision_proceso_id');
    }

    public function programaEstudio(): BelongsTo
    {
        return $this->belongsTo(ProgramaEstudio::class, 'programa_estudio_id');
    }

    public function modalidad(): BelongsTo
    {
        return $this->belongsTo(AdmisionModalidad::class, 'admision_modalidad_id');
    }

    public function postulaciones(): HasMany
    {
        return $this->hasMany(AdmisionPostulacion::class, 'admision_programa_ofertado_id');
    }
}

