<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('admision_postulaciones', function (Blueprint $table) {
            $table->string('codigo_tesoreria', 30)->nullable()->after('codigo_postulante')->index();
            $table->string('estado_pago', 30)->default('PENDIENTE')->after('codigo_tesoreria')->index();
            $table->timestamp('fecha_pago')->nullable()->after('estado_pago');
            $table->string('comprobante_pago', 50)->nullable()->after('fecha_pago');
            $table->decimal('monto_pago', 10, 2)->nullable()->after('comprobante_pago');

            $table->string('numero_fut', 30)->nullable()->unique()->after('monto_pago');
            $table->timestamp('fecha_emision_fut')->nullable()->after('numero_fut');

            $table->string('colegio_fin_secundaria', 200)->nullable()->after('fecha_emision_fut');
            $table->string('codigo_modular_colegio', 10)->nullable()->after('colegio_fin_secundaria')->index();
            $table->integer('anio_egreso_colegio')->nullable()->after('codigo_modular_colegio');
            $table->string('colegio_tipo_gestion', 20)->nullable()->after('anio_egreso_colegio');
            $table->string('colegio_departamento', 50)->nullable()->after('colegio_tipo_gestion');
            $table->string('colegio_provincia', 50)->nullable()->after('colegio_departamento');
            $table->string('colegio_distrito', 50)->nullable()->after('colegio_provincia');

            $table->string('foto_url', 255)->nullable()->after('colegio_distrito');
            $table->boolean('tiene_copia_dni_color')->default(false)->after('foto_url');
            $table->boolean('tiene_partida_nacimiento')->default(false)->after('tiene_copia_dni_color');
            $table->boolean('tiene_certificado_nacimiento_original')->default(false)->after('tiene_partida_nacimiento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admision_postulaciones', function (Blueprint $table) {
            $table->dropColumn([
                'codigo_tesoreria',
                'estado_pago',
                'fecha_pago',
                'comprobante_pago',
                'monto_pago',
                'numero_fut',
                'fecha_emision_fut',
                'colegio_fin_secundaria',
                'codigo_modular_colegio',
                'anio_egreso_colegio',
                'colegio_tipo_gestion',
                'colegio_departamento',
                'colegio_provincia',
                'colegio_distrito',
                'foto_url',
                'tiene_copia_dni_color',
                'tiene_partida_nacimiento',
                'tiene_certificado_nacimiento_original',
            ]);
        });
    }
};

