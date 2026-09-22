<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
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
Route::middleware(['auth:sanctum'])->prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index'])->middleware('permission:usuarios.usuarios.ver');
    Route::post('/', [UserController::class, 'store'])->middleware('permission:usuarios.usuarios.crear');
    Route::get('/{user}', [UserController::class, 'show'])->middleware('permission:usuarios.usuarios.ver');
    Route::put('/{user}', [UserController::class, 'update'])->middleware('permission:usuarios.usuarios.editar');
    
    Route::patch('/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->middleware('permission:usuarios.usuarios.deshabilitar|usuarios.usuarios.reactivar');
});

// Roles Management
Route::middleware(['auth:sanctum'])->prefix('roles')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->middleware('permission:usuarios.roles.ver');
    Route::post('/', [RoleController::class, 'store'])->middleware('permission:usuarios.roles.crear');
    Route::get('/{role}', [RoleController::class, 'show'])->middleware('permission:usuarios.roles.ver');
    Route::put('/{role}', [RoleController::class, 'update'])->middleware('permission:usuarios.roles.editar');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:usuarios.roles.eliminar');
});

// Testing & Verification Protected Routes
if (app()->environment('testing', 'local')) {
    Route::middleware(['auth:sanctum', 'permission:usuarios.usuarios.crear'])->get('/test-permission', function () {
        return response()->json(['message' => 'Permiso concedido']);
    });

    Route::middleware(['auth:sanctum', 'role:admin'])->get('/test-role', function () {
        return response()->json(['message' => 'Rol concedido']);
    });
}

