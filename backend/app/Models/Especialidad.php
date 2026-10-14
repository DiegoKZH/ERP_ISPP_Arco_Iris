<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Especialidad extends Model
{
    use HasFactory;

    protected $table = 'especialidades';

    protected $fillable = [
        'codigo',
        'nombre',
        'estado',
    ];

    /**
     * Indica a Laravel que use 'codigo' en lugar de 'id' en las rutas de la API
     */
    public function getRouteKeyName(): string
    {
        return 'codigo';
    }
}