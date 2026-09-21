<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleStoreRequest;
use App\Http\Requests\RoleUpdateRequest;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles.
     */
    public function index()
    {
        $roles = Role::withCount('users')->orderBy('name', 'asc')->get();
        return response()->json(['data' => $roles]);
    }

    /**
     * Store a newly created role.
     */
    public function store(RoleStoreRequest $request)
    {
        $validated = $request->validated();
        $validated['is_system'] = false;

        $role = Role::create($validated);

        return response()->json(['data' => $role->loadCount('users')], 201);
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role)
    {
        return response()->json(['data' => $role->loadCount('users')]);
    }

    /**
     * Update the specified role.
     */
    public function update(RoleUpdateRequest $request, Role $role)
    {
        if ($role->is_system) {
            return response()->json(['message' => 'Los roles del sistema no se pueden modificar.'], 403);
        }

        $role->update($request->validated());

        return response()->json(['data' => $role->fresh()->loadCount('users')]);
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role)
    {
        if ($role->is_system || $role->slug === 'admin') {
            return response()->json(['message' => 'No se puede eliminar un rol del sistema o base.'], 403);
        }

        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'No se puede eliminar un rol que tiene usuarios asignados.'], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Rol eliminado correctamente.']);
    }
}
