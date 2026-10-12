<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Especialidad extends Model
{
    use HasFactory;

    protected $table = 'especialidades';

    protected $fillable = [
        'programa_academico_id',
        'codigo',
        'nombre',
        'estado',
        'agil',
        'calendario',
        'admision',
        'solicitar_datos',
        'email_coordinador',
        'grado_bachiller',
        'grado_titulo',
    ];
}