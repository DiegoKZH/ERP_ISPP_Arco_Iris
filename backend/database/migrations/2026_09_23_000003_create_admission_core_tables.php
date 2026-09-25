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
        Schema::create('admision_procesos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos')->cascadeOnDelete();
            $table->string('nombre', 150);
            $table->string('codigo', 30)->unique()->index();
            $table->date('fecha_inicio_inscripcion');
            $table->date('fecha_fin_inscripcion');
            $table->date('fecha_evaluacion');
            $table->date('fecha_publicacion_resultados');
            $table->decimal('puntaje_minimo_aprobatorio', 5, 2)->default(11.00);
            $table->string('estado', 30)->default('PLANIFICADO')->index();
            $table->timestamps();
        });

        Schema::create('admision_modalidades', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('codigo', 30)->unique()->index();
            $table->text('descripcion')->nullable();
            $table->string('tipo', 30)->default('ORDINARIO');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('admision_programas_ofertados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admision_proceso_id')->constrained('admision_procesos')->cascadeOnDelete();
            $table->foreignId('programa_estudio_id')->constrained('programas_estudio')->cascadeOnDelete();
            $table->foreignId('admision_modalidad_id')->constrained('admision_modalidades')->cascadeOnDelete();
            $table->integer('vacantes')->default(0);
            $table->timestamps();

            $table->unique(
                ['admision_proceso_id', 'programa_estudio_id', 'admision_modalidad_id'],
                'uq_proc_prog_mod'
            );
        });

        Schema::create('admision_requisitos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->boolean('es_obligatorio')->default(true);
            $table->string('formato_permitido', 50)->default('PDF');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('admision_modalidad_requisitos', function (Blueprint $table) {
            $table->foreignId('admision_modalidad_id')->constrained('admision_modalidades')->cascadeOnDelete();
            $table->foreignId('admision_requisito_id')->constrained('admision_requisitos')->cascadeOnDelete();
            $table->primary(['admision_modalidad_id', 'admision_requisito_id'], 'pk_mod_req');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admision_modalidad_requisitos');
        Schema::dropIfExists('admision_requisitos');
        Schema::dropIfExists('admision_programas_ofertados');
        Schema::dropIfExists('admision_modalidades');
        Schema::dropIfExists('admision_procesos');
    }
};

