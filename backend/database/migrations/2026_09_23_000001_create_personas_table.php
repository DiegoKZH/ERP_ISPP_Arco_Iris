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
        Schema::create('personas', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_documento', 20)->default('DNI');
            $table->string('numero_documento', 20)->unique()->index();
            $table->string('nombres', 100);
            $table->string('apellido_paterno', 100);
            $table->string('apellido_materno', 100);
            $table->date('fecha_nacimiento')->nullable();
            $table->char('sexo', 1)->nullable(); // 'M', 'F'
            $table->string('direccion', 255)->nullable();
            $table->string('celular', 20)->nullable();
            $table->string('email_personal', 150)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        // Add optional persona_id to users table if not exists
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'persona_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('persona_id')->nullable()->after('id')->constrained('personas')->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'persona_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['persona_id']);
                $table->dropColumn('persona_id');
            });
        }

        Schema::dropIfExists('personas');
    }
};

