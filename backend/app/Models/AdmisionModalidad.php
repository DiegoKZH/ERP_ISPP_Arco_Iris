<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmisionModalidad extends Model
{
    use HasFactory;

    protected $table = 'admision_modalidades';

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'tipo',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function requisitos(): BelongsToMany
    {
        return $this->belongsToMany(
            AdmisionRequisito::class,
            'admision_modalidad_requisitos',
            'admision_modalidad_id',
            'admision_requisito_id'
        );
    }

    public function programasOfertados(): HasMany
    {
        return $this->hasMany(AdmisionProgramaOfertado::class, 'admision_modalidad_id');
    }
}

