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

class ConvocatoriasYTesoreriaTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected PeriodoAcademico $periodo;
    protected AdmisionProceso $procesoAbierto;
    protected AdmisionProceso $procesoCerrado;
    protected AdmisionProgramaOfertado $ofertaInicial;
    protected AdmisionProgramaOfertado $ofertaFisica;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Roles y Permisos
        Role::create(['name' => 'Super Administrador', 'slug' => 'superadmin', 'is_system' => true]);
        $this->adminUser = User::factory()->create(['is_active' => true]);
        $this->adminUser->assignRole('superadmin');

        $perms = [
            'admision.procesos.ver',
            'admision.procesos.crear',
            'admision.procesos.editar',
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

        // 2. Catálogo base
        $this->periodo = PeriodoAcademico::create([
            'codigo' => '2026-I',
            'nombre' => 'Periodo Académico 2026-I',
            'fecha_inicio' => '2026-03-01',
            'fecha_fin' => '2026-07-31',
            'is_vigente' => true,
        ]);

        $progInicial = ProgramaEstudio::create([
            'codigo' => 'EI-01',
            'nombre' => 'Educación Inicial',
            'nivel_academico' => 'SUPERIOR',
            'duracion_semestres' => 10,
            'is_active' => true,
        ]);

        $progFisica = ProgramaEstudio::create([
            'codigo' => 'EF-01',
            'nombre' => 'Educación Física',
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

        // Proceso Abierto
        $this->procesoAbierto = AdmisionProceso::create([
            'periodo_academico_id' => $this->periodo->id,
            'codigo' => 'ADM-2026-1',
            'nombre' => 'Convocatoria Abierta 2026-I',
            'fecha_inicio_inscripcion' => '2026-01-01',
            'fecha_fin_inscripcion' => '2026-03-01',
            'fecha_evaluacion' => '2026-03-08',
            'fecha_publicacion_resultados' => '2026-03-10',
            'puntaje_minimo_aprobatorio' => 11.00,
            'estado' => AdmisionProceso::ESTADO_ABIERTA,
        ]);

        $this->ofertaInicial = AdmisionProgramaOfertado::create([
            'admision_proceso_id' => $this->procesoAbierto->id,
            'programa_estudio_id' => $progInicial->id,
            'admision_modalidad_id' => $modalidad->id,
            'vacantes' => 30,
        ]);

        $this->ofertaFisica = AdmisionProgramaOfertado::create([
            'admision_proceso_id' => $this->procesoAbierto->id,
            'programa_estudio_id' => $progFisica->id,
            'admision_modalidad_id' => $modalidad->id,
            'vacantes' => 30,
        ]);

        // Proceso Cerrado
        $this->procesoCerrado = AdmisionProceso::create([
            'periodo_academico_id' => $this->periodo->id,
            'codigo' => 'ADM-2026-OLD',
            'nombre' => 'Convocatoria Cerrada Pasada',
            'fecha_inicio_inscripcion' => '2025-01-01',
            'fecha_fin_inscripcion' => '2025-02-01',
            'fecha_evaluacion' => '2025-02-08',
            'fecha_publicacion_resultados' => '2025-02-10',
            'puntaje_minimo_aprobatorio' => 11.00,
            'estado' => AdmisionProceso::ESTADO_CERRADA,
        ]);
    }

    public function test_creacion_de_convocatoria_restringe_exclusivamente_a_los_dos_programas_autorizados(): void
    {
        $payload = [
            'periodo_academico_id' => $this->periodo->id,
            'nombre' => 'Proceso de Admisión Ordinario 2026-II',
            'codigo' => 'ADM-2026-2',
            'fecha_inicio_inscripcion' => '2026-08-01',
            'fecha_fin_inscripcion' => '2026-08-30',
            'fecha_evaluacion' => '2026-09-05',
            'fecha_publicacion_resultados' => '2026-09-07',
            'puntaje_minimo_aprobatorio' => 11.00,
            'estado' => 'CONVOCATORIA_ABIERTA',
            'vacantes_inicial' => 35,
            'vacantes_fisica' => 25,
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/admision/procesos', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.codigo', 'ADM-2026-2')
            ->assertJsonPath('data.estado', 'CONVOCATORIA_ABIERTA');

        $procesoId = $response->json('data.id');

        // Verificar que en base de datos SOLO existen 2 programas ofertados: Educación Inicial y Educación Física
        $ofertas = AdmisionProgramaOfertado::where('admision_proceso_id', $procesoId)->get();
        $this->assertCount(2, $ofertas);

        $nombresProgramas = $ofertas->map(fn($o) => $o->programaEstudio->nombre)->toArray();
        $this->assertContains('Educación Inicial', $nombresProgramas);
        $this->assertContains('Educación Física', $nombresProgramas);
    }

    public function test_toggle_estado_convocatoria_abierta_y_cerrada(): void
    {
        // 1. Proceso abierto -> cerrar
        $resCerrar = $this->actingAs($this->adminUser)
            ->patchJson("/api/admision/procesos/{$this->procesoAbierto->id}/toggle-estado");

        $resCerrar->assertStatus(200)
            ->assertJsonPath('estado', AdmisionProceso::ESTADO_CERRADA);

        $this->procesoAbierto->refresh();
        $this->assertEquals(AdmisionProceso::ESTADO_CERRADA, $this->procesoAbierto->estado);
        $this->assertTrue($this->procesoAbierto->isCerrada());

        // 2. Proceso cerrado -> abrir
        $resAbrir = $this->actingAs($this->adminUser)
            ->patchJson("/api/admision/procesos/{$this->procesoAbierto->id}/toggle-estado");

        $resAbrir->assertStatus(200)
            ->assertJsonPath('estado', AdmisionProceso::ESTADO_ABIERTA);

        $this->procesoAbierto->refresh();
        $this->assertEquals(AdmisionProceso::ESTADO_ABIERTA, $this->procesoAbierto->estado);
        $this->assertTrue($this->procesoAbierto->isAbierta());
    }

    public function test_bloqueo_de_nuevas_inscripciones_cuando_la_convocatoria_esta_cerrada(): void
    {
        $payload = [
            'admision_proceso_id' => $this->procesoCerrado->id,
            'admision_programa_ofertado_id' => $this->ofertaInicial->id,
            'tipo_documento' => 'DNI',
            'numero_documento' => '71122334',
            'nombres' => 'Carlos',
            'apellido_paterno' => 'Mendoza',
            'apellido_materno' => 'Ríos',
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/admision/postulaciones/pre-inscribir', $payload);

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'La convocatoria de admisión se encuentra CERRADA. No se aceptan nuevas solicitudes de inscripción.',
            ]);
    }

    public function test_redefinicion_de_ingreso_solo_dni_nombres_y_apellidos_genera_codigo_tesoreria(): void
    {
        // Solo DNI, Nombres y Apellidos
        $payload = [
            'admision_proceso_id' => $this->procesoAbierto->id,
            'admision_programa_ofertado_id' => $this->ofertaInicial->id,
            'tipo_documento' => 'DNI',
            'numero_documento' => '78945612',
            'nombres' => 'Rosa Elena',
            'apellido_paterno' => 'Castillo',
            'apellido_materno' => 'Paredes',
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/admision/postulaciones/pre-inscribir', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('codigo_tesoreria', '78945612')
            ->assertJsonPath('data.estado_pago', 'PENDIENTE')
            ->assertJsonPath('data.numero_fut', null);

        $this->assertDatabaseHas('personas', [
            'numero_documento' => '78945612',
            'nombres' => 'ROSA ELENA',
            'apellido_paterno' => 'CASTILLO',
            'apellido_materno' => 'PAREDES',
        ]);
    }

    public function test_no_permite_completar_expediente_sin_pago_validado_ni_codigo_fut(): void
    {
        $persona = Persona::create([
            'tipo_documento' => 'DNI',
            'numero_documento' => '76543210',
            'nombres' => 'Ana',
            'apellido_paterno' => 'Vásquez',
            'apellido_materno' => 'Díaz',
        ]);

        $postulacion = AdmisionPostulacion::create([
            'codigo_postulante' => 'POST-20261-999',
            'persona_id' => $persona->id,
            'admision_proceso_id' => $this->procesoAbierto->id,
            'admision_programa_ofertado_id' => $this->ofertaInicial->id,
            'codigo_tesoreria' => '76543210',
            'estado_pago' => 'PENDIENTE',
            'numero_fut' => null, // Sin FUT
        ]);

        $payload = [
            'colegio_fin_secundaria' => 'I.E. Gran Unidad Escolar',
            'codigo_modular_colegio' => '0456123',
            'anio_egreso_colegio' => 2024,
            'tiene_copia_dni_color' => true,
            'tiene_partida_nacimiento' => true,
            'tiene_certificado_nacimiento_original' => true,
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/admision/postulaciones/{$postulacion->id}/completar-expediente", $payload);

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Debe validar el pago en Tesorería y contar con un Código FUT habilitado para completar sus datos personales y expediente.',
            ]);
    }

    public function test_modulo_tesoreria_consulta_por_dni_registra_pago_y_emite_codigo_fut(): void
    {
        $persona = Persona::create([
            'tipo_documento' => 'DNI',
            'numero_documento' => '70011223',
            'nombres' => 'Pedro',
            'apellido_paterno' => 'Alvarado',
            'apellido_materno' => 'Vega',
        ]);

        $postulacion = AdmisionPostulacion::create([
            'codigo_postulante' => 'POST-20261-0088',
            'persona_id' => $persona->id,
            'admision_proceso_id' => $this->procesoAbierto->id,
            'admision_programa_ofertado_id' => $this->ofertaFisica->id,
            'codigo_tesoreria' => '70011223',
            'estado_pago' => 'PENDIENTE',
            'numero_fut' => null,
        ]);

        // 1. Consultar por DNI en Tesorería
        $resConsulta = $this->actingAs($this->adminUser)
            ->getJson('/api/tesoreria/pagos-admision/consultar/70011223');

        $resConsulta->assertStatus(200)
            ->assertJsonPath('data.codigo_tesoreria', '70011223')
            ->assertJsonPath('data.estado_pago', 'PENDIENTE');

        // 2. Registrar cobro en Tesorería y habilitar FUT
        $resPago = $this->actingAs($this->adminUser)
            ->postJson("/api/tesoreria/pagos-admision/{$postulacion->id}/registrar-pago", [
                'comprobante_pago' => 'REC-2026-0099',
                'monto_pago' => 150.00,
                'fecha_pago' => '2026-02-15',
            ]);

        $resPago->assertStatus(200)
            ->assertJsonPath('data.estado_pago', 'PAGADO')
            ->assertJsonPath('data.comprobante_pago', 'REC-2026-0099')
            ->assertJsonPath('data.estado_inscripcion', 'PAGO_VALIDADO');

        $this->assertNotNull($resPago->json('numero_fut'));
        $this->assertStringStartsWith('FUT-', $resPago->json('numero_fut'));

        // 3. Completar datos personales complementarios y expediente (Fase posterior a tesorería)
        $postulacion->refresh();

        $payloadExpediente = [
            'fecha_nacimiento' => '2005-04-12',
            'sexo' => 'M',
            'celular' => '988776655',
            'email_personal' => 'pedro.alvarado@gmail.com',
            'direccion' => 'Av. América Sur 120, Trujillo',
            'colegio_fin_secundaria' => 'I.E. San Juan',
            'codigo_modular_colegio' => '0298124',
            'anio_egreso_colegio' => 2023,
            'tiene_copia_dni_color' => true,
            'tiene_partida_nacimiento' => true,
            'tiene_certificado_nacimiento_original' => true,
        ];

        $resExpediente = $this->actingAs($this->adminUser)
            ->postJson("/api/admision/postulaciones/{$postulacion->id}/completar-expediente", $payloadExpediente);

        $resExpediente->assertStatus(200)
            ->assertJsonPath('data.estado_inscripcion', 'INSCRITO');

        // Verificar que los datos personales complementarios se guardaron en Persona
        $persona->refresh();
        $this->assertEquals('2005-04-12', $persona->fecha_nacimiento->format('Y-m-d'));
        $this->assertEquals('M', $persona->sexo);
        $this->assertEquals('988776655', $persona->celular);
        $this->assertEquals('pedro.alvarado@gmail.com', $persona->email_personal);
        $this->assertEquals('Av. América Sur 120, Trujillo', $persona->direccion);
    }

    public function test_puede_consultar_postulacion_por_dni_para_reanudar_flujo(): void
    {
        $payloadPaso1 = [
            'admision_proceso_id' => $this->procesoAbierto->id,
            'tipo_documento' => 'DNI',
            'numero_documento' => '71223344',
            'nombres' => 'Rosa Elena',
            'apellido_paterno' => 'Flores',
            'apellido_materno' => 'Quispe',
        ];

        $this->actingAs($this->adminUser)
            ->postJson('/api/admision/postulaciones/pre-inscribir', $payloadPaso1)
            ->assertStatus(201);

        // Consultar por DNI para reanudar
        $res = $this->actingAs($this->adminUser)
            ->getJson("/api/admision/postulaciones/consultar-dni/71223344?admision_proceso_id={$this->procesoAbierto->id}");

        $res->assertStatus(200)
            ->assertJsonPath('encontrado', true)
            ->assertJsonPath('data.codigo_tesoreria', '71223344')
            ->assertJsonPath('persona.nombres', 'ROSA ELENA');
    }

    public function test_pre_inscribir_con_dni_existente_reanuda_sin_error_unique(): void
    {
        $payloadPaso1 = [
            'admision_proceso_id' => $this->procesoAbierto->id,
            'tipo_documento' => 'DNI',
            'numero_documento' => '79988776',
            'nombres' => 'Carlos',
            'apellido_paterno' => 'Mendoza',
            'apellido_materno' => 'Rojas',
        ];

        // Primera llamada
        $res1 = $this->actingAs($this->adminUser)
            ->postJson('/api/admision/postulaciones/pre-inscribir', $payloadPaso1);
        $res1->assertStatus(201);

        // Segunda llamada con el mismo DNI (simulando reingreso al flujo)
        $res2 = $this->actingAs($this->adminUser)
            ->postJson('/api/admision/postulaciones/pre-inscribir', $payloadPaso1);
        $res2->assertStatus(201)
            ->assertJsonPath('codigo_tesoreria', '79988776');

        // Confirmar que no se duplicó el registro
        $this->assertEquals(1, AdmisionPostulacion::where('codigo_tesoreria', '79988776')->count());
    }

    public function test_pre_inscribir_asigna_programa_por_defecto_si_no_se_envia(): void
    {
        $payloadSinPrograma = [
            'admision_proceso_id' => $this->procesoAbierto->id,
            'tipo_documento' => 'DNI',
            'numero_documento' => '74455667',
            'nombres' => 'Marcos',
            'apellido_paterno' => 'Suarez',
            'apellido_materno' => 'Díaz',
        ];

        $res = $this->actingAs($this->adminUser)
            ->postJson('/api/admision/postulaciones/pre-inscribir', $payloadSinPrograma);

        $res->assertStatus(201)
            ->assertJsonPath('data.codigo_tesoreria', '74455667');

        $postulacion = AdmisionPostulacion::where('codigo_tesoreria', '74455667')->first();
        $this->assertNotNull($postulacion);
        $this->assertNotNull($postulacion->admision_programa_ofertado_id);
    }

    public function test_puede_eliminar_postulante_y_reutilizar_su_codigo_y_fut(): void
    {
        // 1. Crear postulante
        $payload = [
            'admision_proceso_id' => $this->procesoAbierto->id,
            'tipo_documento' => 'DNI',
            'numero_documento' => '71112233',
            'nombres' => 'Postulante Para',
            'apellido_paterno' => 'Eliminar',
            'apellido_materno' => 'Test',
        ];

        $res1 = $this->actingAs($this->adminUser)
            ->postJson('/api/admision/postulaciones/pre-inscribir', $payload);
        $res1->assertStatus(201);
        $postulacionId = $res1->json('data.id');
        $codigoLiberado = $res1->json('data.codigo_postulante');

        // 2. Validar pago para generar FUT
        $resPago = $this->actingAs($this->adminUser)
            ->postJson("/api/admision/postulaciones/{$postulacionId}/validar-pago", [
                'comprobante_pago' => 'REC-DEL-01',
                'monto_pago' => 150.00,
            ]);
        $resPago->assertStatus(200);
        $futLiberado = $resPago->json('numero_fut');

        // 3. Eliminar postulante
        $resDelete = $this->actingAs($this->adminUser)
            ->deleteJson("/api/admision/postulaciones/{$postulacionId}");
        $resDelete->assertStatus(200);

        // 4. Crear nuevo postulante y comprobar que toma el correlativo liberado
        $payloadNuevo = [
            'admision_proceso_id' => $this->procesoAbierto->id,
            'tipo_documento' => 'DNI',
            'numero_documento' => '79998888',
            'nombres' => 'Nuevo Postulante',
            'apellido_paterno' => 'QueToma',
            'apellido_materno' => 'ElCodigo',
        ];

        $resNuevo = $this->actingAs($this->adminUser)
            ->postJson('/api/admision/postulaciones/pre-inscribir', $payloadNuevo);
        $resNuevo->assertStatus(201);
        $this->assertEquals($codigoLiberado, $resNuevo->json('data.codigo_postulante'));

        // 5. Validar pago del nuevo postulante y comprobar que reutiliza el FUT liberado
        $nuevoId = $resNuevo->json('data.id');
        $resPagoNuevo = $this->actingAs($this->adminUser)
            ->postJson("/api/admision/postulaciones/{$nuevoId}/validar-pago", [
                'comprobante_pago' => 'REC-NUEVO-02',
                'monto_pago' => 150.00,
            ]);
        $resPagoNuevo->assertStatus(200);
        $this->assertEquals($futLiberado, $resPagoNuevo->json('numero_fut'));
    }

    public function test_puede_asignar_y_cambiar_especialidad_pedagogica_inmediatamente(): void
    {
        // 1. Crear postulante con oferta Inicial
        $resPre = $this->actingAs($this->adminUser)
            ->postJson('/api/admision/postulaciones/pre-inscribir', [
                'admision_proceso_id' => $this->procesoAbierto->id,
                'admision_programa_ofertado_id' => $this->ofertaInicial->id,
                'tipo_documento' => 'DNI',
                'numero_documento' => '72233445',
                'nombres' => 'Postulante Especialidad',
                'apellido_paterno' => 'Pérez',
                'apellido_materno' => 'Gómez',
            ]);
        $resPre->assertStatus(201);
        $postulacionId = $resPre->json('data.id');

        // 2. Cambiar a Educación Física en el Paso 3
        $resAsignar = $this->actingAs($this->adminUser)
            ->patchJson("/api/admision/postulaciones/{$postulacionId}/asignar-programa", [
                'admision_programa_ofertado_id' => $this->ofertaFisica->id,
            ]);

        $resAsignar->assertStatus(200)
            ->assertJsonPath('data.admision_programa_ofertado_id', $this->ofertaFisica->id);

        $this->assertDatabaseHas('admision_postulaciones', [
            'id' => $postulacionId,
            'admision_programa_ofertado_id' => $this->ofertaFisica->id,
        ]);
    }
}
