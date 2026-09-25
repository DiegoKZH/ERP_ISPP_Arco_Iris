<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmisionRequisito extends Model
{
    use HasFactory;

    protected $table = 'admision_requisitos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'es_obligatorio',
        'formato_permitido',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'es_obligatorio' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function modalidades(): BelongsToMany
    {
        return $this->belongsToMany(
            AdmisionModalidad::class,
            'admision_modalidad_requisitos',
            'admision_requisito_id',
            'admision_modalidad_id'
        );
    }

    public function documentosPostulantes(): HasMany
    {
        return $this->hasMany(AdmisionDocumentoPostulante::class, 'admision_requisito_id');
    }
}

