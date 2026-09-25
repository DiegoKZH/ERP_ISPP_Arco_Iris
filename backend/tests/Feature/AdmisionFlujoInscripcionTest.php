<?php

namespace Tests\Feature;

use App\Models\AdmisionModalidad;
use App\Models\AdmisionPostulacion;
use App\Models\AdmisionProceso;
use App\Models\AdmisionProgramaOfertado;
use App\Models\PeriodoAcademico;
use App\Models\Permission;
use App\Models\Persona;
use App\Models\ProgramaEstudio;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdmisionFlujoInscripcionTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected AdmisionProceso $proceso;
    protected AdmisionProgramaOfertado $programaOfertado;
    protected Persona $personaPrueba;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Roles y Permisos
        Role::create(['name' => 'Super Administrador', 'slug' => 'superadmin', 'is_system' => true]);
        $this->adminUser = User::factory()->create(['is_active' => true]);
        $this->adminUser->assignRole('superadmin');

        $perms = [
            'admision.procesos.ver',
            'admision.postulantes.ver',
            'admision.postulantes.inscribir',
        ];
        foreach ($perms as $pSlug) {
            $p = Permission::firstOrCreate(['slug' => $pSlug], [
                'module' => 'admision',
                'name' => $pSlug,
            ]);
            $this->adminUser->givePermissionTo($p);
        }

        // 2. Crear catálogo académico
        $periodo = PeriodoAcademico::create([
            'codigo' => '2026-I',
            'nombre' => 'Periodo Académico 2026-I',
            'fecha_inicio' => '2026-03-01',
            'fecha_fin' => '2026-07-31',
            'is_active' => true,
        ]);

        $programa = ProgramaEstudio::create([
            'codigo' => 'EP-01',
            'nombre' => 'Educación Primaria',
            'nivel_academico' => 'SUPERIOR',
            'duracion_semestres' => 10,
            'is_active' => true,
        ]);

        $modalidad = AdmisionModalidad::create([
            'codigo' => 'ORD',
            'nombre' => 'Admisión Ordinaria',
            'tipo' => 'ORDINARIO',
            'is_active' => true,
        ]);

        $this->proceso = AdmisionProceso::create([
            'periodo_academico_id' => $periodo->id,
            'codigo' => 'ADM-2026-1',
            'nombre' => 'Admisión 2026-I',
            'fecha_inicio_inscripcion' => '2026-01-01',
            'fecha_fin_inscripcion' => '2026-03-01',
            'fecha_evaluacion' => '2026-03-08',
            'fecha_publicacion_resultados' => '2026-03-10',
            'puntaje_minimo_aprobatorio' => 11.00,
            'estado' => 'CONVOCATORIA_ABIERTA',
        ]);

        $this->programaOfertado = AdmisionProgramaOfertado::create([
            'admision_proceso_id' => $this->proceso->id,
            'programa_estudio_id' => $programa->id,
            'admision_modalidad_id' => $modalidad->id,
            'vacantes' => 30,
        ]);

        $this->personaPrueba = Persona::create([
            'tipo_documento' => 'DNI',
            'numero_documento' => '74839201',
            'nombres' => 'Juan Carlos',
            'apellido_paterno' => 'Pérez',
            'apellido_materno' => 'Gómez',
            'fecha_nacimiento' => '2005-08-14',
            'sexo' => 'M',
            'celular' => '987654321',
            'email_personal' => 'juan.perez@gmail.com',
            'direccion' => 'Av. Larco 1234, Trujillo',
        ]);
    }

    public function test_paso_1_y_2_preinscribir_postulante_genera_codigo_tesoreria_igual_al_dni(): void
    {
        $payload = [
            'admision_proceso_id' => $this->proceso->id,
            'admision_programa_ofertado_id' => $this->programaOfertado->id,
            'tipo_documento' => 'DNI',
            'numero_documento' => '79998888',
            'nombres' => 'María Elena',
            'apellido_paterno' => 'Salazar',
            'apellido_materno' => 'Vega',
            'fecha_nacimiento' => '2006-03-21',
            'sexo' => 'F',
            'celular' => '911223344',
            'email_personal' => 'maria.salazar@gmail.com',
            'direccion' => 'Calle Pizarro 400',
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/admision/postulaciones/pre-inscribir', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('codigo_tesoreria', '79998888')
            ->assertJsonPath('data.estado_pago', 'PENDIENTE')
            ->assertJsonPath('data.estado_inscripcion', 'PENDIENTE_PAGO');

        $this->assertDatabaseHas('personas', [
            'numero_documento' => '79998888',
            'nombres' => 'María Elena',
        ]);

        $this->assertDatabaseHas('admision_postulaciones', [
            'codigo_tesoreria' => '79998888',
            'estado_pago' => 'PENDIENTE',
            'estado_inscripcion' => 'PENDIENTE_PAGO',
        ]);
    }

    public function test_paso_3_retorno_de_tesoreria_valida_pago_y_emite_numero_de_fut(): void
    {
        $postulacion = AdmisionPostulacion::create([
            'codigo_postulante' => 'POST-20261-0001',
            'persona_id' => $this->personaPrueba->id,
            'admision_proceso_id' => $this->proceso->id,
            'admision_programa_ofertado_id' => $this->programaOfertado->id,
            'codigo_tesoreria' => $this->personaPrueba->numero_documento,
            'estado_pago' => 'PENDIENTE',
            'estado_inscripcion' => 'PENDIENTE_PAGO',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/admision/postulaciones/{$postulacion->id}/validar-pago", [
                'comprobante_pago' => 'REC-2026-9999',
                'monto_pago' => 150.00,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.estado_pago', 'PAGADO')
            ->assertJsonPath('data.comprobante_pago', 'REC-2026-9999')
            ->assertJsonPath('data.estado_inscripcion', 'PAGO_VALIDADO');

        $postulacion->refresh();
        $this->assertNotNull($postulacion->numero_fut);
        $this->assertStringStartsWith('FUT-', $postulacion->numero_fut);
        $this->assertEquals('PAGADO', $postulacion->estado_pago);
    }

    public function test_paso_4_completar_expediente_escolar_y_requisitos_actualiza_a_inscrito(): void
    {
        $postulacion = AdmisionPostulacion::create([
            'codigo_postulante' => 'POST-20261-0002',
            'persona_id' => $this->personaPrueba->id,
            'admision_proceso_id' => $this->proceso->id,
            'admision_programa_ofertado_id' => $this->programaOfertado->id,
            'codigo_tesoreria' => $this->personaPrueba->numero_documento,
            'numero_fut' => 'FUT-2026-0001',
            'estado_pago' => 'PAGADO',
            'estado_inscripcion' => 'PAGO_VALIDADO',
        ]);

        $payload = [
            'colegio_fin_secundaria' => 'I.E. Faustino Sánchez Carrión',
            'codigo_modular_colegio' => '0349812',
            'anio_egreso_colegio' => 2024,
            'colegio_tipo_gestion' => 'PUBLICA',
            'colegio_departamento' => 'La Libertad',
            'colegio_provincia' => 'Trujillo',
            'colegio_distrito' => 'Trujillo',
            'tiene_copia_dni_color' => true,
            'tiene_partida_nacimiento' => true,
            'tiene_certificado_nacimiento_original' => true,
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/admision/postulaciones/{$postulacion->id}/completar-expediente", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.estado_inscripcion', 'INSCRITO')
            ->assertJsonPath('data.expediente_escolar.codigo_modular', '0349812')
            ->assertJsonPath('data.requisitos_verificados.tiene_copia_dni_color', true);

        $this->assertDatabaseHas('admision_postulaciones', [
            'id' => $postulacion->id,
            'codigo_modular_colegio' => '0349812',
            'estado_inscripcion' => 'INSCRITO',
        ]);
    }

    public function test_paso_5_generacion_de_datos_para_fut_y_declaracion_jurada(): void
    {
        $postulacion = AdmisionPostulacion::create([
            'codigo_postulante' => 'POST-20261-0003',
            'persona_id' => $this->personaPrueba->id,
            'admision_proceso_id' => $this->proceso->id,
            'admision_programa_ofertado_id' => $this->programaOfertado->id,
            'codigo_tesoreria' => $this->personaPrueba->numero_documento,
            'numero_fut' => 'FUT-2026-0003',
            'colegio_fin_secundaria' => 'I.E. Modelo de Trujillo',
            'codigo_modular_colegio' => '0485921',
            'anio_egreso_colegio' => 2024,
            'estado_pago' => 'PAGADO',
            'estado_inscripcion' => 'INSCRITO',
        ]);

        $resFut = $this->actingAs($this->adminUser)
            ->getJson("/api/admision/postulaciones/{$postulacion->id}/fut-documento");

        $resFut->assertStatus(200)
            ->assertJsonStructure([
                'institucion',
                'tramite' => ['numero_fut', 'fecha_emision', 'asunto', 'proceso'],
                'administrado',
                'tesoreria',
                'colegio_procedencia',
                'requisitos_adjuntos',
                'espacios_en_blanco_lapicero',
            ]);

        $resDJ = $this->actingAs($this->adminUser)
            ->getJson("/api/admision/postulaciones/{$postulacion->id}/declaracion-jurada");

        $resDJ->assertStatus(200)
            ->assertJsonStructure([
                'titulo',
                'base_legal',
                'declarante',
                'texto_declaracion',
                'compromiso_legal',
            ]);
    }

    public function test_vistas_web_imprimibles_a4_de_fut_y_declaracion_jurada(): void
    {
        $postulacion = AdmisionPostulacion::create([
            'codigo_postulante' => 'POST-20261-0004',
            'persona_id' => $this->personaPrueba->id,
            'admision_proceso_id' => $this->proceso->id,
            'admision_programa_ofertado_id' => $this->programaOfertado->id,
            'codigo_tesoreria' => $this->personaPrueba->numero_documento,
            'numero_fut' => 'FUT-2026-0004',
            'estado_pago' => 'PAGADO',
            'estado_inscripcion' => 'INSCRITO',
        ]);

        $resFutHtml = $this->get("/documentos/fut/{$postulacion->id}");
        $resFutHtml->assertStatus(200)
            ->assertSee('F.U.T. OFICIAL')
            ->assertSee('FUT-2026-0004');

        $resDJHtml = $this->get("/documentos/declaracion-jurada/{$postulacion->id}");
        $resDJHtml->assertStatus(200)
            ->assertSee('DECLARACIÓN JURADA DE NO REGISTRAR ANTECEDENTES PENALES')
            ->assertSee('Ley N° 27444');
    }
}

