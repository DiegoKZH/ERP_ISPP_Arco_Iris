<?php

use App\Http\Controllers\LandingController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Esta ruta carga la vista base (Blade) donde se montará React
Route::get('/', function () {
    return view('welcome');
});

// Esta ruta interactúa con tu Frontend mediante una petición Fetch/Axios
Route::get('/api/landing-stats', [LandingController::class, 'getStats']);

Route::get('/login', function () {
    return view('auth.login');
});