<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['module', 'name', 'slug', 'description'])]
class Permission extends Model
{
    use HasFactory;

    /**
     * Roles that have this permission.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role');
    }

    /**
     * Users with direct assignment of this permission.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'permission_user')->withPivot('granted');
    }
}
