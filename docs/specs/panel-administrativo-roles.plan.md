# Plan de Implementación: Roles Docente/Estudiante y Panel Administrativo Responsivo/Adaptativo

> **Especificación**: [`docs/specs/panel-administrativo-roles.md`](file:///c:/Users/RECURSOS%20HUMANOS/Documents/PROYECTO/erp-instituto/docs/specs/panel-administrativo-roles.md)

---

## 1. Alcance Técnico

1. Actualizar `RoleSeeder.php` en el backend para incluir los roles `docente` y `estudiante`.
2. Actualizar las pruebas automatizadas `DatabaseSeederTest.php`.
3. Construir `DashboardLayout.jsx` en el frontend utilizando Material UI para la barra superior, sidebar navegación responsiva y filtrado adaptativo de rutas según los roles del usuario.
4. Crear la vista de inicio del dashboard `DashboardHome.jsx`.
5. Actualizar la configuración de rutas en `App.jsx`.

---

## 2. Archivos a modificar / crear

- `backend/database/seeders/RoleSeeder.php`
- `backend/tests/Feature/DatabaseSeederTest.php`
- `frontend/src/layouts/DashboardLayout.jsx`
- `frontend/src/pages/dashboard/DashboardHome.jsx`
- `frontend/src/App.jsx`

---

## 3. Estrategia de Verificación

- `php artisan test --filter=DatabaseSeederTest`
- `php artisan migrate:fresh --seed`
