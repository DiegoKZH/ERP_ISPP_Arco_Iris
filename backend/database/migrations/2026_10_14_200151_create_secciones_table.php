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
        Schema::create('secciones', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10);
            $table->string('nombre', 100)->nullable();
            $table->string('estado', 20)->default('ACTIVO');
            
            // Columna clave para asociar la sección a la especialidad/carrera
            $table->string('especialidad_codigo', 20)->nullable();
            
            // Opcional: si manejas clave foránea por ID
            // $table->foreignId('especialidad_id')->nullable()->constrained('especialidades')->nullOnDelete();

            $table->timestamps();

            // Evitar que se repita la misma sección en la misma especialidad
            // $table->unique(['codigo', 'especialidad_codigo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('secciones');
    }
};