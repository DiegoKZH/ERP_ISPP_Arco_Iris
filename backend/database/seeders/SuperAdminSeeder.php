<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@erp-instituto.edu.pe'],
            [
                'name' => 'Super Administrador',
                'username' => 'superadmin',
                'password' => Hash::make('Admin1234#'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $superAdmin->assignRole('superadmin');
    }
}
