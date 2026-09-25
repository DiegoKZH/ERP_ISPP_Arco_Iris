<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmisionProceso extends Model
{
    use HasFactory;

    protected $table = 'admision_procesos';

    protected $fillable = [
        'periodo_academico_id',
        'nombre',
        'codigo',
        'fecha_inicio_inscripcion',
        'fecha_fin_inscripcion',
        'fecha_evaluacion',
        'fecha_publicacion_resultados',
        'puntaje_minimo_aprobatorio',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio_inscripcion' => 'date',
            'fecha_fin_inscripcion' => 'date',
            'fecha_evaluacion' => 'date',
            'fecha_publicacion_resultados' => 'date',
            'puntaje_minimo_aprobatorio' => 'decimal:2',
        ];
    }

    public function periodoAcademico(): BelongsTo
    {
        return $this->belongsTo(PeriodoAcademico::class, 'periodo_academico_id');
    }

    public function programasOfertados(): HasMany
    {
        return $this->hasMany(AdmisionProgramaOfertado::class, 'admision_proceso_id');
    }

    public function postulaciones(): HasMany
    {
        return $this->hasMany(AdmisionPostulacion::class, 'admision_proceso_id');
    }

    public function ambientes(): HasMany
    {
        return $this->hasMany(AdmisionAmbiente::class, 'admision_proceso_id');
    }

    public function evaluaciones(): HasMany
    {
        return $this->hasMany(AdmisionEvaluacion::class, 'admision_proceso_id')->orderBy('orden');
    }
}

