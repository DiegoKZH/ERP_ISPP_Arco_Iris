# Especificación SDD: Gestión de Roles y Dinamismo de Asignación en Usuarios

## 1. Contexto y Objetivos

- **Objetivo**:
  1. **Dinamismo en Asignación de Roles**: Cargar la lista de roles dinámicamente desde el backend (`GET /api/roles`) en el formulario de gestión de usuarios (`UsersList.jsx`), excluyendo el rol `superadmin` para evitar la creación indiscriminada de superadministradores desde la interfaz.
  2. **Gestión CRUD de Roles (`RoleController.php`)**:
     - Crear endpoints para listar (`GET /api/roles`), crear (`POST /api/roles`), editar (`PUT /api/roles/{role}`) y eliminar (`DELETE /api/roles/{role}`).
     - **Protección de Roles de Sistema**: No se permite modificar ni eliminar roles con `is_system = true` (ej: `superadmin`).
     - **Protección de Roles Protegidos**: Tampoco se permite eliminar el rol base `admin`.
  3. **Interfaz de Gestión de Roles (`RolesList.jsx`)**:
     - Nueva vista protegida para crear, editar y eliminar roles (nombre, slug, descripción).
     - Incorporación del enlace a "Gestión de Roles" en el `DashboardLayout.jsx` para usuarios administradores.

---

## 2. Requisitos Backend

### 2.1 Controladores & Rutas
- Crear `App\Http\Controllers\Api\RoleController.php` con métodos: `index`, `store`, `update`, `destroy`.
- Rutas en `routes/api.php` bajo middleware `auth:sanctum` y permisos correspondientes (`usuarios.roles.ver`, `usuarios.roles.crear`, `usuarios.roles.editar`, `usuarios.roles.eliminar`).

### 2.2 Requests de Validación
- `RoleStoreRequest`: `name` (required|string), `slug` (required|string|unique:roles), `description` (nullable|string).
- `RoleUpdateRequest`: `name` (required|string), `slug` (required|string|unique:roles,slug,{id}), `description` (nullable|string).

### 2.3 Reglas de Negocio
- Si se intenta editar/eliminar un rol `is_system = true`, la API retornará HTTP 403 Forbidden ("Los roles del sistema no se pueden modificar ni eliminar").
- Si se intenta eliminar un rol asignado a usuarios existentes, se impedirá la acción con una respuesta clara.

---

## 3. Requisitos Frontend

### 3.1 Servicio API (`roleService.js`)
- `getRoles()`, `createRole(data)`, `updateRole(id, data)`, `deleteRole(id)`.

### 3.2 Actualización en `UsersList.jsx`
- Al abrir el modal de creación/edición de usuario, se obtienen los roles disponibles desde `roleService.getRoles()`.
- Se filtran los roles eliminando `superadmin` del `<MenuItem>` para que el administrador solo pueda asignar `admin`, `docente`, `estudiante` o nuevos roles definidos.

### 3.3 Vista de Gestión de Roles (`RolesList.jsx`)
- Tabla con lista de roles, su tipo (`Sistema` vs `Personalizado`), descripción y cantidad de usuarios asignados.
- Botones para Crear, Editar y Eliminar (deshabilitado si `is_system = true` o es `admin`).
- Modal para formulario de rol.

### 3.4 Enrutamiento & Menú Lateral (`App.jsx` & `DashboardLayout.jsx`)
- Agregar ruta protegida `/roles` en `App.jsx`.
- Agregar item "Gestión de Roles" en el Sidebar del `DashboardLayout.jsx` (disponible para `superadmin` y `admin`).

---

## 4. Plan de Verificación

1. **Backend Tests (PHPUnit)**:
   - Test de API para `RoleControllerTest` comprobando que `index`, `store`, `update` y `destroy` funcionan correctamente y protegen roles del sistema.
2. **Frontend UI Verification**:
   - Verificar que al crear un usuario en `/users`, los roles mostrados vienen de la base de datos y no incluye `superadmin`.
   - Crear un nuevo rol (ej: `secretaria`) en `/roles` y comprobar que inmediatamente aparece disponible para asignarse a usuarios.
