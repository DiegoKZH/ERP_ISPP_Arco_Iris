<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdmisionPostulacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'admision_postulaciones';

    protected $fillable = [
        'codigo_postulante',
        'persona_id',
        'admision_proceso_id',
        'admision_programa_ofertado_id',
        'codigo_tesoreria',
        'estado_pago',
        'fecha_pago',
        'comprobante_pago',
        'monto_pago',
        'numero_fut',
        'fecha_emision_fut',
        'colegio_fin_secundaria',
        'codigo_modular_colegio',
        'anio_egreso_colegio',
        'colegio_tipo_gestion',
        'colegio_departamento',
        'colegio_provincia',
        'colegio_distrito',
        'foto_url',
        'tiene_copia_dni_color',
        'tiene_partida_nacimiento',
        'tiene_certificado_nacimiento_original',
        'fecha_inscripcion',
        'estado_inscripcion',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inscripcion' => 'datetime',
            'fecha_pago' => 'datetime',
            'fecha_emision_fut' => 'datetime',
            'monto_pago' => 'decimal:2',
            'anio_egreso_colegio' => 'integer',
            'tiene_copia_dni_color' => 'boolean',
            'tiene_partida_nacimiento' => 'boolean',
            'tiene_certificado_nacimiento_original' => 'boolean',
        ];
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'persona_id');
    }

    public function proceso(): BelongsTo
    {
        return $this->belongsTo(AdmisionProceso::class, 'admision_proceso_id');
    }

    public function programaOfertado(): BelongsTo
    {
        return $this->belongsTo(AdmisionProgramaOfertado::class, 'admision_programa_ofertado_id');
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(AdmisionDocumentoPostulante::class, 'admision_postulacion_id');
    }

    public function ambienteAsignado(): HasOne
    {
        return $this->hasOne(AdmisionPostulanteAmbiente::class, 'admision_postulacion_id');
    }

    public function calificaciones(): HasMany
    {
        return $this->hasMany(AdmisionCalificacion::class, 'admision_postulacion_id');
    }

    public function resultado(): HasOne
    {
        return $this->hasOne(AdmisionResultado::class, 'admision_postulacion_id');
    }

    public function constancia(): HasOne
    {
        return $this->hasOne(AdmisionConstancia::class, 'admision_postulacion_id');
    }

    public function estudiante(): HasOne
    {
        return $this->hasOne(Estudiante::class, 'admision_postulacion_id');
    }
}

