<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Persona extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'personas';

    protected $fillable = [
        'tipo_documento',
        'numero_documento',
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'fecha_nacimiento',
        'sexo',
        'direccion',
        'celular',
        'email_personal',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the full name in Peruvian formal format (Apellidos, Nombres).
     */
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->apellido_paterno} {$this->apellido_materno}, {$this->nombres}";
    }

    /**
     * User account associated with this person (if any).
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'persona_id');
    }

    /**
     * Admission applications for this person across processes.
     */
    public function postulaciones(): HasMany
    {
        return $this->hasMany(AdmisionPostulacion::class, 'persona_id');
    }

    /**
     * Student academic profile if admitted.
     */
    public function estudiante(): HasOne
    {
        return $this->hasOne(Estudiante::class, 'persona_id');
    }
}

