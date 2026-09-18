# Reglas del Frontend

> Este documento describe las convenciones del frontend del proyecto. Se basa en la **estructura real encontrada** y establece pautas para desarrollo futuro.

---

## 1. Estado actual del frontend

### Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.x | Biblioteca de UI |
| Vite | 8.x | Bundler y servidor de desarrollo |
| Tailwind CSS | 4.x | Framework de estilos |
| `@vitejs/plugin-react` | 6.x | Soporte React para Vite |
| `laravel-vite-plugin` | 3.x | Integración con Laravel |

### Estructura existente

```
frontend/
├── .npmrc                  ← ignore-scripts=true, audit=true
├── jsconfig.json           ← Alias @ → src/, jsx: react-jsx
├── package.json            ← Dependencias y scripts
├── src/
│   ├── app.jsx             ← Entry point (createRoot)
│   └── Main.jsx            ← Componente de verificación
└── styles/
    └── app.css             ← Tailwind v4
```

### Componentes existentes

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `app.jsx` | Entry point | Importa CSS, monta `<Main/>` en `#root` |
| `Main.jsx` | Componente | Verificación de conexión con API |

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

El proyecto usa `fetch` nativo:

```jsx
fetch('/api/status')
    .then(res => res.json())
    .then(data => { /* usar data */ })
    .catch(error => { /* manejar error */ });
```

### 4.2 Recomendación para servicios API

Crear un servicio base en `services/api.js`:

```js
const API_BASE = '/api';

export async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        // Manejo de errores centralizado
    }

    return response.json();
}
```

> **Pendiente de definición**: ¿Se usará `fetch` nativo, `axios`, u otra librería? La decisión debe tomarse antes de implementar el primer módulo con formularios.

---

## 5. Estilos

### 5.1 Framework: Tailwind CSS v4

El proyecto usa Tailwind CSS v4 con la sintaxis moderna:

```css
@import 'tailwindcss';

@theme {
    --font-sans: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif, ...;
}
```

### 5.2 Convenciones de estilos

- Usar **clases de Tailwind** directamente en JSX (patrón existente en `Main.jsx`).
- Estilos globales en `frontend/styles/app.css`.
- Personalización de tema en la directiva `@theme` de Tailwind v4.
- Evitar CSS custom a menos que Tailwind no pueda resolver el caso.

### 5.3 Responsive design

Usar los breakpoints de Tailwind (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`). Mobile-first por defecto.

---

## 6. Estado global

### Pendiente de definición

No hay gestión de estado global implementada. Opciones a evaluar:

1. **React Context + useReducer**: Para estado simple (auth, tema, notificaciones).
2. **Zustand / Jotai**: Para estado más complejo si es necesario.
3. **React Query / SWR**: Para estado del servidor (cache de API).

> **Recomendación**: Comenzar con React Context para autenticación. Evaluar necesidades adicionales según surjan.

---

## 7. Navegación

### Pendiente de definición

No hay router instalado. Cuando se implemente:

- **Librería recomendada**: `react-router-dom` (estándar de facto).
- Las rutas deben reflejar la estructura de módulos del ERP.
- La ruta catch-all de Laravel (`web.php`) ya está preparada para soportar client-side routing.

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

### Pendiente de definición

Cuando se implemente el sistema de roles/permisos:

- El backend es la autoridad en permisos. La UI los usa solo para mostrar/ocultar elementos.
- Nunca confiar únicamente en restricciones de UI para seguridad.
- Obtener permisos del usuario autenticado y almacenarlos en el estado global.

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

*Última actualización: Septiembre 2026*
