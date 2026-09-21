# SPEC: Consolidación del Núcleo de Usuarios, Roles, Permisos y Autorización

> **Módulo**: Núcleo Transversal (Identidad y Seguridad)
> **Estado**: En Revisión (Pendiente de Aprobación)
> **Fecha**: Septiembre 2026

## 1. Contexto y Estado Actual

Actualmente existe una implementación funcional y probada que conecta el frontend React con el backend Laravel (PostgreSQL). Las estructuras existentes y que **deben conservarse** incluyen:
- **Tablas core:** `users` (con `is_active` para baja lógica), `roles` (con `is_system`), `permissions`.
- **Tablas intermedias:** `role_user`, `permission_role`, `permission_user`.
- **Autenticación:** Laravel Sanctum mediante `personal_access_tokens`.
- **Roles base existentes:** `Super Administrador` (superadmin, is_system=true) y `Administrador` (admin, is_system=false).
- **Frontend:** Protección básica de rutas.

El objetivo de esta SPEC no es reconstruir el núcleo, sino **consolidarlo, establecer las reglas de negocio sobre cómo se usarán los perfiles (sin inventar estructuras paralelas) y sentar las bases para la escalabilidad a los 14 módulos.**

---

## 2. Decisiones de Diseño y Representación de Perfiles

### 2.1 Multiplicidad de Roles vs. "Tipos de Usuario"
No se creará una columna o tabla `tipo_usuario`. Todo el acceso y perfilado se manejará a través de la tabla intermedia `role_user`. 
*Razonamiento:* En el mundo real de la institución, una persona puede ser `Docente` y a la vez `Encargado de Unidad Académica`. Asignarle múltiples roles en `role_user` permite heredar la suma de sus permisos sin crear perfiles combinados artificiales.

### 2.2 Perfiles Propuestos (Sujetos a Definición Institucional)
A continuación se propone la estructura inicial de roles. **Nota:** No se implementarán en la base de datos hasta que la institución apruebe sus definiciones y alcances exactos (Pendiente de definición).

1. **Super Administrador (`superadmin`)**:
   - `is_system = true`.
   - Tiene acceso implícito e irrestricto a todo el ERP.
2. **Administrador (`admin`)**:
   - Gestión administrativa transversal.
3. **Encargado de Unidad Académica (`encargado_academico`)** - *Pendiente*.
4. **Docente (`docente`)** - *Pendiente*.
5. **Estudiante (`estudiante`)** - *Pendiente*.

### 2.3 Taxonomía y Granularidad de Permisos
Los permisos se definirán mediante slugs jerárquicos: `<modulo>.<recurso>.<accion>`.
Ejemplo para el módulo de usuarios:
- `usuarios.usuarios.ver` (Listar y ver detalles)
- `usuarios.usuarios.crear` (Registrar nuevos)
- `usuarios.usuarios.editar` (Modificar datos)
- `usuarios.usuarios.deshabilitar` (Cambiar `is_active` a false)
- `usuarios.usuarios.reactivar` (Cambiar `is_active` a true)
- `usuarios.roles.asignar` (Permite vincular roles)

---

## 3. Reglas de Negocio, Restricciones y Seguridad

### 3.1 Protección de Roles de Sistema (`is_system`)
- Los roles con `is_system = true` (ej. `superadmin`) **no pueden** ser eliminados, ni su slug modificado.
- Validar que usuarios con rol `admin` no puedan quitar ni asignar el rol `superadmin` a otros. Solo un `superadmin` puede crear otro `superadmin`.

### 3.2 Desactivación Lógica vs Eliminación Física
- Se prohíbe la eliminación física (DELETE) de usuarios de la tabla `users` como operación ordinaria.
- Toda eliminación será una **desactivación lógica**, estableciendo `is_active = false`. 
- Un usuario desactivado no podrá iniciar sesión.
- Para reactivarlo, se requiere un permiso específico (`usuarios.usuarios.reactivar`).

### 3.3 Autorización: Backend vs Frontend
- **Backend (Fuente de verdad)**: Todas las validaciones de acceso se harán estrictamente en el backend mediante Middleware y Gates.
- **Frontend (Experiencia de usuario)**: El frontend usará los permisos solo para ocultar botones o proteger rutas en la UI.

### 3.4 Permisos Directos Excepcionales
La tabla `permission_user` se utilizará para:
- `granted = true`: Otorga un permiso directo a un usuario.
- `granted = false`: Deniega explícitamente un permiso a un usuario (lista negra).

---

## 4. Plan de Implementación (Próximos Pasos tras Aprobación)

1. **Gate Policies:** Lógica de "Bypass" para el `superadmin` usando `Gate::before()`.
2. **Seeders:** Crear el primer paquete de permisos base para el módulo de usuarios e insertarlos.
3. **Validaciones en Controladores:** Aplicar restricciones en `UserController` para impedir modificación indebida de roles del sistema.
