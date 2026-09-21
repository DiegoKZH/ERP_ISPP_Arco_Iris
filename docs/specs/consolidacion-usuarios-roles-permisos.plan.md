# PLAN: Consolidación del Núcleo de Usuarios, Roles, Permisos y Autorización

> **Módulo**: Núcleo Transversal
> **Referencia**: `docs/specs/consolidacion-usuarios-roles-permisos.md`
> **Estado**: Aprobado / En Progreso

## 1. Arquitectura de Cambios

### 1.1 Backend: Gate Policies y Middleware
- Modificar `AuthServiceProvider` (o el Provider de Auth por defecto de Laravel 13) para añadir `Gate::before`. Esto permitirá que cualquier usuario con un rol `is_system=true` y slug `superadmin` sortee (bypass) todas las validaciones de permisos y reciba autorización inmediata.

### 1.2 Backend: Data Inicial (Seeders)
- Crear/Modificar `PermissionSeeder` para insertar permisos fundacionales bajo la nomenclatura `<modulo>.<recurso>.<accion>`:
  - `usuarios.usuarios.ver`
  - `usuarios.usuarios.crear`
  - `usuarios.usuarios.editar`
  - `usuarios.usuarios.deshabilitar`
  - `usuarios.usuarios.reactivar`
  - `usuarios.roles.asignar`
- Vincular explícitamente estos permisos al rol `admin`.
- (El rol `superadmin` no requiere vinculación explícita gracias al bypass, pero el seeder lo mantendrá estructurado).

### 1.3 Backend: Controladores (UserController)
- Añadir validaciones de negocio adicionales al momento de actualizar o crear usuarios:
  - Un usuario `admin` (sin ser `superadmin`) no puede asignar el rol `superadmin`.
  - Un usuario `admin` no puede modificar, deshabilitar ni afectar a un usuario que posea el rol `superadmin`.
  - Un usuario desactivado no debe poder iniciar sesión (ajuste en lógica de `LoginRequest` / `AuthController`).

### 1.4 Backend: Rutas y Middleware
- Proteger cada endpoint en `routes/api.php` asociado a `UserController` con el middleware de permisos correspondiente (ej. `middleware(['auth:sanctum', 'permission:usuarios.usuarios.ver'])`).

## 2. Dependencias y Riesgos
- **Riesgo:** Bloquear el acceso al `superadmin`. 
- **Mitigación:** Asegurar que `Gate::before` retorne `true` explícitamente para el superadmin y `null` (no `false`) para los demás, dejando que las comprobaciones de permisos habituales sigan su curso.

## 3. Pruebas Automáticas
- Se deberán validar las reglas de autorización ejecutando `php artisan test`. Los tests deben afirmar que un `admin` recibe `403 Forbidden` si intenta manipular un `superadmin`.
