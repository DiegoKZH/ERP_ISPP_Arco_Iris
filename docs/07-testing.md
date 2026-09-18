# Testing

> Este documento describe la estrategia de pruebas del proyecto. Se basa en la **configuración real existente** y establece pautas para pruebas futuras.

---

## 1. Estado actual

### 1.1 Configuración

| Aspecto | Valor |
|---------|-------|
| Framework | PHPUnit 12 |
| BD de tests | SQLite en memoria (`:memory:`) |
| Suites | `Unit`, `Feature` |
| Config | `phpunit.xml` en la raíz |
| Ejecución | `composer test` |
| Coverage source | `backend/app/` |

### 1.2 Tests existentes

| Archivo | Suite | Descripción |
|---------|-------|-------------|
| `tests/Feature/ExampleTest.php` | Feature | Verifica que `GET /` retorna 200 |
| `tests/Unit/ExampleTest.php` | Unit | Verifica que `true` es `true` (scaffold) |

### 1.3 Clase base TestCase

```php
// backend/tests/TestCase.php
abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
        return $app;
    }
}
```

> **Nota**: La clase base tiene un `createApplication()` personalizado para resolver correctamente el bootstrap del monorepo.

### 1.4 Configuración PHPUnit

Variables de entorno para tests (definidas en `phpunit.xml`):

| Variable | Valor | Propósito |
|----------|-------|-----------|
| `APP_ENV` | `testing` | Entorno de tests |
| `BCRYPT_ROUNDS` | `4` | Acelerar hash en tests |
| `CACHE_STORE` | `array` | Cache en memoria |
| `DB_CONNECTION` | `sqlite` | Conexión de BD |
| `DB_DATABASE` | `:memory:` | BD en memoria |
| `MAIL_MAILER` | `array` | No enviar correos reales |
| `QUEUE_CONNECTION` | `sync` | Procesar jobs inmediatamente |
| `SESSION_DRIVER` | `array` | Sesión en memoria |

---

## 2. Estrategia de pruebas

### 2.1 Tipos de prueba

| Tipo | Ubicación | Qué prueba | Cuándo usar |
|------|-----------|------------|-------------|
| **Unit** | `tests/Unit/` | Lógica aislada (Services, cálculos, utilidades) | Lógica de negocio sin dependencias de BD/HTTP |
| **Feature** | `tests/Feature/` | Flujos completos (endpoints, integración) | Endpoints API, flujos con BD, middleware |

### 2.2 Prioridades de testing

Para un ERP institucional, las pruebas deben enfocarse en (por orden de prioridad):

1. **Validaciones de datos**: Asegurar que datos inválidos sean rechazados.
2. **Autorización**: Verificar que usuarios sin permiso no accedan a recursos.
3. **Lógica de negocio crítica**: Cálculos de notas, pagos, presupuesto.
4. **Integridad de datos**: Operaciones que modifican múltiples tablas.
5. **Flujos principales**: Matrícula, pagos, trámites.

---

## 3. Convenciones para escribir tests

### 3.1 Nombrado

```php
// Patrón: test_{acción}_{resultado_esperado}
public function test_crear_estudiante_con_datos_validos(): void
public function test_crear_estudiante_sin_email_falla(): void
public function test_usuario_sin_permiso_no_puede_ver_notas(): void
```

> **Convención detectada**: El proyecto usa el prefijo `test_` con snake_case (ver ExampleTest). Mantener esta convención.

### 3.2 Estructura de un test

```php
public function test_ejemplo(): void
{
    // Arrange - Preparar datos
    $user = User::factory()->create();

    // Act - Ejecutar la acción
    $response = $this->actingAs($user)
        ->getJson('/api/recurso');

    // Assert - Verificar resultado
    $response->assertStatus(200)
        ->assertJsonStructure(['data']);
}
```

### 3.3 Traits útiles

| Trait | Uso |
|-------|-----|
| `RefreshDatabase` | Resetear BD entre tests (migraciones limpias) |
| `WithFaker` | Generar datos aleatorios |

---

## 4. Tests por tipo de funcionalidad

### 4.1 Tests de API endpoints

```php
// Test de listado
public function test_listar_recursos_retorna_coleccion(): void
{
    // Crear datos, llamar al endpoint, verificar estructura
}

// Test de creación con validación
public function test_crear_recurso_sin_campos_obligatorios_retorna_422(): void
{
    $response = $this->postJson('/api/recurso', []);
    $response->assertStatus(422)
        ->assertJsonValidationErrors(['campo_requerido']);
}

// Test de autorización
public function test_usuario_no_autenticado_recibe_401(): void
{
    $response = $this->getJson('/api/recurso-protegido');
    $response->assertStatus(401);
}
```

### 4.2 Tests de permisos

```php
public function test_usuario_sin_permiso_recibe_403(): void
{
    $user = User::factory()->create(); // sin rol especial
    $response = $this->actingAs($user)
        ->getJson('/api/recurso-restringido');
    $response->assertStatus(403);
}
```

### 4.3 Tests de validaciones

Verificar que cada regla de validación funcione correctamente:

```php
public function test_email_duplicado_es_rechazado(): void
{
    User::factory()->create(['email' => 'duplicado@test.com']);

    $response = $this->postJson('/api/users', [
        'email' => 'duplicado@test.com',
        // ...otros campos
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
}
```

### 4.4 Tests de transacciones

```php
public function test_operacion_falla_revierte_todos_los_cambios(): void
{
    // Simular fallo parcial y verificar que no quedaron datos inconsistentes
    $this->assertDatabaseMissing('tabla', ['campo' => 'valor']);
}
```

---

## 5. Ejecución

### 5.1 Comandos

```bash
# Ejecutar todos los tests
composer test

# Ejecutar solo una suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Ejecutar un test específico
php artisan test --filter=test_nombre_del_test

# Con coverage (requiere Xdebug o PCOV)
php artisan test --coverage
```

### 5.2 Recomendaciones

- Ejecutar tests antes de cada commit significativo.
- Los tests deben pasar en CI/CD antes de merge.
- Mantener los tests rápidos (usar factories, evitar seeds pesados).

---

## 6. Testing del frontend

### 6.1 Estado actual

No hay framework de testing configurado para el frontend.

### 6.2 Recomendación (cuando sea necesario)

| Herramienta | Propósito |
|-------------|-----------|
| Vitest | Tests unitarios de componentes y hooks |
| Testing Library | Testing de componentes React |
| Playwright / Cypress | Tests E2E (opcional, para flujos críticos) |

> **Prioridad**: Los tests de backend (API, validaciones, lógica de negocio) son más prioritarios que los tests de frontend en la fase actual del proyecto.

---

## 7. Tests E2E

### Pendiente

Para flujos críticos (matrícula, pagos), considerar tests E2E que:

- Simulen el flujo completo desde la UI hasta la BD.
- Verifiquen que el frontend y backend funcionan correctamente juntos.
- Se ejecuten en un entorno aislado.

> **Decisión**: Implementar cuando los primeros módulos estén funcionales.

---

*Última actualización: Septiembre 2026*
