<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'No autenticado.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'La cuenta de usuario se encuentra inactiva.',
                'error' => 'ACCOUNT_INACTIVE',
            ], Response::HTTP_FORBIDDEN);
        }

        $rolesList = explode('|', $roles);

        if (! $user->hasAnyRole($rolesList)) {
            return response()->json([
                'message' => 'No tiene el rol requerido para realizar esta acción.',
                'error' => 'FORBIDDEN',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
