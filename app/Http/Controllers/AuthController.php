<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Aquí harías la validación real con Auth::attempt()
        $email = $request->input('email');
        $password = $request->input('password');

        if ($email === 'admin@instituto.com' && $password === '123456') {
            return response()->json([
                'success' => true,
                'message' => '¡Credenciales correctas! Redirigiendo...'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Usuario o contraseña incorrectos.'
        ]);
    }
}