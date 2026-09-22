# Reglas del Frontend

> Este documento describe las convenciones del frontend del proyecto. Se basa en la **estructura real encontrada** y establece pautas para desarrollo futuro.

---

## 1. Estado actual del frontend

### Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.x | Biblioteca de UI |
| Vite | 8.x | Bundler y servidor de desarrollo |
| MUI (Material UI) | 9.x | Sistema de componentes de UI principal |
| Tailwind CSS | 4.x | Framework de estilos utilitarios (uso secundario) |
| Axios | 1.x | Cliente HTTP para comunicación con API |
| Lucide React | 1.x | Iconos |
| React Router DOM | 7.x | Navegación SPA |
| `@vitejs/plugin-react` | 6.x | Soporte React para Vite |
| `laravel-vite-plugin` | 3.x | Integración con Laravel |

### Estructura existente

```
frontend/
├── jsconfig.json           ← Alias @ → src/, jsx: react-jsx
├── package.json            ← Dependencias y scripts
├── vite.config.js          ← Configuración Vite
├── src/
│   ├── app.jsx             ← Entry point (createRoot + Router)
│   ├── components/         ← Componentes reutilizables
│   │   └── ProtectedRoute.jsx
│   ├── context/            ← React Context providers
│   │   └── AuthContext.jsx
│   ├── layouts/            ← Layouts compartidos
│   │   └── DashboardLayout.jsx
│   ├── pages/              ← Páginas por módulo
│   │   ├── auth/Login.jsx
│   │   ├── dashboard/DashboardHome.jsx
│   │   ├── users/UsersList.jsx
│   │   └── roles/RolesList.jsx
│   ├── services/           ← Comunicación con API
│   │   ├── api.js
│   │   ├── userService.js
│   │   └── roleService.js
│   └── theme/              ← Tema centralizado
│       └── colors.js
└── styles/
    └── app.css             ← Tailwind v4
```

### Componentes existentes

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `app.jsx` | Entry point | Monta el router, providers y rutas en `#root` |
| `ProtectedRoute.jsx` | Componente | Guard de ruta con verificación de roles |
| `AuthContext.jsx` | Context | Provider de autenticación (login, logout, user, hasRole) |
| `DashboardLayout.jsx` | Layout | Layout principal con sidebar y navbar (MUI) |
| `Login.jsx` | Página | Formulario de autenticación |
| `DashboardHome.jsx` | Página | Vista principal del dashboard |
| `UsersList.jsx` | Página | CRUD de usuarios |
| `RolesList.jsx` | Página | CRUD de roles |
| `api.js` | Servicio | Instancia Axios con interceptores (auth, error 401) |
| `userService.js` | Servicio | Funciones CRUD para usuarios |
| `roleService.js` | Servicio | Funciones CRUD para roles |
| `colors.js` | Tema | Paleta de colores centralizada |

---

## 2. Estructura de archivos

### 2.1 Estructura recomendada

A medida que el proyecto crezca, los archivos deben organizarse así:

```
frontend/src/
├── app.jsx                  ← Entry point (NO modificar sin justificación)
├── App.jsx                  ← Componente raíz (router, providers)
│
├── components/              ← Componentes reutilizables
│   ├── ui/                  ← Elementos de interfaz genéricos
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   └── ...
│   ├── forms/               ← Componentes de formulario
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   └── ...
│   └── {modulo}/            ← Componentes específicos de un módulo
│       └── ...
│
├── pages/                   ← Páginas (una por ruta principal)
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   └── {modulo}/            ← Páginas de un módulo
│       ├── Index.jsx
│       ├── Create.jsx
│       ├── Show.jsx
│       └── Edit.jsx
│
├── layouts/                 ← Layouts compartidos
│   ├── AppLayout.jsx        ← Layout principal (sidebar + navbar)
│   ├── AuthLayout.jsx       ← Layout para login/registro
│   └── ...
│
├── hooks/                   ← Custom hooks
│   ├── useAuth.js
│   ├── useFetch.js
│   └── ...
│
├── services/                ← Comunicación con API
│   ├── api.js               ← Configuración base (fetch/axios)
│   └── {modulo}Service.js   ← Funciones por módulo
│
├── utils/                   ← Utilidades generales
│   ├── formatDate.js
│   ├── formatCurrency.js
│   └── ...
│
├── context/                 ← React Context providers
│   ├── AuthContext.jsx
│   └── ...
│
└── constants/               ← Constantes
    └── ...
```

> **IMPORTANTE**: No crear carpetas vacías. Crear la estructura según sea necesario.

---

## 3. Convenciones de componentes

### 3.1 Nombrado

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componente | PascalCase | `StudentList.jsx` |
| Página | PascalCase | `Dashboard.jsx` |
| Hook | camelCase con `use` | `useAuth.js` |
| Servicio | camelCase con `Service` | `estudianteService.js` |
| Utilidad | camelCase | `formatDate.js` |
| Constante | camelCase (archivo), UPPER_CASE (variable) | `roles.js` → `ROLE_ADMIN` |

### 3.2 Extensiones

- `.jsx` para archivos con JSX.
- `.js` para archivos sin JSX (hooks, services, utils).

### 3.3 Patrón de componente

```jsx
// Convención detectada: función exportada por defecto
export default function ComponentName({ prop1, prop2 }) {
    // Estado
    const [state, setState] = useState(initialValue);

    // Efectos
    useEffect(() => {
        // ...
    }, [dependencies]);

    // Handlers
    const handleAction = () => {
        // ...
    };

    // Render
    return (
        <div>
            {/* JSX */}
        </div>
    );
}
```

> **Convención detectada**: El proyecto usa funciones con `export default` (ver `Main.jsx`). Mantener esta convención.

---

## 4. Comunicación con API

### 4.1 Estado actual

El proyecto usa **Axios** con una instancia centralizada en `services/api.js`:

```js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});
```

La instancia incluye interceptores para:
- **Request**: Adjuntar el token de autenticación desde `localStorage`.
- **Response**: Redirigir a `/login` y limpiar el token en caso de 401.

### 4.2 Servicios por módulo

Cada módulo debe tener su propio archivo de servicio en `services/`:

```js
// services/userService.js
import api from './api';

export const userService = {
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data.data;
    },
    // ... más métodos
};
```

> **Regla**: Toda llamada al API debe pasar por la instancia centralizada de `api.js`. No usar `fetch()` ni crear instancias de Axios independientes.

### 4.3 Variables de entorno

Las URLs de API y otras configuraciones deben usar variables de entorno de Vite:

```
VITE_API_URL=http://localhost:8000/api
```

Acceso en código: `import.meta.env.VITE_API_URL`

> **Regla**: No hardcodear URLs, puertos ni hosts en el código fuente. Siempre usar `import.meta.env.VITE_*`.

---

## 5. Estilos

### 5.1 Sistema de UI: Material UI (MUI) v9

El sistema de componentes principal del proyecto es **MUI**. Todos los componentes de interfaz (tablas, diálogos, botones, formularios) deben usar componentes MUI con la prop `sx` para estilos inline.

Tailwind CSS v4 está disponible como herramienta complementaria para layouts rápidos, pero **MUI tiene prioridad** para componentes de UI.

### 5.2 Paleta de colores centralizada

Todos los colores personalizados están definidos en `frontend/src/theme/colors.js`:

```js
import { THEME_COLORS } from '@/theme/colors';
// o
import { THEME_COLORS } from '../../theme/colors';
```

> **Regla**: No definir constantes de color locales (`const THEME_COLORS = {...}`) dentro de componentes. Siempre importar desde `theme/colors.js`.

> **Regla**: Cuando se necesite un nuevo color, agregarlo al archivo centralizado `theme/colors.js` en lugar de hardcodearlo en el componente.

### 5.3 Responsive design

- Usar los breakpoints de MUI (`theme.breakpoints.down/up('md')`, etc.).
- El `DashboardLayout` ya implementa responsive con drawer temporal en mobile.

---

## 6. Estado global

### 6.1 Implementado

- **AuthContext** (`context/AuthContext.jsx`): Provider de autenticación con `user`, `loading`, `error`, `login()`, `logout()`, `isAuthenticated`, `hasRole()`.
- El estado de autenticación persiste vía token en `localStorage` y verificación con `/auth/me` al cargar.

### 6.2 Reglas

- Usar React Context para estado compartido entre componentes.
- No duplicar estado que ya existe en un Context (e.g., no guardar `user` en estado local si ya está en `AuthContext`).
- Estado local del componente para datos que no necesitan compartirse.

---

## 7. Navegación

### 7.1 Implementado

- **React Router DOM v7** con `BrowserRouter`.
- Ruta catch-all de Laravel (`web.php`) configurada para soportar client-side routing.
- `ProtectedRoute` como guard de autenticación y autorización por roles.
- `DashboardLayout` con sidebar de navegación dinámica basada en roles.

### 7.2 Estructura de rutas

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardHome />} />
        <Route element={<ProtectedRoute requiredRoles={[...]} />}>
          <Route path="/users" element={<UsersList />} />
          <Route path="/roles" element={<RolesList />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
</BrowserRouter>
```

> **Regla**: Las rutas deben reflejar la estructura de módulos del ERP y usar `ProtectedRoute` para control de acceso.

---

## 8. Formularios

### Recomendaciones

- Usar **controlled components** (estado de React para inputs).
- Validar en el cliente para UX (mensajes instantáneos).
- La validación definitiva siempre es en el servidor (Form Requests de Laravel).
- Mostrar errores del servidor mapeados a los campos correspondientes.

> **Pendiente**: ¿Se usará una librería de formularios (`react-hook-form`, `formik`) o formularios manuales?

---

## 9. Manejo de errores en UI

- Mostrar mensajes de error del API al usuario de forma clara.
- Diferenciar entre errores de validación (422) y errores del sistema (500).
- No mostrar detalles técnicos (stack traces) al usuario final.
- Log de errores en la consola del navegador para depuración.

---

## 10. Permisos en UI

### 10.1 Implementado

- `AuthContext` expone `hasRole(role)` para verificar roles del usuario.
- `ProtectedRoute` acepta `requiredRoles` para restringir rutas por rol.
- Elementos de UI se muestran/ocultan condicionalmente con `hasRole()`.

### 10.2 Reglas

- El backend es la autoridad en permisos. La UI los usa solo para mostrar/ocultar elementos.
- Nunca confiar únicamente en restricciones de UI para seguridad.
- `hasRole('superadmin')` siempre retorna `true` para cualquier verificación de rol (bypass explícito en AuthContext).

---

## 11. Accesibilidad (a11y)

Pautas mínimas:

- Usar elementos HTML semánticos (`<nav>`, `<main>`, `<section>`, `<button>`).
- Todos los inputs deben tener `<label>` asociado.
- Imágenes con `alt` descriptivo.
- Contraste suficiente para texto.
- Navegación con teclado funcional.

---

## 12. Alias de importación

Configurado y funcionando:

```jsx
// En lugar de:
import Component from '../../../components/Component';

// Usar:
import Component from '@/components/Component';
```

Definido en `vite.config.js` y `jsconfig.json`.

---

## 13. Reglas de limpieza y mantenimiento

### 13.1 Archivos muertos

- No mantener componentes de prueba, verificación o scaffolding que ya no se usen.
- Si un archivo deja de importarse desde cualquier otro, eliminarlo.

### 13.2 Build artifacts

- Los archivos generados en `public/build/` son output de Vite y no deben versionarse manualmente.
- Ejecutar `cd frontend && npx vite build` para regenerar un build limpio.
- No acumular versiones anteriores de assets compilados.

### 13.3 Dependencias

- Las dependencias JavaScript deben definirse **únicamente** en `frontend/package.json`.
- No crear un `package.json` en la raíz del proyecto para dependencias frontend.
- Auditar dependencias periódicamente con `npm audit`.

---

*Última actualización: Septiembre 2026*
