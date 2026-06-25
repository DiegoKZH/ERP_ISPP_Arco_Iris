<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LandingController extends Controller
{
    public function getStats()
    {
        // Simulamos datos que vendrían de la base de datos más adelante
        return response()->json([
            'status' => 'Conectado exitosamente',
            'sistema' => 'ERP-INSTITUTO',
            'versiones' => 'Laravel + React + Vite',
            'alumnos_matriculados' => 1420
        ]);
    }
}