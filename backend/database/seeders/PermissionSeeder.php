<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            [
                'module' => 'usuarios',
                'name' => 'Ver Usuarios',
                'slug' => 'usuarios.usuarios.ver',
                'description' => 'Permite consultar el listado y detalle de usuarios.',
            ],
            [
                'module' => 'usuarios',
                'name' => 'Crear Usuarios',
                'slug' => 'usuarios.usuarios.crear',
                'description' => 'Permite registrar nuevos usuarios en el sistema.',
            ],
            [
                'module' => 'usuarios',
                'name' => 'Editar Usuarios',
                'slug' => 'usuarios.usuarios.editar',
                'description' => 'Permite modificar datos de usuarios existentes.',
            ],
            [
                'module' => 'usuarios',
                'name' => 'Deshabilitar Usuarios',
                'slug' => 'usuarios.usuarios.deshabilitar',
                'description' => 'Permite desactivar (baja lógica) a usuarios.',
            ],
            [
                'module' => 'usuarios',
                'name' => 'Reactivar Usuarios',
                'slug' => 'usuarios.usuarios.reactivar',
                'description' => 'Permite reactivar a usuarios previamente deshabilitados.',
            ],
            [
                'module' => 'usuarios',
                'name' => 'Ver Roles',
                'slug' => 'usuarios.roles.ver',
                'description' => 'Permite visualizar roles y permisos.',
            ],
            [
                'module' => 'usuarios',
                'name' => 'Asignar Roles',
                'slug' => 'usuarios.roles.asignar',
                'description' => 'Permite asignar roles a los usuarios.',
            ],
        ];

        foreach ($permissions as $permData) {
            Permission::firstOrCreate(['slug' => $permData['slug']], $permData);
        }

        // Assign basic permissions to 'admin' role
        $adminRole = Role::where('slug', 'admin')->first();
        if ($adminRole) {
            $permissionIds = Permission::where('module', 'usuarios')->pluck('id');
            $adminRole->permissions()->syncWithoutDetaching($permissionIds);
        }
    }
}
