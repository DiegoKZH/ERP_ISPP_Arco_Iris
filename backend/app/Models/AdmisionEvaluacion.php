<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmisionEvaluacion extends Model
{
    use HasFactory;

    protected $table = 'admision_evaluaciones';

    protected $fillable = [
        'admision_proceso_id',
        'nombre',
        'peso_porcentual',
        'puntaje_maximo',
        'orden',
    ];

    protected function casts(): array
    {
        return [
            'peso_porcentual' => 'decimal:2',
            'puntaje_maximo' => 'decimal:2',
            'orden' => 'integer',
        ];
    }

    public function proceso(): BelongsTo
    {
        return $this->belongsTo(AdmisionProceso::class, 'admision_proceso_id');
    }

    public function calificaciones(): HasMany
    {
        return $this->hasMany(AdmisionCalificacion::class, 'admision_evaluacion_id');
    }
}

