<?php

use App\Http\Controllers\Api\AlumnoController;
use App\Http\Controllers\Api\InstitucionEscaleController;
use App\Http\Controllers\Api\AdmisionPostulacionController;
use App\Http\Controllers\Api\AdmisionProcesoController;
use App\Http\Controllers\Api\AdmisionResultadoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EspecialidadController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SeccionController;
use App\Http\Controllers\Api\TesoreriaPagoController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Alumnos Management
Route::middleware('auth:sanctum')
    ->prefix('alumnos')
    ->group(function () {
        Route::get('/', [AlumnoController::class, 'index']);
        Route::post('/', [AlumnoController::class, 'store']);
        Route::get('/{alumno}', [AlumnoController::class, 'show']);
        Route::put('/{alumno}', [AlumnoController::class, 'update']);
    });

// Especialidades Management (Por código de especialidad)
Route::middleware('auth:sanctum')
    ->prefix('especialidades')
    ->group(function () {
        Route::get('/', [EspecialidadController::class, 'index']);
        Route::post('/', [EspecialidadController::class, 'store']);
        Route::get('/{codigo}', [EspecialidadController::class, 'show']);
        Route::put('/{codigo}', [EspecialidadController::class, 'update']);
        Route::delete('/{codigo}', [EspecialidadController::class, 'destroy']);
    });

// Secciones Management (Gestión de Secciones y por Carrera)
Route::middleware('auth:sanctum')
    ->prefix('secciones')
    ->group(function () {
        Route::get('/', [SeccionController::class, 'index']);
        Route::post('/', [SeccionController::class, 'store']);
        Route::get('/{codigo}', [SeccionController::class, 'show']);
        Route::put('/{codigo}', [SeccionController::class, 'update']);
        Route::delete('/{codigo}', [SeccionController::class, 'destroy']);
    });

// Status & Health
Route::get('/status', function () {
    return response()->json([
        'message' => 'API conectada correctamente a React',
    ]);
});

// Instituciones Educativas
Route::get('/instituciones-educativas/{codigo}', [
    InstitucionEscaleController::class,
    'buscar',
]);

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
    Route::delete('/postulaciones/{postulacion}', [AdmisionPostulacionController::class, 'destroy'])->middleware('permission:admision.postulantes.inscribir');
    Route::post('/postulaciones/{postulacion}/validar-pago', [AdmisionPostulacionController::class, 'validarPago'])->middleware('permission:admision.postulantes.inscribir');
    Route::post('/postulaciones/{postulacion}/completar-expediente', [AdmisionPostulacionController::class, 'completarExpediente'])->middleware('permission:admision.postulantes.inscribir');
    Route::patch('/postulaciones/{postulacion}/asignar-programa', [AdmisionPostulacionController::class, 'asignarPrograma'])->middleware('permission:admision.postulantes.inscribir');
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
    Route::get('/pagos-admision', [TesoreriaPagoController::class, 'index'])->middleware('permission:admision.postulantes.ver|admision.postulantes.inscribir');
    Route::get('/pagos-admision/consultar/{dni}', [TesoreriaPagoController::class, 'consultarDni'])->middleware('permission:admision.postulantes.ver|admision.postulantes.inscribir');
    Route::post('/pagos-admision/{postulacion}/registrar-pago', [TesoreriaPagoController::class, 'registrarPago'])->middleware('permission:admision.postulantes.inscribir');
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