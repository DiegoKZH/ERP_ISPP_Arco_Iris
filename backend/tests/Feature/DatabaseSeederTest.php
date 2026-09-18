<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_executes_successfully(): void
    {
        $this->seed(DatabaseSeeder::class);

        // Check roles created
        $this->assertDatabaseHas('roles', ['slug' => 'superadmin', 'is_system' => true]);
        $this->assertDatabaseHas('roles', ['slug' => 'admin', 'is_system' => false]);

        // Check permissions created
        $this->assertDatabaseHas('permissions', ['slug' => 'usuarios.usuarios.ver']);
        $this->assertDatabaseHas('permissions', ['slug' => 'usuarios.roles.asignar']);

        // Check superadmin user created
        $superAdmin = User::where('email', 'admin@erp-instituto.edu.pe')->first();
        $this->assertNotNull($superAdmin);
        $this->assertTrue($superAdmin->isSuperAdmin());

        // Check admin role has permissions
        $adminRole = Role::where('slug', 'admin')->first();
        $this->assertGreaterThan(0, $adminRole->permissions()->count());
    }
}
