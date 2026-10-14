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
            
            // Campos principales
            $table->string('codigo', 50)->unique(); // Ej: EF, EI
            $table->string('nombre', 200); // Ej: EF - EDUCACIÓN FÍSICA
            $table->string('estado', 20)->default('ACTIVO'); // ACTIVO / INACTIVO

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('especialidades');
    }
};