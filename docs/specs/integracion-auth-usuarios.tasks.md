# TASKS: Integración Frontend–Backend para Autenticación y Gestión Inicial de Usuarios

- [ ] **Fase 1: API Backend**
  - [ ] Crear `UserController` y recursos para la API.
  - [ ] Crear `UserStoreRequest` (validar email/username únicos, y rol permitido).
  - [ ] Crear `UserUpdateRequest` (validar emails únicos ignorando el actual, validación de contraseñas opcional).
  - [ ] Implementar rutas en `routes/api.php` bajo `auth:sanctum` y validación de permisos (role `admin` o `superadmin`).
  - [ ] Añadir lógica en backend para evitar que un `admin` modifique o asigne el rol de `superadmin`.

- [ ] **Fase 2: Autenticación Frontend**
  - [ ] Instalar dependencias en React (`axios`, `react-router-dom`, iconos, `clsx`/`tailwind-merge` si se requiere).
  - [ ] Crear y configurar el interceptor de `axios` (`frontend/src/services/api.js`).
  - [ ] Crear el proveedor `AuthContext` (`frontend/src/context/AuthContext.jsx`) con funciones de `login`, `logout` y persistencia en `localStorage`.
  - [ ] Configurar el sistema de enrutamiento en `app.jsx`.
  - [ ] Implementar vista de Login (`frontend/src/pages/auth/Login.jsx`).
  - [ ] Implementar componente `ProtectedRoute`.

- [ ] **Fase 3: Gestión de Usuarios Frontend**
  - [ ] Crear servicio `userService.js`.
  - [ ] Implementar vista Principal / Dashboard de Usuarios (`frontend/src/pages/users/UsersList.jsx`).
  - [ ] Implementar formulario modal para crear/editar usuarios.
  - [ ] Implementar la acción de habilitar/deshabilitar usuarios (toggle de `is_active`).
  - [ ] Ajustar la UI para ocultar opciones no permitidas según el rol actual del usuario.

- [ ] **Fase 4: Verificación**
  - [ ] Probar inicio de sesión correcto e incorrecto en el Frontend.
  - [ ] Probar redirección por token expirado / invalido.
  - [ ] Probar creación de usuario (con validación de errores).
  - [ ] Probar desactivación y bloqueo de sesión del usuario deshabilitado.
  - [ ] Verificar estética general.
