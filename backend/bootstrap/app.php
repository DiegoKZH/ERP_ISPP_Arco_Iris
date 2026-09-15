<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Backend Bootstrap
|--------------------------------------------------------------------------
| basePath = raíz del proyecto (para que vendor/, public/, .env funcionen)
| Las rutas de app, config, database, etc. se redirigen a backend/
|--------------------------------------------------------------------------
*/

$backendPath = dirname(__DIR__);

$app = Application::configure(basePath: dirname(__DIR__, 2))
    ->withRouting(
        web: $backendPath.'/routes/web.php',
        api: $backendPath.'/routes/api.php',
        commands: $backendPath.'/routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();

// Redirigir las rutas de Laravel a backend/
$app->useAppPath($backendPath.'/app');
$app->useBootstrapPath($backendPath.'/bootstrap');
$app->useConfigPath($backendPath.'/config');
$app->useDatabasePath($backendPath.'/database');
$app->useStoragePath($backendPath.'/storage');
$app->useLangPath($backendPath.'/resources/lang');

// resourcePath() no tiene setter, así que lo sobreescribimos vía container binding
$app->instance('path.resources', $backendPath.'/resources');

return $app;
