# PLAN: Integración Frontend–Backend para Autenticación y Gestión Inicial de Usuarios

## 1. Decisiones Adoptadas
Dado que se autorizó proceder, se adoptan los siguientes comportamientos por defecto para esta fase inicial:
- **Permisos de `admin`:** Podrán listar, crear y deshabilitar usuarios, pero **solo podrán asignar el rol de `admin`**. No pueden crear ni editar a un `superadmin`.
- **Autenticación Frontend:** Uso de Token Bearer almacenado en `localStorage`.
- **Paginación:** La API retornará la lista completa de usuarios sin paginación (fase inicial MVP).

## 2. Cambios en Backend
1. **Controladores:** Crear `UserController` en `Api` con métodos `index`, `store`, `update`, `toggleStatus`.
2. **Requests:** Crear `UserStoreRequest` y `UserUpdateRequest` para validaciones de datos (nombres, correos únicos, roles válidos).
3. **Rutas:** Registrar en `routes/api.php` bajo el middleware `auth:sanctum` las rutas correspondientes, protegiendo las acciones de modificación con permisos/roles (`superadmin` o `admin`).
4. **Middlewares / Policies:** Ajustar la autorización (si un `admin` intenta crear un `superadmin`, el backend lo debe rechazar con 403).

## 3. Cambios en Frontend (React)
1. **Configuración Axios:** Instalar `axios` y crear una instancia base que intercepte peticiones para inyectar el token desde `localStorage` y capturar errores 401/403.
2. **Contexto de Autenticación (`AuthContext`):** Manejar estado global del usuario logueado, login, logout y carga inicial.
3. **Rutas y Navegación:** Instalar `react-router-dom`. Configurar en `app.jsx` las rutas:
   - `/login` (Pública)
   - `/` (Dashboard/Usuarios - Protegida mediante componente `ProtectedRoute`)
4. **Pantallas y Componentes:**
   - **Página de Login:** Formulario básico de usuario/correo y contraseña.
   - **Dashboard (Usuarios):** Tabla listando usuarios consumiendo `GET /api/users`.
   - **Formulario Modal (Crear/Editar):** Campos para los datos del usuario.
   - **Acciones (Toggle Status):** Botón para habilitar/deshabilitar según `is_active`.
5. **Estilos:** Uso de TailwindCSS v4 (existente) con diseño moderno, glassmorphism sutil y tipografía clara.

## 4. Secuencia de Trabajo
El desarrollo se hará de "atrás hacia adelante" (Backend -> Frontend) para que React pueda consumir directamente la API funcional.

**Fase 1: API Backend**
- Implementar `UserController`, FormRequests y configuración de rutas protegidas.

**Fase 2: Autenticación Frontend**
- Instalar dependencias JS (`axios`, `react-router-dom`, `lucide-react`).
- Crear interceptor Axios y `AuthContext`.
- Implementar Vista de Login y `ProtectedRoute`.

**Fase 3: Gestión de Usuarios Frontend**
- Implementar servicio `userService.js`.
- Construir interfaz de listado de usuarios y tabla.
- Construir formularios de creación/edición de usuarios.
- Implementar botones de toggle activo/inactivo.

**Fase 4: Verificación**
- Pruebas manuales desde el navegador y ajustes finales.
