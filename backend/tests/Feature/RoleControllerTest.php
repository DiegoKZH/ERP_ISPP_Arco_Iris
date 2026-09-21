<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->superAdmin = User::where('email', 'admin@erp-instituto.edu.pe')->first();
    }

    public function test_superadmin_can_list_roles(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/roles');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'name', 'slug', 'is_system', 'users_count']]]);
    }

    public function test_superadmin_can_create_custom_role(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->postJson('/api/roles', [
                'name' => 'Coordinador Académico',
                'slug' => 'coordinador-academico',
                'description' => 'Supervisión de docentes.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.slug', 'coordinador-academico');

        $this->assertDatabaseHas('roles', ['slug' => 'coordinador-academico', 'is_system' => false]);
    }

    public function test_cannot_delete_system_role(): void
    {
        $superAdminRole = Role::where('slug', 'superadmin')->first();

        $response = $this->actingAs($this->superAdmin)
            ->deleteJson("/api/roles/{$superAdminRole->id}");

        $response->assertStatus(403);
    }
}
