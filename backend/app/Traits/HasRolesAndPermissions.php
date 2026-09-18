<?php

namespace App\Traits;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

trait HasRolesAndPermissions
{
    /**
     * Roles assigned to this user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    /**
     * Direct permissions assigned to this user.
     */
    public function directPermissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_user')->withPivot('granted');
    }

    /**
     * Assign one or multiple roles to user.
     */
    public function assignRole(Role|string ...$roles): static
    {
        foreach ($roles as $role) {
            $roleModel = is_string($role)
                ? Role::where('slug', $role)->firstOrFail()
                : $role;

            $this->roles()->syncWithoutDetaching([$roleModel->id]);
        }

        return $this;
    }

    /**
     * Remove a role from user.
     */
    public function removeRole(Role|string $role): static
    {
        $roleModel = is_string($role)
            ? Role::where('slug', $role)->first()
            : $role;

        if ($roleModel) {
            $this->roles()->detach($roleModel->id);
        }

        return $this;
    }

    /**
     * Check if user is superadmin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->roles()->where('slug', 'superadmin')->exists()
            || $this->roles->contains('slug', 'superadmin');
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string|array $roles): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $rolesArray = is_array($roles) ? $roles : [$roles];

        return $this->roles->pluck('slug')->intersect($rolesArray)->isNotEmpty();
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->hasRole($roles);
    }

    /**
     * Give or deny direct permission to user.
     */
    public function givePermissionTo(Permission|string $permission, bool $granted = true): static
    {
        $permissionModel = is_string($permission)
            ? Permission::where('slug', $permission)->firstOrFail()
            : $permission;

        $this->directPermissions()->syncWithoutDetaching([
            $permissionModel->id => ['granted' => $granted],
        ]);

        return $this;
    }

    /**
     * Revoke direct permission from user.
     */
    public function revokeDirectPermission(Permission|string $permission): static
    {
        $permissionModel = is_string($permission)
            ? Permission::where('slug', $permission)->first()
            : $permission;

        if ($permissionModel) {
            $this->directPermissions()->detach($permissionModel->id);
        }

        return $this;
    }

    /**
     * Check if user has permission (considering superadmin bypass, direct overrides and roles).
     */
    public function hasPermission(string $permissionSlug): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Direct permission check (explicit grant or deny)
        $direct = $this->directPermissions->firstWhere('slug', $permissionSlug);
        if ($direct !== null) {
            return (bool) $direct->pivot->granted;
        }

        // Inherited permission through roles
        foreach ($this->roles as $role) {
            if ($role->permissions->contains('slug', $permissionSlug)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all effective permission slugs for the user.
     */
    public function getAllPermissions(): Collection
    {
        if ($this->isSuperAdmin()) {
            return Permission::pluck('slug');
        }

        $rolePermissions = $this->roles
            ->loadMissing('permissions')
            ->flatMap(fn ($role) => $role->permissions->pluck('slug'));

        $directGrants = $this->directPermissions
            ->where('pivot.granted', true)
            ->pluck('slug');

        $directDenies = $this->directPermissions
            ->where('pivot.granted', false)
            ->pluck('slug');

        return $rolePermissions
            ->merge($directGrants)
            ->diff($directDenies)
            ->unique()
            ->values();
    }
}
