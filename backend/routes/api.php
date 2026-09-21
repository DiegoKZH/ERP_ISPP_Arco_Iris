<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Status & Health
Route::get('/status', function () {
    return response()->json([
        'message' => 'API conectada correctamente a React',
    ]);
});

// Authentication Endpoints
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Users Management
Route::middleware(['auth:sanctum', 'role:admin|superadmin'])->prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/{user}', [UserController::class, 'show']);
    Route::put('/{user}', [UserController::class, 'update']);
    Route::patch('/{user}/toggle-status', [UserController::class, 'toggleStatus']);
});

// Legacy User Endpoint
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Testing & Verification Protected Routes
if (app()->environment('testing', 'local')) {
    Route::middleware(['auth:sanctum', 'permission:usuarios.crear'])->get('/test-permission', function () {
        return response()->json(['message' => 'Permiso concedido']);
    });

    Route::middleware(['auth:sanctum', 'role:admin'])->get('/test-role', function () {
        return response()->json(['message' => 'Rol concedido']);
    });
}

