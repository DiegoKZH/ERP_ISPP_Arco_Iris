<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmisionConstancia extends Model
{
    use HasFactory;

    protected $table = 'admision_constancias';

    protected $fillable = [
        'admision_postulacion_id',
        'codigo_constancia',
        'fecha_emision',
        'hash_seguridad',
        'emitido_por_user_id',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
        ];
    }

    public function postulacion(): BelongsTo
    {
        return $this->belongsTo(AdmisionPostulacion::class, 'admision_postulacion_id');
    }

    public function emitidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'emitido_por_user_id');
    }
}

