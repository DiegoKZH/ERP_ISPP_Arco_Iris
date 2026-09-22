# Seguridad

> Este documento describe los mecanismos de seguridad del proyecto, diferenciando entre lo **implementado**, lo **recomendado** y lo **pendiente**.

---

## 1. Autenticación

### 1.1 Implementado

| Mecanismo | Estado | Detalle |
|-----------|--------|---------|
| Laravel Sanctum | Implementado | Autenticación híbrida vía tokens (`personal_access_tokens`) y sesiones web |
| Endpoints Auth | Implementado | `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` con `LoginRequest` y `UserResource` |
| Guard `session` / `sanctum` | Configurado | Guard por defecto y middleware `auth:sanctum` |
| Provider Eloquent | Configurado | Modelo `User` con trait `HasApiTokens` y `SoftDeletes` |
| Control de Estado | Implementado | Campo `is_active` (bloqueo 403 para usuarios inactivos) |
| Hash de contraseñas | Configurado | Cast `'password' => 'hashed'` en User (bcrypt con 12 rondas en prod, 4 en tests) |
| Password reset tokens | Migración existente | Tabla `password_reset_tokens` |
| Sessions en BD | Configurado | `SESSION_DRIVER=database` |

### 1.2 Pendiente de definición

- **Verificación de email**: `MustVerifyEmail` está comentado en `User.php`. ¿Se requiere obligatoriamente?
- **Autenticación de dos factores (2FA)**: ¿Se requiere para roles administrativos de alta sensibilidad?

---

## 2. Autorización

### 2.1 Implementado

| Mecanismo | Estado | Detalle |
|-----------|--------|---------|
| Modelos RBAC | Implementado | Modelos `Role` y `Permission` con relaciones N:M |
| Tablas de Asignación | Implementado | `role_user`, `permission_role`, `permission_user` (con columna `granted`) |
| Trait de Permisos | Implementado | `HasRolesAndPermissions` en `User` (`hasRole`, `hasPermission`, `getAllPermissions`) |
| Middleware de Protección | Implementado | `CheckPermission` (`permission:...`) y `CheckRole` (`role:...`) registrados en bootstrap |
| Superadmin Bypass | Implementado | `Gate::before` y lógica interna para rol `superadmin` |
| Taxonomía de Permisos | Implementado | Formato jerárquico `<modulo>.<recurso>.<accion>` |

### 2.2 Pendiente de definición

| Decisión | Opciones | Recomendación |
|---|---|---|
| Definición de roles institucionales adicionales | Según necesidad de cada módulo | Registrar roles y permisos vía seeders en sus respectivos módulos |
| Jerarquías organizacionales | Asignación por dependencia / área | Integrar con módulo de RRHH |

### 2.3 Reglas de middleware

- **Middleware `CheckPermission`** soporta múltiples permisos separados por `|` (pipe). Verifica que el usuario tenga **al menos uno** de los permisos listados.
- **Middleware `CheckRole`** soporta múltiples roles separados por `|` (pipe). Verifica que el usuario tenga **al menos uno** de los roles listados.
- Todo middleware personalizado que reciba parámetros con posibilidad de valores múltiples **debe** implementar `explode('|')` para procesarlos correctamente.

> **Lección aprendida**: Un middleware que no separe los valores por `|` buscará literalmente un permiso llamado `"a|b"`, que nunca existirá. Esto rompe silenciosamente la autorización.

---

## 3. Validación de datos

### 3.1 Implementado

- **Modelo User**: `#[Fillable]` limita mass assignment a `name`, `email`, `password`.
- **Migraciones**: Constraints de BD (`unique` en email, `nullable` donde corresponde).

### 3.2 Reglas

- Toda entrada del usuario debe validarse en el **backend** mediante Form Requests.
- La validación del frontend es complementaria (UX), nunca sustituta.
- No confiar en datos del cliente; validar siempre en el servidor.

---

## 4. Protección de datos

### 4.1 Datos sensibles identificados

| Tipo de dato | Ejemplos | Nivel de protección |
|--------------|----------|---------------------|
| Credenciales | Contraseñas | Hash bcrypt (implementado) |
| Datos personales | DNI, dirección, teléfono | Acceso restringido (pendiente) |
| Información académica | Notas, matrícula | Acceso por rol (pendiente) |
| Información financiera | Pagos, deudas, planilla | Acceso restringido (pendiente) |
| Información de salud | Atenciones bienestar | Acceso altamente restringido (pendiente) |

### 4.2 Implementado

- **Hidden attributes**: `password` y `remember_token` excluidos de serialización (`#[Hidden]`).
- **Hashed password**: Cast automático en el modelo User.

### 4.3 Recomendado (no implementado)

- **API Resources**: Usar Resources para controlar qué campos se exponen en cada endpoint.
- **Encryption**: Considerar encriptar datos altamente sensibles en BD.
- **Audit trail**: Registrar quién accede a datos sensibles.

---

## 5. Protección de la aplicación

### 5.1 Implementado

| Protección | Detalle |
|------------|---------|
| CSRF | Protección automática de Laravel para rutas web |
| JSON error rendering | Errores en API devueltos como JSON (no HTML con stack trace) |
| `.env` fuera de public | Archivo `.env` en la raíz, no accesible via web |
| `.gitignore` | `.env`, vendor, storage keys excluidos del repositorio |
| npm audit | `audit=true` en `.npmrc` |
| ignore-scripts | `ignore-scripts=true` en `.npmrc` (previene ejecución de scripts maliciosos) |

### 5.3 Variables de entorno

- Las URLs de API y configuraciones sensibles deben usar variables de entorno (`VITE_*` para frontend, `.env` para backend).
- No hardcodear URLs, hosts ni puertos en el código fuente.
- El archivo `.env.example` debe documentar todas las variables requeridas con valores de ejemplo.

```env
# Frontend
VITE_API_URL=http://localhost:8000/api
```

### 5.2 Recomendado (no implementado)

| Protección | Descripción |
|------------|-------------|
| Rate limiting | Limitar peticiones por IP/usuario (Laravel tiene throttle built-in) |
| CORS | Configurar orígenes permitidos |
| Content Security Policy | Headers de seguridad HTTP |
| SQL injection | Protección automática de Eloquent (ya funciona, pero evitar `DB::raw()` sin sanitizar) |
| XSS | React escapa por defecto, pero cuidado con `dangerouslySetInnerHTML` |

---

## 6. Auditoría

### Pendiente de definición

Para un ERP institucional, se recomienda implementar auditoría de:

- Login/logout (quién, cuándo, desde dónde).
- Operaciones críticas (creación de matrículas, modificación de notas, pagos).
- Cambios en permisos y roles.
- Acceso a datos sensibles.

> **Opciones**: `spatie/laravel-activitylog`, implementación custom, o similar.

---

## 7. Archivos y uploads

### Pendiente de definición

Cuando se implemente manejo de archivos:

- Los archivos deben almacenarse en `storage/app/` (no en `public/` directamente).
- Validar tipo, tamaño y contenido de archivos subidos.
- Usar URLs firmadas o middleware para proteger archivos privados.
- Considerar antivirus/escaneo para uploads de usuarios.

---

## 8. Consideraciones para producción

### Pendiente

- **HTTPS**: Obligatorio en producción.
- **APP_DEBUG=false**: Nunca `true` en producción.
- **APP_KEY**: Generar una clave única y segura.
- **Base de datos**: Migrar de SQLite a motor robusto.
- **Backups**: Estrategia de respaldo de BD y archivos.
- **Logs**: Configurar rotación y monitoreo de logs.
- **WAF**: Considerar firewall de aplicación web.

---

*Última actualización: Septiembre 2026*
