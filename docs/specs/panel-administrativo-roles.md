# Especificación SDD: Roles Adicionales y Panel Administrativo Unificado (Responsivo y Adaptativo)

## 1. Contexto y Objetivos

- **Objetivo**:
  1. Incorporar oficialmente los roles **Docente** (`docente`) y **Estudiante** (`estudiante`) al seeder principal de roles de la base de datos (`RoleSeeder.php`).
  2. Implementar un **Panel Principal / Dashboard Layout** común (Panel Administrativo/General) responsivo y adaptativo.
  3. Reutilizar la vista principal adaptando el sidebar, menú de navegación, header y permisos disponibles según el rol activo del usuario (`superadmin`, `admin`, `docente`, `estudiante`).
  4. Mantener estricto apego al alcance: no crear módulos ni formularios nuevos sin solicitar, únicamente estructurar la navegación del panel con las opciones actuales disponibles (ej. Gestión de Usuarios para administradores/superadmins, e Inicio/Perfil para todos los roles).

---

## 2. Definición de Roles

| Rol | Slug | Description | `is_system` |
|---|---|---|---|
| **Super Administrador** | `superadmin` | Acceso total y sin restricciones a todos los módulos y configuraciones del sistema. | `true` |
| **Administrador** | `admin` | Gestión administrativa general del ERP. | `false` |
| **Docente** | `docente` | Perfil para el personal docente de la institución. | `false` |
| **Estudiante** | `estudiante` | Perfil para los estudiantes matriculados en la institución. | `false` |

---

## 3. Arquitectura del Panel Administrativo / General

### 3.1 Componente Layout (`DashboardLayout.jsx`)
- **Estructura**: Header Superior (User profile menu, boton toggle para móvil/drawer, logout) + Drawer Sidebar lateral responsivo + Área principal de contenido.
- **Responsividad**:
  - Desktop: Sidebar visible de forma fija.
  - Tablet/Móvil: Drawer colapsable con menú hamburguesa en la barra superior.
- **Adaptabilidad por Rol**:
  - Las opciones del Sidebar se calculan dinámicamente según los roles o permisos asignados al usuario en `AuthContext`.
  - **SuperAdmin / Admin**: Tienen acceso a "Inicio", "Usuarios" (Gestión de Usuarios) y "Mi Perfil".
  - **Docente / Estudiante**: Tienen acceso a "Inicio" (Bienvenida personalizada al portal) y "Mi Perfil".
  - *Nota*: Cuando se agreguen nuevos módulos funcionales a futuro, únicamente se registrarán en la configuración de navegación del panel vinculados a sus roles/permisos.

---

## 4. Requisitos Backend

1. **`RoleSeeder.php`**:
   - Agregar la inserción idempotente con `firstOrCreate` para `docente` y `estudiante`.
2. **`DatabaseSeederTest.php`**:
   - Actualizar las aserciones de conteo/existencia de roles en el test del seeder para verificar los 4 roles.

---

## 5. Requisitos Frontend

1. **`frontend/src/layouts/DashboardLayout.jsx`**:
   - Nuevo componente de Layout adaptativo usando componentes de MUI (`Drawer`, `AppBar`, `Toolbar`, `IconButton`, `List`, `ListItemButton`, `Avatar`, `Menu`).
2. **Navegación Dinámica (`config/navigation.js` o interno)**:
   - Configuración de ítems con `requiredRoles` o `requiredPermissions`.
3. **`App.jsx`**:
   - Envolver las rutas protegidas dentro del `DashboardLayout`.
4. **Vistas / Páginas**:
   - `Home.jsx`: Vista de bienvenida al panel (común y adaptable según rol).
   - `UsersList.jsx`: Mantener en la ruta `/users` restringido a roles autorizados (`superadmin`, `admin`).

---

## 6. Plan de Verificación

1. **Pruebas Automatizadas (PHPUnit)**:
   - Ejecutar `php artisan test --filter=DatabaseSeederTest` para asegurar que los 4 roles son sembrados correctamente.
2. **Pruebas Manuales UI**:
   - Iniciar sesión con un usuario Admin/SuperAdmin y verificar el acceso a la Gestión de Usuarios en el Sidebar del Panel.
   - Probar en modo pantalla pequeña (Móvil) para verificar la apertura y cierre responsivo del drawer lateral.
