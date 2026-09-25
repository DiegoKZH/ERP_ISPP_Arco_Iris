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
            // Módulo de Estudiantes
            [
                'module' => 'estudiantes',
                'name' => 'Ver Estudiantes',
                'slug' => 'estudiantes.estudiantes.ver',
                'description' => 'Permite consultar el listado y detalle de estudiantes.',
            ],
            [
                'module' => 'estudiantes',
                'name' => 'Crear Estudiantes',
                'slug' => 'estudiantes.estudiantes.crear',
                'description' => 'Permite registrar nuevos estudiantes.',
            ],
            [
                'module' => 'estudiantes',
                'name' => 'Editar Estudiantes',
                'slug' => 'estudiantes.estudiantes.editar',
                'description' => 'Permite modificar datos de estudiantes existentes.',
            ],
            [
                'module' => 'estudiantes',
                'name' => 'Deshabilitar Estudiantes',
                'slug' => 'estudiantes.estudiantes.deshabilitar',
                'description' => 'Permite desactivar (baja lógica) a estudiantes.',
            ],
            [
                'module' => 'estudiantes',
                'name' => 'Reactivar Estudiantes',
                'slug' => 'estudiantes.estudiantes.reactivar',
                'description' => 'Permite reactivar estudiantes deshabilitados.',
            ],
            // Módulo de Admisión
            [
                'module' => 'admision',
                'name' => 'Ver Procesos de Admisión',
                'slug' => 'admision.procesos.ver',
                'description' => 'Permite consultar procesos de admisión y convocatorias.',
            ],
            [
                'module' => 'admision',
                'name' => 'Crear Procesos de Admisión',
                'slug' => 'admision.procesos.crear',
                'description' => 'Permite crear nuevos procesos y convocatorias de admisión.',
            ],
            [
                'module' => 'admision',
                'name' => 'Editar Procesos de Admisión',
                'slug' => 'admision.procesos.editar',
                'description' => 'Permite modificar procesos de admisión existentes.',
            ],
            [
                'module' => 'admision',
                'name' => 'Ver Postulantes',
                'slug' => 'admision.postulantes.ver',
                'description' => 'Permite consultar el padrón de postulantes y fichas.',
            ],
            [
                'module' => 'admision',
                'name' => 'Inscribir Postulantes',
                'slug' => 'admision.postulantes.inscribir',
                'description' => 'Permite registrar e inscribir nuevos postulantes.',
            ],
            [
                'module' => 'admision',
                'name' => 'Evaluar Postulantes',
                'slug' => 'admision.postulantes.evaluar',
                'description' => 'Permite registrar notas y validar requisitos de postulantes.',
            ],
            [
                'module' => 'admision',
                'name' => 'Ver Resultados de Admisión',
                'slug' => 'admision.resultados.ver',
                'description' => 'Permite consultar cuadros de mérito y actas de resultados.',
            ],
            [
                'module' => 'admision',
                'name' => 'Publicar Resultados',
                'slug' => 'admision.resultados.publicar',
                'description' => 'Permite publicar resultados finales y cuadro de mérito.',
            ],
            [
                'module' => 'admision',
                'name' => 'Emitir Constancias de Ingreso',
                'slug' => 'admision.constancias.emitir',
                'description' => 'Permite emitir constancias oficiales de ingreso.',
            ],
        ];

        foreach ($permissions as $permData) {
            Permission::firstOrCreate(['slug' => $permData['slug']], $permData);
        }

        // Assign all permissions to 'admin' role
        $adminRole = Role::where('slug', 'admin')->first();
        if ($adminRole) {
            $permissionIds = Permission::pluck('id');
            $adminRole->permissions()->syncWithoutDetaching($permissionIds);
        }
    }
}
