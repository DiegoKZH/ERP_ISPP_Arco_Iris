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
        Schema::create('programas_estudio', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 30)->unique()->index();
            $table->string('nombre', 150);
            $table->string('nivel_academico', 50)->default('Pregrado');
            $table->integer('duracion_semestres')->default(10);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('periodos_academicos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 30)->unique()->index();
            $table->string('nombre', 100);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('is_vigente')->default(false)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('periodos_academicos');
        Schema::dropIfExists('programas_estudio');
    }
};

