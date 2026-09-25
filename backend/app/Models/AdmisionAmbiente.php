<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmisionAmbiente extends Model
{
    use HasFactory;

    protected $table = 'admision_ambientes';

    protected $fillable = [
        'admision_proceso_id',
        'codigo_aula',
        'pabellon',
        'capacidad',
        'responsable_user_id',
    ];

    protected function casts(): array
    {
        return [
            'capacidad' => 'integer',
        ];
    }

    public function proceso(): BelongsTo
    {
        return $this->belongsTo(AdmisionProceso::class, 'admision_proceso_id');
    }

    public function responsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsable_user_id');
    }

    public function postulantesAsignados(): HasMany
    {
        return $this->hasMany(AdmisionPostulanteAmbiente::class, 'admision_ambiente_id');
    }
}

