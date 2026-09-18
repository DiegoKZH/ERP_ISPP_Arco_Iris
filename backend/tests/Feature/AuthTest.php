<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_email(): void
    {
        $user = User::factory()->create([
            'email' => 'docente@instituto.edu.pe',
            'username' => 'docente1',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'login' => 'docente@instituto.edu.pe',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'username',
                    'is_active',
                    'roles',
                    'permissions',
                ],
            ]);

        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_user_can_login_with_username(): void
    {
        User::factory()->create([
            'email' => 'admin@instituto.edu.pe',
            'username' => 'admin_user',
            'password' => Hash::make('secretPass123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'login' => 'admin_user',
            'password' => 'secretPass123',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['username' => 'admin_user']);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'usuario@instituto.edu.pe',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'login' => 'usuario@instituto.edu.pe',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Credenciales inválidas.']);
    }

    public function test_login_fails_with_nonexistent_user(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'login' => 'inexistente@instituto.edu.pe',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Credenciales inválidas.']);
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'inactivo@instituto.edu.pe',
            'password' => Hash::make('password123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'login' => 'inactivo@instituto.edu.pe',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'error' => 'ACCOUNT_INACTIVE',
            ]);
    }

    public function test_authenticated_user_can_get_profile_via_me(): void
    {
        $user = User::factory()->create([
            'email' => 'perfil@instituto.edu.pe',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.email', 'perfil@instituto.edu.pe');
    }

    public function test_unauthenticated_user_cannot_access_me(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Sesión cerrada correctamente.']);

        $this->assertCount(0, $user->tokens);
    }
}
