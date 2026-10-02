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
                'codigo' => 'EF-01',
                'nombre' => 'Educación Física',
                'nivel_academico' => 'Pregrado',
                'duracion_semestres' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($programas as $prog) {
            ProgramaEstudio::updateOrCreate(['codigo' => $prog['codigo']], $prog);
        }

        // Desactivar programas no autorizados
        ProgramaEstudio::whereNotIn('codigo', ['EI-01', 'EF-01'])->update(['is_active' => false]);

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

