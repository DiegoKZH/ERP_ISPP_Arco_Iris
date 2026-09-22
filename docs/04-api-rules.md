# Reglas del API

> Este documento describe las convenciones del API REST del proyecto. Se basa en lo **existente en el código** y establece reglas para desarrollo futuro.

---

## 1. Estado actual del API

### Rutas existentes

| Método | Ruta | Auth | Middleware | Descripción |
|--------|------|------|------------|-------------|
| `GET` | `/api/status` | No | — | Verificación de conexión (devuelve mensaje JSON) |
| `POST` | `/api/auth/login` | No | — | Autenticar usuario |
| `POST` | `/api/auth/logout` | `auth:sanctum` | — | Cerrar sesión |
| `GET` | `/api/auth/me` | `auth:sanctum` | — | Obtener usuario autenticado |
| `GET` | `/api/users` | `auth:sanctum` | `permission:usuarios.usuarios.ver` | Listar usuarios |
| `POST` | `/api/users` | `auth:sanctum` | `permission:usuarios.usuarios.crear` | Crear usuario |
| `GET` | `/api/users/{user}` | `auth:sanctum` | `permission:usuarios.usuarios.ver` | Ver usuario |
| `PUT` | `/api/users/{user}` | `auth:sanctum` | `permission:usuarios.usuarios.editar` | Actualizar usuario |
| `PATCH` | `/api/users/{user}/toggle-status` | `auth:sanctum` | `permission:...deshabilitar\|...reactivar` | Cambiar estado |
| `GET` | `/api/roles` | `auth:sanctum` | `permission:usuarios.roles.ver` | Listar roles |
| `POST` | `/api/roles` | `auth:sanctum` | `permission:usuarios.roles.crear` | Crear rol |
| `GET` | `/api/roles/{role}` | `auth:sanctum` | `permission:usuarios.roles.ver` | Ver rol |
| `PUT` | `/api/roles/{role}` | `auth:sanctum` | `permission:usuarios.roles.editar` | Actualizar rol |
| `DELETE` | `/api/roles/{role}` | `auth:sanctum` | `permission:usuarios.roles.eliminar` | Eliminar rol |

### Configuración existente

- **Prefijo**: Todas las rutas API usan el prefijo `/api/` (convención Laravel).
- **Formato de respuesta**: JSON (forzado para errores en `api/*` mediante `shouldRenderJsonWhen`).
- **Autenticación**: Laravel Sanctum disponible como middleware.
- **Archivo de rutas**: `backend/routes/api.php`.

---

## 2. Convenciones de endpoints

### 2.1 Nomenclatura (recomendada)

Basada en convenciones REST estándar y Laravel resource routes:

| Acción | Método | Ruta | Ejemplo |
|--------|--------|------|---------|
| Listar | `GET` | `/api/{recurso}` | `GET /api/estudiantes` |
| Ver detalle | `GET` | `/api/{recurso}/{id}` | `GET /api/estudiantes/1` |
| Crear | `POST` | `/api/{recurso}` | `POST /api/estudiantes` |
| Actualizar | `PUT/PATCH` | `/api/{recurso}/{id}` | `PUT /api/estudiantes/1` |
| Eliminar | `DELETE` | `/api/{recurso}/{id}` | `DELETE /api/estudiantes/1` |

### 2.2 Nombres de recursos

- Usar **plural** y **kebab-case** en español: `/api/planes-estudio`, `/api/cuentas-por-cobrar`.
- Evitar verbos en las URLs: `/api/estudiantes` en lugar de `/api/obtener-estudiantes`.
- Anidar recursos solo cuando la relación es estricta: `/api/estudiantes/{id}/matriculas`.

> **Pendiente de definición**: ¿Los endpoints usarán nombres en español o en inglés? El patrón actual (`/api/status`, `/api/user`) usa inglés. Se recomienda definir un idioma consistente.

---

## 3. Formato de respuestas

### 3.1 Respuesta exitosa (un recurso)

```json
{
    "data": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "juan@ejemplo.com"
    }
}
```

### 3.2 Respuesta exitosa (colección)

```json
{
    "data": [
        { "id": 1, "name": "Juan Pérez" },
        { "id": 2, "name": "María López" }
    ]
}
```

### 3.3 Respuesta exitosa (colección paginada)

```json
{
    "data": [...],
    "meta": {
        "current_page": 1,
        "per_page": 15,
        "total": 50,
        "last_page": 4
    },
    "links": {
        "first": "/api/estudiantes?page=1",
        "last": "/api/estudiantes?page=4",
        "prev": null,
        "next": "/api/estudiantes?page=2"
    }
}
```

> **Nota**: Este formato es el estándar de Laravel API Resources con `->paginate()`. Se recomienda usarlo directamente.

### 3.4 Respuesta de error

```json
{
    "message": "Descripción del error",
    "errors": {
        "campo": ["El campo es obligatorio."]
    }
}
```

> **Nota**: Este es el formato estándar de Laravel para errores de validación. No crear un formato custom.

---

## 4. Códigos HTTP

| Código | Uso |
|--------|-----|
| `200 OK` | Petición exitosa (GET, PUT, PATCH) |
| `201 Created` | Recurso creado exitosamente (POST) |
| `204 No Content` | Eliminación exitosa (DELETE) |
| `400 Bad Request` | Petición malformada |
| `401 Unauthorized` | No autenticado |
| `403 Forbidden` | No autorizado (sin permisos) |
| `404 Not Found` | Recurso no encontrado |
| `422 Unprocessable Entity` | Error de validación |
| `429 Too Many Requests` | Rate limiting |
| `500 Internal Server Error` | Error del servidor |

---

## 5. Validación

### 5.1 Mecanismo recomendado

Usar **Form Requests** de Laravel para validación:

```php
// backend/app/Http/Requests/StoreEstudianteRequest.php
class StoreEstudianteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:estudiantes'],
        ];
    }
}
```

### 5.2 Reglas

- La validación se realiza en el **Form Request**, no en el controlador ni en el modelo.
- Los mensajes de error deben estar en español (configurar `resources/lang/es/validation.php`).
- Las validaciones complejas (que dependen de lógica de negocio) pueden delegarse a un Service.

---

## 6. Autenticación

### 6.1 Estado actual

- **Laravel Sanctum** instalado.
- Middleware `auth:sanctum` disponible.
- **Pendiente**: Definir si se usará autenticación por cookies (SPA) o tokens (API).

### 6.2 Rutas protegidas

Todas las rutas del API (excepto login, registro y rutas públicas) deben requerir autenticación:

```php
Route::middleware('auth:sanctum')->group(function () {
    // Rutas protegidas
});
```

---

## 7. Paginación

### 7.1 Mecanismo

Usar la paginación integrada de Laravel:

```php
return EstudianteResource::collection(
    Estudiante::paginate(15)
);
```

### 7.2 Parámetros

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `page` | Número de página | 1 |
| `per_page` | Elementos por página | 15 (recomendado) |

---

## 8. Filtros y búsqueda

### Recomendación (no implementado aún)

Usar query parameters estándar:

```
GET /api/estudiantes?search=juan&programa_id=3&estado=activo&sort=-created_at
```

| Parámetro | Descripción |
|-----------|-------------|
| `search` | Búsqueda textual general |
| `sort` | Campo de ordenamiento (prefijo `-` para descendente) |
| `{campo}` | Filtro por campo específico |

---

## 9. Transacciones

Para operaciones que afecten múltiples tablas, usar transacciones de base de datos:

```php
DB::transaction(function () {
    // Múltiples operaciones que deben ser atómicas
});
```

No es necesario envolver cada operación CRUD simple en una transacción.

---

## 10. Versionamiento

**Pendiente de definición**: ¿Se versionará el API (`/api/v1/...`)?

Para un sistema interno (no expuesto a terceros), el versionamiento del API generalmente no es necesario en fases tempranas.

---

## 11. Reglas de middleware y rutas

### 11.1 Imports en archivos de rutas

- **Todos los controladores deben importarse con `use`** al inicio del archivo de rutas.
- No usar FQCN inline (e.g., `\App\Http\Controllers\Api\RoleController::class`).
- Mantener los imports ordenados alfabéticamente.

```php
// ✅ Correcto
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;

// ❌ Incorrecto
Route::get('/', [\App\Http\Controllers\Api\RoleController::class, 'index']);
```

### 11.2 Middleware de permisos con múltiples valores

Cuando una ruta requiere **cualquiera de varios permisos**, se usa el separador `|` (pipe):

```php
->middleware('permission:permiso.a|permiso.b')
```

El middleware `CheckPermission` hace `explode('|')` y verifica que el usuario tenga **al menos uno** de los permisos listados. Esto aplica de la misma forma para `CheckRole`.

> **Regla**: Todo middleware personalizado que acepte valores múltiples **debe** implementar `explode('|')` para su correcto funcionamiento. No asumir que el string recibido es un valor único.

### 11.3 Convención de permisos

Los permisos siguen la taxonomía jerárquica `<modulo>.<recurso>.<accion>`:

```
usuarios.usuarios.ver
usuarios.usuarios.crear
usuarios.usuarios.editar
usuarios.usuarios.deshabilitar
usuarios.usuarios.reactivar
usuarios.roles.ver
usuarios.roles.crear
usuarios.roles.editar
usuarios.roles.eliminar
```

> **Regla**: No abreviar ni romper la convención (e.g., `usuarios.crear` es incorrecto; debe ser `usuarios.usuarios.crear`).

### 11.4 No dejar rutas legacy

- No mantener endpoints duplicados o de boilerplate (e.g., `/api/user` del scaffolding de Laravel).
- Si un endpoint es reemplazado por otro, eliminar el antiguo.

---

*Última actualización: Septiembre 2026*
