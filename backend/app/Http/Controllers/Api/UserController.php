<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return UserResource::collection(User::with('roles')->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserStoreRequest $request)
    {
        $validated = $request->validated();
        
        // Prevent 'admin' from creating a 'superadmin'
        if ($validated['role'] === 'superadmin' && !$request->user()->hasRole('superadmin')) {
            return response()->json(['message' => 'No tienes permisos para asignar el rol de superadmin.'], 403);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        $user->assignRole($validated['role']);

        return new UserResource($user);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserUpdateRequest $request, User $user)
    {
        $validated = $request->validated();

        if (isset($validated['role']) && $validated['role'] === 'superadmin' && !$request->user()->hasRole('superadmin')) {
            return response()->json(['message' => 'No tienes permisos para asignar el rol de superadmin.'], 403);
        }

        // Prevent admin from editing a superadmin
        if ($user->hasRole('superadmin') && !$request->user()->hasRole('superadmin')) {
            return response()->json(['message' => 'No tienes permisos para modificar a un superadmin.'], 403);
        }

        $data = [
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
            'username' => $validated['username'] ?? $user->username,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        if (isset($validated['role'])) {
            // Re-sync role
            $user->roles()->detach();
            $user->assignRole($validated['role']);
        }

        return new UserResource($user->fresh());
    }

    /**
     * Toggle the active status of a user.
     */
    public function toggleStatus(Request $request, User $user)
    {
        if ($user->hasRole('superadmin') && !$request->user()->hasRole('superadmin')) {
            return response()->json(['message' => 'No tienes permisos para deshabilitar a un superadmin.'], 403);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'No puedes deshabilitar tu propia cuenta.'], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message' => 'Estado del usuario actualizado correctamente.',
            'is_active' => $user->is_active
        ]);
    }
}
