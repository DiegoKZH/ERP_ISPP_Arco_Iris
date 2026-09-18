# Tareas: Persistencia PostgreSQL + Núcleo de Identidad, Roles y Permisos

> **Spec**: [persistencia-identidad-roles-permisos.md](persistencia-identidad-roles-permisos.md)  
> **Plan**: [persistencia-identidad-roles-permisos.plan.md](persistencia-identidad-roles-permisos.plan.md)  
> **Fecha**: Septiembre 2026  

---

## Instrucciones

- Completar las tareas en orden (respetar dependencias).
- Marcar como `[x]` al completar cada tarea.
- Cada tarea debe ser verificable independientemente.
- Si una tarea genera un problema inesperado, documentarlo antes de continuar.

---

## 1. Configuración de Entorno y Persistencia

- [x] Actualizar `.env.example` y `.env` con las variables de PostgreSQL (`DB_CONNECTION=pgsql`, `DB_HOST`, `DB_PORT=5432`, etc.).

## 2. Base de Datos y Migraciones

- [x] Modificar `0001_01_01_000000_create_users_table.php` para incluir `username`, `is_active`, `last_login_at` y `softDeletes`.
- [x] Crear migración para la tabla `roles`.
- [x] Crear migración para la tabla `permissions`.
- [x] Crear migración para las tablas pivot: `role_user`, `permission_role` y `permission_user`.
- [x] Crear migración para la tabla `personal_access_tokens` de Laravel Sanctum.
- [x] Verificar que las migraciones corren sin error.

## 3. Modelos y Lógica de Identidad / RBAC

- [x] Crear modelo `App\Models\Role` con atributos PHP, fillable, casts y relaciones.
- [x] Crear modelo `App\Models\Permission` con atributos PHP, fillable, casts y relaciones.
- [x] Crear trait `App\Traits\HasRolesAndPermissions` con métodos de verificación y asignación.
- [x] Actualizar modelo `App\Models\User` integrando `HasRolesAndPermissions`, `HasApiTokens`, `SoftDeletes` y atributos PHP.

## 4. Middleware y Autorización

- [x] Crear middleware `App\Http\Middleware\CheckPermission` para verificar permisos por slug con bypass a `superadmin`.
- [x] Crear middleware `App\Http\Middleware\CheckRole` para verificar roles por slug con bypass a `superadmin`.
- [x] Registrar aliases `permission` y `role` en `backend/bootstrap/app.php`.
- [x] Configurar Gate `before` para `superadmin` en `AppServiceProvider`.

## 5. Endpoints y API REST

- [x] Crear Form Request `App\Http\Requests\Auth\LoginRequest`.
- [x] Crear API Resource `App\Http\Resources\UserResource` para devolver datos de usuario con sus roles y permisos calculados.
- [x] Crear controlador `App\Http\Controllers\Api\AuthController` con métodos `login`, `logout` y `me`.
- [x] Registrar rutas `/api/auth/login`, `/api/auth/logout` y `/api/auth/me` en `backend/routes/api.php`.

## 6. Seeders y Datos Iniciales

- [x] Crear seeder `Database\Seeders\RoleSeeder` con roles iniciales (`superadmin`, `admin`).
- [x] Crear seeder `Database\Seeders\PermissionSeeder` con permisos del núcleo de usuarios.
- [x] Crear seeder `Database\Seeders\SuperAdminSeeder` para crear el usuario administrador inicial.
- [x] Actualizar `Database\Seeders\DatabaseSeeder` para invocar la secuencia de seeders.

## 7. Tests Automatizados

- [x] Crear test `backend/tests/Feature/AuthTest.php` (login, logout, perfil me, credenciales inválidas, usuario inactivo).
- [x] Crear test `backend/tests/Feature/RolePermissionTest.php` (asignaciones, permisos heredados, permisos directos, superadmin).
- [x] Crear test `backend/tests/Feature/AuthorizationMiddlewareTest.php` (protección de endpoints con middleware permission y role).
- [x] Ejecutar `composer test` y verificar que el 100% de los tests pasen exitosamente.

## 8. Documentación y Cierre

- [x] Actualizar `docs/02-architecture.md` registrando la persistencia PostgreSQL, modelos RBAC y capas creadas.
- [x] Actualizar `docs/03-domain-model.md` registrando `Role` y `Permission` como entidades existentes.
- [x] Actualizar `docs/06-security.md` registrando el sistema de autenticación y autorización implementado.
- [x] Actualizar estado de la SPEC a `completada` en `docs/specs/README.md` y en la propia SPEC.

---

*Última actualización: Septiembre 2026*
