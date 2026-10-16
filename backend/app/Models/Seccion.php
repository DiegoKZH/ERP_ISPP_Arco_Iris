<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seccion extends Model
{
    use HasFactory;

    protected $table = 'secciones';

    protected $fillable = [
        'codigo',
        'nombre',
        'estado',
        'especialidad_codigo',
    ];

    /**
     * Relación inversa: una sección pertenece a una especialidad/carrera.
     */
    public function especialidad()
    {
        return $this->belongsTo(Especialidad::class, 'especialidad_codigo', 'codigo');
    }
}