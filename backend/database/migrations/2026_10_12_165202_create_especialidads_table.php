<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('especialidades', function (Blueprint $table) {
            $table->id();
            
            // Relación con el programa académico (1: Ciencias Pedagógicas, 2: Salud, etc.)
            $table->unsignedBigInteger('programa_academico_id')->default(1); 
            
            // Campos principales
            $table->string('codigo', 50)->unique(); // Ej: EF, EI
            $table->string('nombre', 200); // Ej: EF - EDUCACIÓN FÍSICA
            
            // Selectores configurados como strings para coincidir con tu diseño Frontend (SI/NO, ACTIVO/INACTIVO)
            $table->string('estado', 20)->default('ACTIVO');
            $table->string('agil', 2)->default('NO');
            $table->string('calendario', 2)->default('SI');
            $table->string('admision', 2)->default('SI');
            $table->string('solicitar_datos', 2)->default('SI');
            
            // Campos opcionales de texto
            $table->string('email_coordinador', 150)->nullable();
            $table->string('grado_bachiller', 150)->nullable();
            $table->string('grado_titulo', 150)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('especialidades');
    }
};