<?php

use Illuminate\Support\Facades\Route;

// Ruta Catch-all para que React Router (o la SPA en general) maneje la navegación
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');