<?php

use App\Http\Controllers\Api\AdmisionPostulacionController;
use App\Http\Controllers\Api\AdmisionProcesoController;
use App\Http\Controllers\Api\AdmisionResultadoController;
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

// Admission Management (Módulo 08)
Route::middleware(['auth:sanctum'])->prefix('admision')->group(function () {
    // Procesos
    // Procesos (Convocatorias)
    Route::get('/procesos', [AdmisionProcesoController::class, 'index'])->middleware('permission:admision.procesos.ver');
    Route::post('/procesos', [AdmisionProcesoController::class, 'store'])->middleware('permission:admision.procesos.crear');
    Route::get('/procesos/{proceso}', [AdmisionProcesoController::class, 'show'])->middleware('permission:admision.procesos.ver');
    Route::patch('/procesos/{proceso}/toggle-estado', [AdmisionProcesoController::class, 'toggleEstado'])->middleware('permission:admision.procesos.editar');

    // Postulaciones y Flujo Oficial de Admisión
    Route::get('/postulaciones', [AdmisionPostulacionController::class, 'index'])->middleware('permission:admision.postulantes.ver');
    Route::get('/postulaciones/consultar-dni/{dni}', [AdmisionPostulacionController::class, 'consultarPorDni'])->middleware('permission:admision.postulantes.ver|admision.postulantes.inscribir');
    Route::post('/postulaciones', [AdmisionPostulacionController::class, 'store'])->middleware('permission:admision.postulantes.inscribir');
    Route::post('/postulaciones/pre-inscribir', [AdmisionPostulacionController::class, 'preInscribir'])->middleware('permission:admision.postulantes.inscribir');
    Route::get('/postulaciones/{postulacion}', [AdmisionPostulacionController::class, 'show'])->middleware('permission:admision.postulantes.ver');
    Route::post('/postulaciones/{postulacion}/validar-pago', [AdmisionPostulacionController::class, 'validarPago'])->middleware('permission:admision.postulantes.inscribir');
    Route::post('/postulaciones/{postulacion}/completar-expediente', [AdmisionPostulacionController::class, 'completarExpediente'])->middleware('permission:admision.postulantes.inscribir');
    Route::get('/postulaciones/{postulacion}/fut-documento', [AdmisionPostulacionController::class, 'futDocumento'])->middleware('permission:admision.postulantes.ver');
    Route::get('/postulaciones/{postulacion}/declaracion-jurada', [AdmisionPostulacionController::class, 'declaracionJurada'])->middleware('permission:admision.postulantes.ver');

    // Calificaciones y Cuadro de Mérito
    Route::get('/procesos/{proceso}/cuadro-merito', [AdmisionResultadoController::class, 'cuadroMerito'])->middleware('permission:admision.resultados.ver');
    Route::post('/postulaciones/{postulacion}/calificar', [AdmisionResultadoController::class, 'calificar'])->middleware('permission:admision.postulantes.evaluar');
    Route::post('/postulaciones/{postulacion}/emitir-constancia', [AdmisionResultadoController::class, 'emitirConstancia'])->middleware('permission:admision.constancias.emitir');
    Route::post('/postulaciones/{postulacion}/ratificar-matricula', [AdmisionResultadoController::class, 'ratificarMatricula'])->middleware('permission:admision.constancias.emitir');
});

// Tesorería & Caja (Módulo de Pagos y Emisión de FUT)
Route::middleware(['auth:sanctum'])->prefix('tesoreria')->group(function () {
    Route::get('/pagos-admision', [\App\Http\Controllers\Api\TesoreriaPagoController::class, 'index'])->middleware('permission:admision.postulantes.ver|admision.postulantes.inscribir');
    Route::get('/pagos-admision/consultar/{dni}', [\App\Http\Controllers\Api\TesoreriaPagoController::class, 'consultarDni'])->middleware('permission:admision.postulantes.ver|admision.postulantes.inscribir');
    Route::post('/pagos-admision/{postulacion}/registrar-pago', [\App\Http\Controllers\Api\TesoreriaPagoController::class, 'registrarPago'])->middleware('permission:admision.postulantes.inscribir');
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

