<?php

namespace Tests\Feature;

use App\Models\AdmisionEvaluacion;
use App\Models\AdmisionModalidad;
use App\Models\AdmisionPostulacion;
use App\Models\AdmisionProceso;
use App\Models\AdmisionProgramaOfertado;
use App\Models\AdmisionResultado;
use App\Models\PeriodoAcademico;
use App\Models\Permission;
use App\Models\Persona;
use App\Models\ProgramaEstudio;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdmissionModuleTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $authorizedUser;
    protected User $unauthorizedUser;
    protected AdmisionProceso $proceso;
    protected AdmisionProgramaOfertado $programaOfertado;
    protected AdmisionEvaluacion $evaluacionConocimientos;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Roles & Users
        Role::create(['name' => 'Super Administrador', 'slug' => 'superadmin', 'is_system' => true]);
        $this->superAdmin = User::factory()->create(['is_active' => true]);
        $this->superAdmin->assignRole('superadmin');

        $this->unauthorizedUser = User::factory()->create(['is_active' => true]);

        $this->authorizedUser = User::factory()->create(['is_active' => true]);
        $perms = [
            'admision.procesos.ver',
            'admision.postulantes.ver',
            'admision.postulantes.inscribir',
            'admision.postulantes.evaluar',
            'admision.resultados.ver',
            'admision.constancias.emitir',
        ];
        foreach ($perms as $pSlug) {
            $p = Permission::firstOrCreate(['slug' => $pSlug], [
                'module' => 'admision',
                'name' => $pSlug,
            ]);
            $this->authorizedUser->givePermissionTo($p);
        }

        // 2. Base Catalogs
        $periodo = PeriodoAcademico::create([
            'codigo' => '2026-I',
            'nombre' => 'Periodo 2026-I',
            'fecha_inicio' => '2026-03-01',
            'fecha_fin' => '2026-07-31',
            'is_vigente' => true,
        ]);

        $programa = ProgramaEstudio::create([
            'codigo' => 'EP-01',
            'nombre' => 'Educación Primaria',
            'nivel_academico' => 'Pregrado',
            'duracion_semestres' => 10,
        ]);

        $modalidad = AdmisionModalidad::create([
            'codigo' => 'ORD',
            'nombre' => 'Ordinario',
            'tipo' => 'ORDINARIO',
        ]);

        // 3. Proceso & Oferta
        $this->proceso = AdmisionProceso::create([
            'periodo_academico_id' => $periodo->id,
            'nombre' => 'Admisión 2026-I',
            'codigo' => 'ADM-2026-1',
            'fecha_inicio_inscripcion' => '2026-01-01',
            'fecha_fin_inscripcion' => '2026-02-28',
            'fecha_evaluacion' => '2026-03-05',
            'fecha_publicacion_resultados' => '2026-03-07',
            'puntaje_minimo_aprobatorio' => 11.00,
            'estado' => 'CONVOCATORIA_ABIERTA',
        ]);

        $this->programaOfertado = AdmisionProgramaOfertado::create([
            'admision_proceso_id' => $this->proceso->id,
            'programa_estudio_id' => $programa->id,
            'admision_modalidad_id' => $modalidad->id,
            'vacantes' => 25,
        ]);

        $this->evaluacionConocimientos = AdmisionEvaluacion::create([
            'admision_proceso_id' => $this->proceso->id,
            'nombre' => 'Examen de Conocimientos',
            'peso_porcentual' => 100.00,
            'puntaje_maximo' => 20.00,
            'orden' => 1,
        ]);
    }

    public function test_unauthenticated_cannot_access_admission(): void
    {
        $response = $this->getJson('/api/admision/procesos');
        $response->assertStatus(401);
    }

    public function test_unauthorized_user_receives_forbidden(): void
    {
        $response = $this->actingAs($this->unauthorizedUser, 'sanctum')->getJson('/api/admision/procesos');
        $response->assertStatus(403);
    }

    public function test_authorized_user_can_list_admission_processes(): void
    {
        $response = $this->actingAs($this->authorizedUser, 'sanctum')->getJson('/api/admision/procesos');
        $response->assertStatus(200)
            ->assertJsonPath('data.0.codigo', 'ADM-2026-1')
            ->assertJsonPath('data.0.programas_ofertados.0.vacantes', 25);
    }

    public function test_can_register_new_postulante_and_creates_persona(): void
    {
        $payload = [
            'admision_proceso_id' => $this->proceso->id,
            'admision_programa_ofertado_id' => $this->programaOfertado->id,
            'tipo_documento' => 'DNI',
            'numero_documento' => '87654321',
            'nombres' => 'Raúl Fernando',
            'apellido_paterno' => 'Paredes',
            'apellido_materno' => 'Gómez',
            'celular' => '998877665',
            'email_personal' => 'raul.paredes@gmail.com',
            'direccion' => 'Av. Larco 500, Trujillo',
        ];

        $response = $this->actingAs($this->authorizedUser, 'sanctum')->postJson('/api/admision/postulaciones', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.persona.numero_documento', '87654321')
            ->assertJsonPath('data.persona.nombre_completo', 'Paredes Gómez, Raúl Fernando');

        $this->assertDatabaseHas('personas', ['numero_documento' => '87654321']);
        $this->assertDatabaseHas('admision_postulaciones', ['persona_id' => Persona::where('numero_documento', '87654321')->first()->id]);
    }

    public function test_can_grade_postulante_and_assigns_ingresante_condition(): void
    {
        $persona = Persona::create([
            'tipo_documento' => 'DNI',
            'numero_documento' => '44556677',
            'nombres' => 'Elena',
            'apellido_paterno' => 'Torres',
            'apellido_materno' => 'Ríos',
        ]);

        $postulacion = AdmisionPostulacion::create([
            'codigo_postulante' => 'POST-TEST-0001',
            'persona_id' => $persona->id,
            'admision_proceso_id' => $this->proceso->id,
            'admision_programa_ofertado_id' => $this->programaOfertado->id,
            'estado_inscripcion' => 'APTO_EVALUACION',
        ]);

        $payload = [
            'calificaciones' => [
                [
                    'admision_evaluacion_id' => $this->evaluacionConocimientos->id,
                    'puntaje' => 16.50,
                ],
            ],
        ];

        $response = $this->actingAs($this->authorizedUser, 'sanctum')->postJson("/api/admision/postulaciones/{$postulacion->id}/calificar", $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('admision_resultados', [
            'admision_postulacion_id' => $postulacion->id,
            'puntaje_final' => 16.50,
            'condicion' => 'INGRESANTE',
            'es_adjudicado' => true,
        ]);
    }

    public function test_can_issue_admission_certificate_and_ratify_as_student(): void
    {
        $persona = Persona::create([
            'tipo_documento' => 'DNI',
            'numero_documento' => '11223344',
            'nombres' => 'Manuel',
            'apellido_paterno' => 'Castro',
            'apellido_materno' => 'Salazar',
        ]);

        $postulacion = AdmisionPostulacion::create([
            'codigo_postulante' => 'POST-TEST-0002',
            'persona_id' => $persona->id,
            'admision_proceso_id' => $this->proceso->id,
            'admision_programa_ofertado_id' => $this->programaOfertado->id,
            'estado_inscripcion' => 'APTO_EVALUACION',
        ]);

        AdmisionResultado::create([
            'admision_postulacion_id' => $postulacion->id,
            'puntaje_final' => 18.00,
            'orden_merito' => 1,
            'condicion' => 'INGRESANTE',
            'es_adjudicado' => true,
        ]);

        // 1. Emitir constancia
        $responseConstancia = $this->actingAs($this->authorizedUser, 'sanctum')
            ->postJson("/api/admision/postulaciones/{$postulacion->id}/emitir-constancia");

        $responseConstancia->assertStatus(200)
            ->assertJsonPath('data.postulante', 'Castro Salazar, Manuel');

        $this->assertDatabaseHas('admision_constancias', ['admision_postulacion_id' => $postulacion->id]);

        // 2. Ratificar matrícula como estudiante
        $responseMatricula = $this->actingAs($this->authorizedUser, 'sanctum')
            ->postJson("/api/admision/postulaciones/{$postulacion->id}/ratificar-matricula");

        $responseMatricula->assertStatus(200)
            ->assertJsonPath('data.persona', 'Castro Salazar, Manuel');

        $this->assertDatabaseHas('estudiantes', [
            'persona_id' => $persona->id,
            'admision_postulacion_id' => $postulacion->id,
            'estado_academico' => 'REGULAR',
        ]);
    }
}

