<?php

namespace Database\Seeders;

use App\Models\PeriodoAcademico;
use App\Models\ProgramaEstudio;
use Illuminate\Database\Seeder;

class AcademicCatalogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programas = [
            [
                'codigo' => 'EI-01',
                'nombre' => 'Educación Inicial',
                'nivel_academico' => 'Pregrado',
                'duracion_semestres' => 10,
                'is_active' => true,
            ],
            [
                'codigo' => 'EP-01',
                'nombre' => 'Educación Primaria',
                'nivel_academico' => 'Pregrado',
                'duracion_semestres' => 10,
                'is_active' => true,
            ],
            [
                'codigo' => 'ES-COM',
                'nombre' => 'Educación Secundaria: Comunicación',
                'nivel_academico' => 'Pregrado',
                'duracion_semestres' => 10,
                'is_active' => true,
            ],
            [
                'codigo' => 'ES-MAT',
                'nombre' => 'Educación Secundaria: Matemática',
                'nivel_academico' => 'Pregrado',
                'duracion_semestres' => 10,
                'is_active' => true,
            ],
            [
                'codigo' => 'EFI-01',
                'nombre' => 'Educación Física',
                'nivel_academico' => 'Pregrado',
                'duracion_semestres' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($programas as $prog) {
            ProgramaEstudio::firstOrCreate(['codigo' => $prog['codigo']], $prog);
        }

        PeriodoAcademico::firstOrCreate(
            ['codigo' => '2026-I'],
            [
                'nombre' => 'Periodo Académico 2026-I',
                'fecha_inicio' => '2026-03-15',
                'fecha_fin' => '2026-07-31',
                'is_vigente' => true,
            ]
        );
    }
}

