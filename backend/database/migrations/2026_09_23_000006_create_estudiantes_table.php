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
        Schema::create('estudiantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('persona_id')->unique()->constrained('personas')->cascadeOnDelete();
            $table->foreignId('programa_estudio_id')->constrained('programas_estudio')->cascadeOnDelete();
            $table->foreignId('admision_postulacion_id')->nullable()->constrained('admision_postulaciones')->nullOnDelete();
            $table->string('codigo_estudiante', 30)->unique()->index();
            $table->date('fecha_ingreso');
            $table->string('estado_academico', 30)->default('REGULAR')->index(); // 'REGULAR', 'OBSERVADO', 'RESERVA', 'EGRESADO', 'RETIRADO'
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estudiantes');
    }
};

