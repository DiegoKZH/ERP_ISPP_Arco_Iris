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
        Schema::create('admision_evaluaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admision_proceso_id')->constrained('admision_procesos')->cascadeOnDelete();
            $table->string('nombre', 100);
            $table->decimal('peso_porcentual', 5, 2); // ej. 60.00 (%)
            $table->decimal('puntaje_maximo', 5, 2)->default(20.00);
            $table->integer('orden')->default(1);
            $table->timestamps();
        });

        Schema::create('admision_calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admision_postulacion_id')->constrained('admision_postulaciones')->cascadeOnDelete();
            $table->foreignId('admision_evaluacion_id')->constrained('admision_evaluaciones')->cascadeOnDelete();
            $table->decimal('puntaje', 5, 2)->default(0.00);
            $table->foreignId('evaluador_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(
                ['admision_postulacion_id', 'admision_evaluacion_id'],
                'uq_post_eval'
            );
        });

        Schema::create('admision_resultados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admision_postulacion_id')->constrained('admision_postulaciones')->cascadeOnDelete();
            $table->decimal('puntaje_final', 5, 2);
            $table->integer('orden_merito')->index();
            $table->string('condicion', 30)->index(); // 'INGRESANTE', 'NO_INGRESANTE', 'NO_SE_PRESENTO', 'DESCALIFICADO'
            $table->boolean('es_adjudicado')->default(false)->index();
            $table->timestamps();

            $table->unique(['admision_postulacion_id'], 'uq_res_post');
        });

        Schema::create('admision_constancias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admision_postulacion_id')->constrained('admision_postulaciones')->cascadeOnDelete();
            $table->string('codigo_constancia', 50)->unique()->index();
            $table->date('fecha_emision')->useCurrent();
            $table->string('hash_seguridad', 100);
            $table->foreignId('emitido_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admision_constancias');
        Schema::dropIfExists('admision_resultados');
        Schema::dropIfExists('admision_calificaciones');
        Schema::dropIfExists('admision_evaluaciones');
    }
};

