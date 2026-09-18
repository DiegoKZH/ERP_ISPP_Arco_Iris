<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Administrador',
                'slug' => 'superadmin',
                'description' => 'Acceso total y sin restricciones a todos los módulos y configuraciones del sistema.',
                'is_system' => true,
            ],
            [
                'name' => 'Administrador',
                'slug' => 'admin',
                'description' => 'Gestión administrativa general del ERP.',
                'is_system' => false,
            ],
        ];

        foreach ($roles as $roleData) {
            Role::firstOrCreate(['slug' => $roleData['slug']], $roleData);
        }
    }
}
