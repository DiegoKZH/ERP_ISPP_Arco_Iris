<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_assign_role_and_check_has_role(): void
    {
        $role = Role::create([
            'name' => 'Docente',
            'slug' => 'docente',
        ]);

        $user = User::factory()->create();
        $user->assignRole('docente');

        $this->assertTrue($user->hasRole('docente'));
        $this->assertTrue($user->hasAnyRole(['docente', 'administrativo']));
        $this->assertFalse($user->hasRole('estudiante'));
    }

    public function test_user_inherits_permissions_from_roles(): void
    {
        $role = Role::create(['name' => 'Secretaría', 'slug' => 'secretaria']);
        $permission = Permission::create([
            'module' => 'academico',
            'name' => 'Matricular Estudiantes',
            'slug' => 'academico.matricula.crear',
        ]);

        $role->givePermissionTo($permission);

        $user = User::factory()->create();
        $user->assignRole($role);

        $this->assertTrue($user->hasPermission('academico.matricula.crear'));
        $this->assertFalse($user->hasPermission('academico.cursos.eliminar'));
    }

    public function test_direct_permission_overrides(): void
    {
        $role = Role::create(['name' => 'Tesorero', 'slug' => 'tesorero']);
        $perm1 = Permission::create(['module' => 'finanzas', 'name' => 'Ver Pagos', 'slug' => 'finanzas.pagos.ver']);
        $perm2 = Permission::create(['module' => 'finanzas', 'name' => 'Anular Pagos', 'slug' => 'finanzas.pagos.anular']);

        $role->givePermissionTo($perm1);
        $role->givePermissionTo($perm2);

        $user = User::factory()->create();
        $user->assignRole($role);

        // Initially has both from role
        $this->assertTrue($user->hasPermission('finanzas.pagos.ver'));
        $this->assertTrue($user->hasPermission('finanzas.pagos.anular'));

        // Explicitly deny perm2 directly to this user
        $user->givePermissionTo($perm2, false);

        $this->assertTrue($user->fresh()->hasPermission('finanzas.pagos.ver'));
        $this->assertFalse($user->fresh()->hasPermission('finanzas.pagos.anular'));
    }

    public function test_superadmin_has_all_permissions_and_roles(): void
    {
        $superAdminRole = Role::create([
            'name' => 'Super Administrador',
            'slug' => 'superadmin',
            'is_system' => true,
        ]);

        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $this->assertTrue($user->isSuperAdmin());
        $this->assertTrue($user->hasRole('cualquier-rol-inexistente'));
        $this->assertTrue($user->hasPermission('cualquier.modulo.accion'));
    }

    public function test_get_all_permissions_consolidation(): void
    {
        $role = Role::create(['name' => 'Bibliotecario', 'slug' => 'bibliotecario']);
        $perm1 = Permission::create(['module' => 'biblioteca', 'name' => 'Ver Libros', 'slug' => 'biblioteca.libros.ver']);
        $perm2 = Permission::create(['module' => 'biblioteca', 'name' => 'Prestar Libros', 'slug' => 'biblioteca.libros.prestar']);
        $perm3 = Permission::create(['module' => 'biblioteca', 'name' => 'Dar de Baja Libros', 'slug' => 'biblioteca.libros.baja']);

        $role->givePermissionTo($perm1);
        $role->givePermissionTo($perm2);

        $user = User::factory()->create();
        $user->assignRole($role);
        $user->givePermissionTo($perm3, true); // Direct grant

        $allPerms = $user->getAllPermissions();

        $this->assertTrue($allPerms->contains('biblioteca.libros.ver'));
        $this->assertTrue($allPerms->contains('biblioteca.libros.prestar'));
        $this->assertTrue($allPerms->contains('biblioteca.libros.baja'));
        $this->assertCount(3, $allPerms);
    }
}
