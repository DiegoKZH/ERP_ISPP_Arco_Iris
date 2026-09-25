<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmisionResultado extends Model
{
    use HasFactory;

    protected $table = 'admision_resultados';

    protected $fillable = [
        'admision_postulacion_id',
        'puntaje_final',
        'orden_merito',
        'condicion',
        'es_adjudicado',
    ];

    protected function casts(): array
    {
        return [
            'puntaje_final' => 'decimal:2',
            'orden_merito' => 'integer',
            'es_adjudicado' => 'boolean',
        ];
    }

    public function postulacion(): BelongsTo
    {
        return $this->belongsTo(AdmisionPostulacion::class, 'admision_postulacion_id');
    }
}

