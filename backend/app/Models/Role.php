<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug', 'description', 'is_system'])]
class Role extends Model
{
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    /**
     * Users assigned to this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    /**
     * Permissions granted to this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    /**
     * Assign a permission to this role.
     */
    public function givePermissionTo(Permission|string $permission): static
    {
        $permissionModel = is_string($permission)
            ? Permission::where('slug', $permission)->firstOrFail()
            : $permission;

        $this->permissions()->syncWithoutDetaching([$permissionModel->id]);

        return $this;
    }

    /**
     * Revoke a permission from this role.
     */
    public function revokePermissionTo(Permission|string $permission): static
    {
        $permissionModel = is_string($permission)
            ? Permission::where('slug', $permission)->first()
            : $permission;

        if ($permissionModel) {
            $this->permissions()->detach($permissionModel->id);
        }

        return $this;
    }

    /**
     * Check if the role has a given permission.
     */
    public function hasPermission(string $permissionSlug): bool
    {
        return $this->permissions->contains('slug', $permissionSlug);
    }
}
