<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue API token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $login = $request->validated('login');
        $password = $request->validated('password');

        $user = User::where('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'La cuenta de usuario se encuentra inactiva.',
                'error' => 'ACCOUNT_INACTIVE',
            ], Response::HTTP_FORBIDDEN);
        }

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'token' => $token,
            'user' => new UserResource($user->loadMissing(['roles.permissions', 'directPermissions'])),
        ]);
    }

    /**
     * Invalidate user token and log out.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    /**
     * Get authenticated user profile with roles and permissions.
     */
    public function me(Request $request): UserResource
    {
        $user = $request->user();

        return new UserResource($user->loadMissing(['roles.permissions', 'directPermissions']));
    }
}
