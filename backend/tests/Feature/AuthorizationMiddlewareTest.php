<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AuthorizationMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_request_is_rejected_with_401(): void
    {
        $response = $this->getJson('/api/test-permission');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/test-permission');

        $response->assertStatus(403)
            ->assertJson([
                'error' => 'FORBIDDEN',
            ]);
    }

    public function test_user_with_permission_can_access(): void
    {
        $permission = Permission::create([
            'module' => 'usuarios',
            'name' => 'Crear',
            'slug' => 'usuarios.usuarios.crear',
        ]);

        $user = User::factory()->create(['is_active' => true]);
        $user->givePermissionTo($permission);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/test-permission');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Permiso concedido']);
    }

    public function test_superadmin_bypasses_permission_check(): void
    {
        Role::create(['name' => 'Super Administrador', 'slug' => 'superadmin', 'is_system' => true]);

        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('superadmin');

        $response = $this->actingAs($superAdmin, 'sanctum')->getJson('/api/test-permission');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Permiso concedido']);
    }

    public function test_inactive_user_is_blocked_with_403_even_with_permissions(): void
    {
        $permission = Permission::create([
            'module' => 'usuarios',
            'name' => 'Crear',
            'slug' => 'usuarios.usuarios.crear',
        ]);

        $user = User::factory()->create(['is_active' => false]);
        $user->givePermissionTo($permission);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/test-permission');

        $response->assertStatus(403)
            ->assertJson([
                'error' => 'ACCOUNT_INACTIVE',
            ]);
    }

    public function test_user_with_role_can_access_role_protected_route(): void
    {
        Role::create(['name' => 'Admin', 'slug' => 'admin']);

        $user = User::factory()->create(['is_active' => true]);
        $user->assignRole('admin');

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/test-role');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Rol concedido']);
    }
}
