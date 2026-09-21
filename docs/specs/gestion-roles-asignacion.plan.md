# Plan de Implementación: Gestión de Roles (CRUD) y Asignación Dinámica de Usuarios

> **Especificación**: [`docs/specs/gestion-roles-asignacion.md`](file:///c:/Users/RECURSOS%20HUMANOS/Documents/PROYECTO/erp-instituto/docs/specs/gestion-roles-asignacion.md)

---

## 1. Alcance Técnico

1. Crear `RoleController.php`, `RoleStoreRequest.php` y `RoleUpdateRequest.php` en el backend.
2. Registrar rutas `/api/roles` en `routes/api.php`.
3. Crear las pruebas unitarias en `RoleControllerTest.php`.
4. Crear `roleService.js` y `RolesList.jsx` en el frontend.
5. Actualizar `UsersList.jsx` para consumir roles dinámicamente desde el backend excluyendo `superadmin`.
6. Actualizar `App.jsx` y `DashboardLayout.jsx` con la nueva navegación a `/roles`.

---

## 2. Archivos a modificar / crear

- `backend/app/Http/Controllers/Api/RoleController.php`
- `backend/app/Http/Requests/RoleStoreRequest.php`
- `backend/app/Http/Requests/RoleUpdateRequest.php`
- `backend/routes/api.php`
- `backend/tests/Feature/RoleControllerTest.php`
- `frontend/src/services/roleService.js`
- `frontend/src/pages/roles/RolesList.jsx`
- `frontend/src/pages/users/UsersList.jsx`
- `frontend/src/layouts/DashboardLayout.jsx`
- `frontend/src/App.jsx`
