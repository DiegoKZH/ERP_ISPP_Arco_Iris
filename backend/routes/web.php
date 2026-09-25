<?php

use App\Http\Controllers\Api\AdmisionPostulacionController;
use Illuminate\Support\Facades\Route;

// Rutas de impresión directa de documentos oficiales (A4 / PDF)
Route::get('/documentos/fut/{postulacion}', [AdmisionPostulacionController::class, 'imprimirFut'])->name('documentos.fut');
Route::get('/documentos/declaracion-jurada/{postulacion}', [AdmisionPostulacionController::class, 'imprimirDeclaracion'])->name('documentos.declaracion-jurada');

// Ruta Catch-all para que React Router (o la SPA en general) maneje la navegación
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');