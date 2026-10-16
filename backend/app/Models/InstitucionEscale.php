<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstitucionEscale extends Model
{
    protected $table = 'instituciones_escale';

    protected $primaryKey = 'id_institucion';

    public $timestamps = false;

    protected $guarded = [];
}

