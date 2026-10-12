<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alumno extends Model
{
    use HasFactory;

    protected $table = 'alumnos';

    // Se agregan los nuevos campos para permitir la asignación masiva (Mass Assignment)
    protected $fillable = [
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'tipo_documento',
        'numero_documento',
        'sexo',
        'fecha_nacimiento',
        'codigo_estudiante',
        'celular',
        'correo_institucional',
        'correo_personal',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
        ];
    }
}