# Plan de Implementación: Persistencia PostgreSQL + Núcleo de Identidad, Roles y Permisos

> **Spec**: [persistencia-identidad-roles-permisos.md](persistencia-identidad-roles-permisos.md)  
> **Fecha**: Septiembre 2026  
> **Autor**: Antigravity AI / Equipo de Desarrollo  

---

## 1. Análisis de la implementación actual

- **Base de datos**:
  - `backend/config/database.php` contiene la configuración de la conexión `'pgsql'`, pero `.env` y `.env.example` apuntan por defecto a `sqlite`.
  - Migraciones existentes: `0001_01_01_000000_create_users_table.php`, `0001_01_01_000001_create_cache_table.php`, `0001_01_01_000002_create_jobs_table.php`.
- **Autenticación**:
  - `laravel/sanctum: ^4.0` instalado.
  - Modelo `App\Models\User` con atributos PHP `#[Fillable]` y `#[Hidden]`.
  - Endpoint `/api/user` con middleware `auth:sanctum`.
- **Autorización**:
  - No existe ningún modelo, migración ni middleware de roles o permisos (RBAC).

**Estrategia de reutilización**:
- Reutilizar y enriquecer el modelo `User` y sus migraciones base con atributos `username`, `is_active`, `last_login_at` y `SoftDeletes`.
- Reutilizar Laravel Sanctum para autenticación por token/sesión e incluir la migración de `personal_access_tokens`.
- Crear un sistema de RBAC nativo sin dependencias externas pesadas, compuesto por los modelos `Role` y `Permission`, tablas pivot y middleware de validación.

---

## 2. Arquitectura afectada

- [x] Migraciones / Base de datos
- [x] Modelos
- [x] Controladores
- [x] Form Requests
- [x] API Resources
- [ ] Services (no requeridos para este núcleo base; lógica encapsulada en modelos y traits)
- [x] Middleware
- [x] Rutas API
- [ ] Componentes React (Fuera del alcance backend de este bloque)
- [ ] Páginas
- [ ] Hooks
- [ ] Servicios frontend
- [x] Tests

---

## 3. Base de datos

### Tablas nuevas

| Tabla | Descripción | Campos principales |
|---|---|---|
| `roles` | Roles institucionales | `id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at` |
| `permissions` | Permisos granulares | `id`, `module`, `name`, `slug`, `description`, `created_at`, `updated_at` |
| `role_user` | Pivot usuarios ↔ roles | `user_id`, `role_id`, `created_at` |
| `permission_role` | Pivot roles ↔ permisos | `role_id`, `permission_id`, `created_at` |
| `permission_user` | Permisos directos por usuario | `user_id`, `permission_id`, `granted`, `created_at` |
| `personal_access_tokens` | Tokens de API Sanctum | `id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at` |

### Tablas modificadas

| Tabla | Modificación |
|---|---|
| `users` | Se agregan `username` (unique, nullable), `is_active` (boolean, default true), `last_login_at` (nullable) y `deleted_at` (`softDeletes`). |

### Relaciones

- `User` ↔ `Role` (Muchos a Muchos vía `role_user`).
- `Role` ↔ `Permission` (Muchos a Muchos vía `permission_role`).
- `User` ↔ `Permission` (Muchos a Muchos directo vía `permission_user` con pivot `granted`).
- `User` ↔ `PersonalAccessToken` (1 a Muchos vía Sanctum `HasApiTokens`).

---

## 4. Backend

### Modelos

| Modelo | Tabla | Relaciones y Traits principales |
|---|---|---|
| `User` | `users` | `HasFactory`, `Notifiable`, `HasApiTokens`, `SoftDeletes`, relaciones `roles()`, `permissions()`, `directPermissions()`, métodos `hasRole()`, `hasPermission()`, `hasAnyRole()`, `assignRole()`, `givePermissionTo()`. |
| `Role` | `roles` | `HasFactory`, relaciones `users()`, `permissions()`, métodos `givePermissionTo()`, `revokePermissionTo()`, `hasPermission()`. |
| `Permission` | `permissions` | `HasFactory`, relaciones `roles()`, `users()`. |

### Endpoints

| Método | Ruta | Controlador@Método | Descripción | Middleware |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | `Api\AuthController@login` | Inicio de sesión (genera token) | `guest` |
| `POST` | `/api/auth/logout` | `Api\AuthController@logout` | Cierre de sesión (revoca token/sesión) | `auth:sanctum` |
| `GET` | `/api/auth/me` | `Api\AuthController@me` | Perfil, roles y permisos del usuario activo | `auth:sanctum` |
| `GET` | `/api/status` | Closure | Healthcheck de API existente | público |

### Form Requests

| Request | Campos validados |
|---|---|
| `Auth\LoginRequest` | `login` (required\|string), `password` (required\|string) |

### API Resources

| Resource | Responsabilidad |
|---|---|
| `UserResource` | Transformar usuario incluyendo roles (`slug`, `name`) y permisos consolidados (`slugs`). |

### Middleware

| Middleware | Alias | Responsabilidad |
|---|---|---|
| `CheckPermission` | `permission` | Valida que el usuario tenga el permiso solicitado o sea `superadmin`. |
| `CheckRole` | `role` | Valida que el usuario tenga el rol requerido o sea `superadmin`. |

---

## 5. Frontend

*(No aplica en esta fase; la SPA mantendrá su shell y consumirá `/api/status` y los nuevos endpoints de autenticación cuando se desarrolle el módulo visual).*

---

## 6. Seguridad

- **Autenticación requerida**: Sí (`auth:sanctum`) para endpoints privados y consulta de identidad.
- **Autorización**: Control estricto con `CheckPermission` y `CheckRole`, y Gate::before para `superadmin`.
- **Datos sensibles**: `password` hasheada con `bcrypt` (12 rondas en prod, 4 en tests) y oculta (`#[Hidden]`).
- **Control de cuentas inactivas**: Validación explícita de `is_active == true` durante login y ejecución de peticiones.
- **Protección SQLi**: Eloquent ORM con bindings de parámetros nativos en PostgreSQL.

---

## 7. Testing

### Tests de Backend

| Test | Suite | Qué verifica |
|---|---|---|
| `AuthTest` | Feature | Login exitoso, login con contraseña incorrecta, login con cuenta inactiva (403), logout, consulta de perfil `/api/auth/me`. |
| `UserRolePermissionTest` | Feature / Unit | Asignación de roles, herencia de permisos de rol, otorgamiento y revocación de permisos directos, verificación de superadmin. |
| `AuthorizationMiddlewareTest` | Feature | Protección de rutas con middleware `permission` y `role`, respuesta 401 si no hay auth, respuesta 403 si carece de permisos, acceso permitido a superadmin. |

---

## 8. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Falta de servicio PostgreSQL activo en entorno local | Media | Medio | La configuración soporta PostgreSQL para entorno real/staging, y SQLite `:memory:` para tests automatizados inmediatos en `phpunit.xml`. |
| Incompatibilidad de migraciones entre SQLite y PostgreSQL | Baja | Alto | Usar tipos de datos estándar de Laravel Schema Builder (`foreignId`, `timestampsTz`, `string`, `boolean`, `unique`). |
| Conflictos de nombres de permisos en futuros módulos | Baja | Medio | Establecer taxonomía formal y validación estricta de formato `<modulo>.<recurso>.<accion>`. |

---

## 9. Compatibilidad

- **Funcionalidades existentes**: No rompe ninguna funcionalidad actual; la ruta `/api/status` permanece operativa.
- **Migración de datos**: Al no existir datos de producción aún, las migraciones se aplican en estado inicial limpio.
- **Retrocompatibilidad**: Totalmente compatible con la arquitectura del monorepo Laravel 13 + React.

---

## 10. Estrategia de Implementación

1. **Configuración de persistencia**: Actualizar `.env.example` y `.env` con soporte para PostgreSQL.
2. **Migraciones**:
   - Actualizar migración de `users`.
   - Crear migraciones para `roles`, `permissions`, `role_user`, `permission_role`, `permission_user` y `personal_access_tokens`.
3. **Modelos**:
   - `Role` y `Permission`.
   - Actualizar `User` con trait de RBAC y relaciones.
4. **Middleware y Providers**:
   - Crear `CheckPermission` y `CheckRole`.
   - Registrar aliases en `bootstrap/app.php` y Gate `before` en `AppServiceProvider.php`.
5. **Endpoints y Recursos**:
   - `LoginRequest`, `UserResource`, `AuthController`, rutas en `api.php`.
6. **Seeders**:
   - `RoleSeeder`, `PermissionSeeder`, `SuperAdminSeeder` y enlace en `DatabaseSeeder`.
7. **Testing**:
   - Crear y ejecutar suite de tests automatizados.
8. **Verificación y Documentación**:
   - Actualizar arquitectura y modelo de dominio.

---

## 11. Documentación

- [x] `docs/02-architecture.md` (registrar PostgreSQL y capas añadidas)
- [x] `docs/03-domain-model.md` (registrar `User`, `Role`, `Permission` como existentes en código)
- [x] `docs/06-security.md` (registrar sistema de autorización RBAC implementado)
- [x] `docs/specs/README.md` (marcar spec como completada)

---

*Última actualización: Septiembre 2026*
