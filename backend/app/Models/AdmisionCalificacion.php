<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmisionCalificacion extends Model
{
    use HasFactory;

    protected $table = 'admision_calificaciones';

    protected $fillable = [
        'admision_postulacion_id',
        'admision_evaluacion_id',
        'puntaje',
        'evaluador_user_id',
    ];

    protected function casts(): array
    {
        return [
            'puntaje' => 'decimal:2',
        ];
    }

    public function postulacion(): BelongsTo
    {
        return $this->belongsTo(AdmisionPostulacion::class, 'admision_postulacion_id');
    }

    public function evaluacion(): BelongsTo
    {
        return $this->belongsTo(AdmisionEvaluacion::class, 'admision_evaluacion_id');
    }

    public function evaluador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluador_user_id');
    }
}

