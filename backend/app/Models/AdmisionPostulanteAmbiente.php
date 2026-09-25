<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmisionPostulanteAmbiente extends Model
{
    use HasFactory;

    protected $table = 'admision_postulante_ambiente';

    protected $fillable = [
        'admision_postulacion_id',
        'admision_ambiente_id',
        'numero_asiento',
        'asistio',
    ];

    protected function casts(): array
    {
        return [
            'numero_asiento' => 'integer',
            'asistio' => 'boolean',
        ];
    }

    public function postulacion(): BelongsTo
    {
        return $this->belongsTo(AdmisionPostulacion::class, 'admision_postulacion_id');
    }

    public function ambiente(): BelongsTo
    {
        return $this->belongsTo(AdmisionAmbiente::class, 'admision_ambiente_id');
    }
}

