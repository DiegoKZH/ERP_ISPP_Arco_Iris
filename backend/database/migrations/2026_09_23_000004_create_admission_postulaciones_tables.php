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
        Schema::create('admision_postulaciones', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_postulante', 30)->unique()->index();
            $table->foreignId('persona_id')->constrained('personas')->cascadeOnDelete();
            $table->foreignId('admision_proceso_id')->constrained('admision_procesos')->cascadeOnDelete();
            $table->foreignId('admision_programa_ofertado_id')->constrained('admision_programas_ofertados')->cascadeOnDelete();
            $table->timestamp('fecha_inscripcion')->useCurrent();
            $table->string('estado_inscripcion', 30)->default('REGISTRADO')->index();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['persona_id', 'admision_proceso_id'], 'uq_persona_proceso');
        });

        Schema::create('admision_documentos_postulante', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admision_postulacion_id')->constrained('admision_postulaciones')->cascadeOnDelete();
            $table->foreignId('admision_requisito_id')->constrained('admision_requisitos')->cascadeOnDelete();
            $table->string('archivo_url', 255)->nullable();
            $table->string('estado', 30)->default('PENDIENTE')->index();
            $table->text('observacion')->nullable();
            $table->foreignId('validado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_validacion')->nullable();
            $table->timestamps();
        });

        Schema::create('admision_ambientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admision_proceso_id')->constrained('admision_procesos')->cascadeOnDelete();
            $table->string('codigo_aula', 30)->index();
            $table->string('pabellon', 50)->nullable();
            $table->integer('capacidad')->default(30);
            $table->foreignId('responsable_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('admision_postulante_ambiente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admision_postulacion_id')->constrained('admision_postulaciones')->cascadeOnDelete();
            $table->foreignId('admision_ambiente_id')->constrained('admision_ambientes')->cascadeOnDelete();
            $table->integer('numero_asiento')->nullable();
            $table->boolean('asistio')->nullable();
            $table->timestamps();

            $table->unique(['admision_postulacion_id'], 'uq_postulacion_ambiente');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admision_postulante_ambiente');
        Schema::dropIfExists('admision_ambientes');
        Schema::dropIfExists('admision_documentos_postulante');
        Schema::dropIfExists('admision_postulaciones');
    }
};

