<?php

namespace Database\Seeders;

use App\Models\AdmisionAmbiente;
use App\Models\AdmisionCalificacion;
use App\Models\AdmisionConstancia;
use App\Models\AdmisionEvaluacion;
use App\Models\AdmisionModalidad;
use App\Models\AdmisionPostulacion;
use App\Models\AdmisionPostulanteAmbiente;
use App\Models\AdmisionProceso;
use App\Models\AdmisionProgramaOfertado;
use App\Models\AdmisionRequisito;
use App\Models\AdmisionResultado;
use App\Models\Estudiante;
use App\Models\PeriodoAcademico;
use App\Models\Persona;
use App\Models\ProgramaEstudio;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdmisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::first();
        $periodo = PeriodoAcademico::where('codigo', '2026-I')->first();

        // 1. Modalidades
        $modalidadOrd = AdmisionModalidad::firstOrCreate(
            ['codigo' => 'ORD'],
            [
                'nombre' => 'Admisión Ordinaria',
                'descripcion' => 'Modalidad general para egresados de Educación Básica Regular.',
                'tipo' => 'ORDINARIO',
                'is_active' => true,
            ]
        );

        $modalidadPP = AdmisionModalidad::firstOrCreate(
            ['codigo' => 'PP'],
            [
                'nombre' => 'Primeros Puestos',
                'descripcion' => 'Modalidad extraordinaria para dos primeros puestos de secundaria.',
                'tipo' => 'EXTRAORDINARIO',
                'is_active' => true,
            ]
        );

        $modalidadDep = AdmisionModalidad::firstOrCreate(
            ['codigo' => 'DEP'],
            [
                'nombre' => 'Deportistas Calificados',
                'descripcion' => 'Modalidad para atletas federados de alto rendimiento.',
                'tipo' => 'EXTRAORDINARIO',
                'is_active' => true,
            ]
        );

        // 2. Requisitos
        $reqs = [
            ['nombre' => 'DNI o Documento de Identidad Vigente', 'formato_permitido' => 'PDF', 'es_obligatorio' => true],
            ['nombre' => 'Certificado Oficial de Estudios Secundarios', 'formato_permitido' => 'PDF', 'es_obligatorio' => true],
            ['nombre' => 'Partida de Nacimiento Original', 'formato_permitido' => 'PDF', 'es_obligatorio' => true],
            ['nombre' => 'Comprobante de Pago de Derecho de Admisión', 'formato_permitido' => 'PDF', 'es_obligatorio' => true],
            ['nombre' => 'Declaración Jurada de no registrar antecedentes', 'formato_permitido' => 'PDF', 'es_obligatorio' => true],
        ];

        $reqModels = [];
        foreach ($reqs as $r) {
            $reqModels[] = AdmisionRequisito::firstOrCreate(['nombre' => $r['nombre']], $r);
        }

        // Vincular requisitos a modalidades
        $modalidadOrd->requisitos()->syncWithoutDetaching(collect($reqModels)->pluck('id'));
        $modalidadPP->requisitos()->syncWithoutDetaching(collect($reqModels)->pluck('id'));

        // 3. Proceso de Admisión 2026-I
        $proceso = AdmisionProceso::firstOrCreate(
            ['codigo' => 'ADM-2026-1'],
            [
                'periodo_academico_id' => $periodo?->id ?? 1,
                'nombre' => 'Proceso de Admisión Ordinario y Exonerados 2026-I',
                'fecha_inicio_inscripcion' => '2026-01-10',
                'fecha_fin_inscripcion' => '2026-03-01',
                'fecha_evaluacion' => '2026-03-08',
                'fecha_publicacion_resultados' => '2026-03-10',
                'puntaje_minimo_aprobatorio' => 11.00,
                'estado' => 'RESULTADOS_PUBLICADOS',
            ]
        );

        // 4. Programas Ofertados con Vacantes
        $progInicial = ProgramaEstudio::where('codigo', 'EI-01')->first();
        $progPrimaria = ProgramaEstudio::where('codigo', 'EP-01')->first();
        $progCom = ProgramaEstudio::where('codigo', 'ES-COM')->first();

        $ofertaInicial = AdmisionProgramaOfertado::firstOrCreate(
            ['admision_proceso_id' => $proceso->id, 'programa_estudio_id' => $progInicial->id, 'admision_modalidad_id' => $modalidadOrd->id],
            ['vacantes' => 30]
        );

        $ofertaPrimaria = AdmisionProgramaOfertado::firstOrCreate(
            ['admision_proceso_id' => $proceso->id, 'programa_estudio_id' => $progPrimaria->id, 'admision_modalidad_id' => $modalidadOrd->id],
            ['vacantes' => 30]
        );

        $ofertaCom = AdmisionProgramaOfertado::firstOrCreate(
            ['admision_proceso_id' => $proceso->id, 'programa_estudio_id' => $progCom->id, 'admision_modalidad_id' => $modalidadOrd->id],
            ['vacantes' => 25]
        );

        // 5. Ambientes
        $aula101 = AdmisionAmbiente::firstOrCreate(
            ['admision_proceso_id' => $proceso->id, 'codigo_aula' => 'AULA-101'],
            [
                'pabellon' => 'Pabellón A - Piso 1',
                'capacidad' => 35,
                'responsable_user_id' => $adminUser?->id,
            ]
        );

        // 6. Evaluaciones y Ponderaciones
        $evalConocimientos = AdmisionEvaluacion::firstOrCreate(
            ['admision_proceso_id' => $proceso->id, 'nombre' => 'Prueba de Competencias Fundamentales'],
            ['peso_porcentual' => 60.00, 'puntaje_maximo' => 20.00, 'orden' => 1]
        );

        $evalVocacional = AdmisionEvaluacion::firstOrCreate(
            ['admision_proceso_id' => $proceso->id, 'nombre' => 'Prueba de Aptitud Vocacional'],
            ['peso_porcentual' => 20.00, 'puntaje_maximo' => 20.00, 'orden' => 2]
        );

        $evalEntrevista = AdmisionEvaluacion::firstOrCreate(
            ['admision_proceso_id' => $proceso->id, 'nombre' => 'Entrevista Personal y Habilidades Blandas'],
            ['peso_porcentual' => 20.00, 'puntaje_maximo' => 20.00, 'orden' => 3]
        );

        // 7. Personas y Postulaciones de Prueba
        $postulantesData = [
            [
                'persona' => [
                    'tipo_documento' => 'DNI',
                    'numero_documento' => '73849102',
                    'nombres' => 'Alexander Daniel',
                    'apellido_paterno' => 'Quispe',
                    'apellido_materno' => 'Rojas',
                    'fecha_nacimiento' => '2005-06-15',
                    'sexo' => 'M',
                    'direccion' => 'Av. Manuel Seoane 410, Trujillo',
                    'celular' => '984512301',
                    'email_personal' => 'alexander.quispe@gmail.com',
                ],
                'codigo_postulante' => 'POST-20261-0001',
                'oferta' => $ofertaPrimaria,
                'notas' => [17.50, 16.00, 18.00], // Final = 17.30
                'condicion' => 'INGRESANTE',
                'asiento' => 1,
            ],
            [
                'persona' => [
                    'tipo_documento' => 'DNI',
                    'numero_documento' => '75938201',
                    'nombres' => 'Brenda Nicole',
                    'apellido_paterno' => 'Morales',
                    'apellido_materno' => 'Chiroque',
                    'fecha_nacimiento' => '2006-02-20',
                    'sexo' => 'F',
                    'direccion' => 'Calle Las Magnolias 112, Víctor Larco',
                    'celular' => '976543219',
                    'email_personal' => 'brenda.morales@hotmail.com',
                ],
                'codigo_postulante' => 'POST-20261-0002',
                'oferta' => $ofertaInicial,
                'notas' => [16.00, 18.00, 17.50], // Final = 16.70
                'condicion' => 'INGRESANTE',
                'asiento' => 2,
            ],
            [
                'persona' => [
                    'tipo_documento' => 'DNI',
                    'numero_documento' => '71829304',
                    'nombres' => 'Carlos Enrique',
                    'apellido_paterno' => 'Benites',
                    'apellido_materno' => 'Alvarado',
                    'fecha_nacimiento' => '2004-11-10',
                    'sexo' => 'M',
                    'direccion' => 'Jr. Pizarro 650, Trujillo Centro',
                    'celular' => '912345672',
                    'email_personal' => 'carlos.benites@gmail.com',
                ],
                'codigo_postulante' => 'POST-20261-0003',
                'oferta' => $ofertaPrimaria,
                'notas' => [09.50, 10.00, 11.00], // Final = 9.90 (desaprobado)
                'condicion' => 'NO_INGRESANTE',
                'asiento' => 3,
            ],
            [
                'persona' => [
                    'tipo_documento' => 'DNI',
                    'numero_documento' => '74920183',
                    'nombres' => 'Diana Patricia',
                    'apellido_paterno' => 'Huamán',
                    'apellido_materno' => 'Cárdenas',
                    'fecha_nacimiento' => '2005-09-05',
                    'sexo' => 'F',
                    'direccion' => 'Av. América Sur 2340, Trujillo',
                    'celular' => '951236871',
                    'email_personal' => 'diana.huaman@outlook.com',
                ],
                'codigo_postulante' => 'POST-20261-0004',
                'oferta' => $ofertaCom,
                'notas' => [15.00, 14.50, 16.00], // Final = 15.10
                'condicion' => 'INGRESANTE',
                'asiento' => 4,
            ],
        ];

        $merito = 1;
        foreach ($postulantesData as $pData) {
            $persona = Persona::firstOrCreate(
                ['numero_documento' => $pData['persona']['numero_documento']],
                $pData['persona']
            );

            $postulacion = AdmisionPostulacion::firstOrCreate(
                ['codigo_postulante' => $pData['codigo_postulante']],
                [
                    'persona_id' => $persona->id,
                    'admision_proceso_id' => $proceso->id,
                    'admision_programa_ofertado_id' => $pData['oferta']->id,
                    'codigo_tesoreria' => $persona->numero_documento,
                    'estado_pago' => 'PAGADO',
                    'fecha_pago' => '2026-02-15 10:30:00',
                    'comprobante_pago' => 'REC-2026-' . sprintf('%04d', $merito),
                    'monto_pago' => 150.00,
                    'numero_fut' => 'FUT-2026-' . sprintf('%04d', $merito),
                    'fecha_emision_fut' => '2026-02-15 10:35:00',
                    'colegio_fin_secundaria' => 'I.E. Gran Unidad Escolar Faustino Sánchez Carrión',
                    'codigo_modular_colegio' => '0349812',
                    'anio_egreso_colegio' => 2024,
                    'colegio_tipo_gestion' => 'PUBLICA',
                    'colegio_departamento' => 'La Libertad',
                    'colegio_provincia' => 'Trujillo',
                    'colegio_distrito' => 'Trujillo',
                    'tiene_copia_dni_color' => true,
                    'tiene_partida_nacimiento' => true,
                    'tiene_certificado_nacimiento_original' => true,
                    'foto_url' => '/uploads/postulantes/foto_' . $persona->numero_documento . '.jpg',
                    'estado_inscripcion' => 'APTO_EVALUACION',
                ]
            );

            // Si ya existía, asegurar que tenga los nuevos datos verídicos
            $postulacion->update([
                'codigo_tesoreria' => $persona->numero_documento,
                'estado_pago' => 'PAGADO',
                'fecha_pago' => '2026-02-15 10:30:00',
                'comprobante_pago' => 'REC-2026-' . sprintf('%04d', $merito),
                'monto_pago' => 150.00,
                'numero_fut' => 'FUT-2026-' . sprintf('%04d', $merito),
                'fecha_emision_fut' => '2026-02-15 10:35:00',
                'colegio_fin_secundaria' => 'I.E. Gran Unidad Escolar Faustino Sánchez Carrión',
                'codigo_modular_colegio' => '0349812',
                'anio_egreso_colegio' => 2024,
                'colegio_tipo_gestion' => 'PUBLICA',
                'colegio_departamento' => 'La Libertad',
                'colegio_provincia' => 'Trujillo',
                'colegio_distrito' => 'Trujillo',
                'tiene_copia_dni_color' => true,
                'tiene_partida_nacimiento' => true,
                'tiene_certificado_nacimiento_original' => true,
            ]);

            // Asignar ambiente
            AdmisionPostulanteAmbiente::firstOrCreate(
                ['admision_postulacion_id' => $postulacion->id],
                [
                    'admision_ambiente_id' => $aula101->id,
                    'numero_asiento' => $pData['asiento'],
                    'asistio' => true,
                ]
            );

            // Registrar Calificaciones
            AdmisionCalificacion::firstOrCreate(
                ['admision_postulacion_id' => $postulacion->id, 'admision_evaluacion_id' => $evalConocimientos->id],
                ['puntaje' => $pData['notas'][0], 'evaluador_user_id' => $adminUser?->id]
            );

            AdmisionCalificacion::firstOrCreate(
                ['admision_postulacion_id' => $postulacion->id, 'admision_evaluacion_id' => $evalVocacional->id],
                ['puntaje' => $pData['notas'][1], 'evaluador_user_id' => $adminUser?->id]
            );

            AdmisionCalificacion::firstOrCreate(
                ['admision_postulacion_id' => $postulacion->id, 'admision_evaluacion_id' => $evalEntrevista->id],
                ['puntaje' => $pData['notas'][2], 'evaluador_user_id' => $adminUser?->id]
            );

            // Calcular puntaje ponderado
            $puntajeFinal = ($pData['notas'][0] * 0.60) + ($pData['notas'][1] * 0.20) + ($pData['notas'][2] * 0.20);

            // Resultado de Admisión
            $resultado = AdmisionResultado::firstOrCreate(
                ['admision_postulacion_id' => $postulacion->id],
                [
                    'puntaje_final' => $puntajeFinal,
                    'orden_merito' => $merito++,
                    'condicion' => $pData['condicion'],
                    'es_adjudicado' => ($pData['condicion'] === 'INGRESANTE'),
                ]
            );

            // Emitir constancia de ingreso si es ingresante
            if ($pData['condicion'] === 'INGRESANTE') {
                $constancia = AdmisionConstancia::firstOrCreate(
                    ['admision_postulacion_id' => $postulacion->id],
                    [
                        'codigo_constancia' => 'CONST-ING-' . substr($pData['codigo_postulante'], 5),
                        'fecha_emision' => '2026-03-11',
                        'hash_seguridad' => hash('sha256', $postulacion->codigo_postulante . '-INGRESANTE-20261'),
                        'emitido_por_user_id' => $adminUser?->id,
                    ]
                );

                // Demostración de transición: Para el primer ingresante (Alexander Quispe), creamos su expediente como Estudiante
                if ($pData['codigo_postulante'] === 'POST-20261-0001') {
                    Estudiante::firstOrCreate(
                        ['persona_id' => $persona->id],
                        [
                            'programa_estudio_id' => $pData['oferta']->programa_estudio_id,
                            'admision_postulacion_id' => $postulacion->id,
                            'codigo_estudiante' => 'EST-20261-0001',
                            'fecha_ingreso' => '2026-03-12',
                            'estado_academico' => 'REGULAR',
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}

