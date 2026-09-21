# SPEC: Integración Frontend–Backend para Autenticación y Gestión Inicial de Usuarios

## 1. Objetivo y Alcance
Establecer la primera integración funcional entre el frontend (React) y el backend (Laravel API) para el ERP Instituto, abarcando el flujo de autenticación, manejo de sesiones y el módulo inicial de gestión de usuarios (Visualización, Creación, Edición y Desactivación Lógica/Reactivación), respetando la arquitectura y roles existentes (`superadmin`, `admin`).

## 2. Flujo de Autenticación y Sesión
### 2.1 Comunicación React → API
- **Login:** El frontend enviará credenciales (email o username, y password) mediante `POST /api/auth/login`.
- **Manejo de Sesión/Token:** La API (Laravel Sanctum) retornará un token Bearer (como ya se configuró). El frontend almacenará este token de forma segura (ej. localStorage o sessionStorage para esta fase inicial, a evaluar paso a HTTP-Only cookies posteriormente en caso de requerir protección estricta contra XSS) y lo adjuntará en el header `Authorization: Bearer <token>` de las peticiones subsecuentes usando Axios.
- **Validación de Sesión:** El frontend consultará `GET /api/auth/me` al cargar la aplicación para verificar si existe una sesión válida y obtener los datos y roles del usuario.

### 2.2 Rutas Protegidas en Frontend
- Se implementará un componente `ProtectedRoute` (o similar) con React Router que verificará la existencia del token y la validez de la sesión.
- Si no hay sesión válida, se redirigirá al usuario a la pantalla de `/login`.
- **Estados de Carga y Errores:** Se mostrarán indicadores visuales (loaders) durante la verificación de sesión inicial. Los errores `401 Unauthorized` desde cualquier petición interceptarán la aplicación para forzar el cierre de sesión local y redirección al login.

## 3. Gestión de Usuarios
### 3.1 Estructura de la Vista de Usuarios
- Una tabla (o grid) que liste a los usuarios del sistema.
- **Información a mostrar:** Nombre completo, Nombre de usuario (username), Correo, Rol principal, Estado (Activo/Deshabilitado) y Fecha de último acceso.
- **Estados de interfaz:** Manejo explícito de estados vacíos, carga de datos y alertas de error en caso de fallo de red.

### 3.2 Creación y Edición
- **Creación:** Formulario (modal o página dedicada) para registrar un usuario nuevo (Nombre, Email, Username, Password, Rol).
- **Edición:** Formulario para modificar datos básicos. La edición de contraseñas debe ser opcional o manejarse por separado.
- **Relación Usuario-Rol:** Solo se podrán asignar los roles existentes (`superadmin`, `admin`). No se crearán roles dinámicos en esta fase.

### 3.3 Desactivación y Reactivación Lógica
*Análisis de la estrategia técnica:*
El modelo `User` del backend existente ya cuenta con el campo `is_active` (boolean).
- **Estrategia Elegida:** Utilizaremos el campo **`is_active`** para controlar el acceso al sistema en lugar de la eliminación lógica nativa de Laravel (`SoftDeletes`). ¿Por qué? Porque `SoftDeletes` oculta globalmente el registro (afectando las relaciones en la base de datos). Al usar `is_active = false`:
  - Los datos se conservan íntegramente.
  - El usuario sigue existiendo para propósitos de historiales y relaciones (ej. documentos creados por él).
  - El sistema actual ya bloquea el login si `is_active == false`.
  - En la interfaz se mostrará claramente con un estado de "Deshabilitado/Inactivo".
- **Acciones permitidas:**
  - *Deshabilitar:* Cambia `is_active` a `false`. El usuario ya no podrá iniciar sesión.
  - *Reactivar:* Cambia `is_active` a `true`, restaurando su acceso completo inmediatamente. No se pierde ningún dato.

## 4. Autorización y Restricciones (Frontend y Backend)
- **Backend (Única fuente de verdad):** Se crearán los endpoints RESTful protegidos por middlewares. La validación real de quién puede crear o editar siempre ocurre aquí.
- **Frontend (UX):** Se ocultarán los botones o pantallas de administración a los que el usuario no tenga acceso según los permisos/roles devueltos por `/api/auth/me`.

### 4.1 Comportamiento según Rol/Permisos
- **`superadmin`:** Tiene acceso absoluto (bypass total, según está configurado). Puede ver, crear, editar, deshabilitar y reactivar cualquier usuario.
- **`admin`:** *[Decisión Pendiente - Ver Sección 6]* Faltan definir los permisos específicos de gestión de usuarios para este rol.

### 4.2 Protección contra acciones no autorizadas
- Cualquier petición denegada devolverá `403 Forbidden` desde la API.
- El frontend capturará este error 403 y mostrará una alerta genérica ("No tienes permisos suficientes para realizar esta acción").

## 5. Criterios de Aceptación
1. Login y obtención del Token funcionales desde React consumiendo PostgreSQL.
2. Un usuario deshabilitado (`is_active = false`) no puede iniciar sesión.
3. Rutas de React protegidas correctamente contra visitantes no autenticados (redirección a login).
4. El Frontend lista a los usuarios, mostrando su rol y su estado (Activo/Inactivo) consumiendo el nuevo endpoint del Backend.
5. Se puede deshabilitar y reactivar un usuario (Toggle lógico de `is_active`), y al deshabilitar a un usuario, no se pierden sus relaciones previas.
6. Se ocultan opciones y acciones en el Frontend si el usuario no tiene los permisos necesarios (ej. un usuario sin permisos no ve el botón "Crear Usuario").
7. Ningún usuario "normal" o "admin" (si no se le autoriza) puede escalar privilegios o crear `superadmins`.

## 6. Decisiones Pendientes
> **IMPORTANTE:** Para proceder con el PLAN de implementación, se requiere validación y respuestas sobre lo siguiente:
1. **Permisos del Rol `admin`:** La documentación actual no detalla qué puede hacer exactamente un administrador con los usuarios. ¿El `admin` puede crear otros usuarios? Si es así, ¿puede asignar el rol `superadmin` o solo `admin`? ¿Puede el `admin` deshabilitar usuarios?
2. **Método de Autenticación SPA vs API:** Por defecto estamos usando Tokens Bearer de Sanctum (como probamos en Postman). Para React, ¿está de acuerdo en guardar el token en localStorage/sessionStorage inicialmente (estándar rápido), o requiere obligatoriamente implementar autenticación stateful con Cookies HTTP-Only (que provee Sanctum SPA Auth)?
3. **Paginación:** Para la pantalla de usuarios, ¿desea que implementemos paginación en el backend desde un inicio o está bien traer la lista completa por ahora?
