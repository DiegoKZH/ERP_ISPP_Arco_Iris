<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmisionDocumentoPostulante extends Model
{
    use HasFactory;

    protected $table = 'admision_documentos_postulante';

    protected $fillable = [
        'admision_postulacion_id',
        'admision_requisito_id',
        'archivo_url',
        'estado',
        'observacion',
        'validado_por_user_id',
        'fecha_validacion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_validacion' => 'datetime',
        ];
    }

    public function postulacion(): BelongsTo
    {
        return $this->belongsTo(AdmisionPostulacion::class, 'admision_postulacion_id');
    }

    public function requisito(): BelongsTo
    {
        return $this->belongsTo(AdmisionRequisito::class, 'admision_requisito_id');
    }

    public function validadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validado_por_user_id');
    }
}

