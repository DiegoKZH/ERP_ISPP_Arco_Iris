# Arquitectura del Sistema

> Este documento describe la arquitectura **real encontrada en el repositorio**. Las secciones marcadas como "Recomendado" o "Pendiente" no son decisiones confirmadas.

---

## 1. Estructura general

El proyecto utiliza una arquitectura **Monorepo Híbrido** con separación clara entre backend y frontend:

```
erp-instituto/                  ← Raíz del proyecto (basePath de Laravel)
├── artisan                     ← CLI de Laravel
├── composer.json               ← Dependencias PHP + autoload + scripts
├── vite.config.js              ← Configuración de Vite
├── phpunit.xml                 ← Configuración de PHPUnit
├── .editorconfig               ← Reglas de formato (4 espacios, UTF-8, LF)
├── .gitignore
├── .env / .env.example
│
├── public/                     ← Document root del servidor web
│   ├── index.php               ← Entry point HTTP
│   └── build/                  ← Assets compilados (generado por Vite)
│
├── backend/                    ← Código Laravel completo
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   └── tests/
│
├── frontend/                   ← Código React completo
│   ├── src/
│   ├── styles/
│   └── package.json
│
├── vendor/                     ← Dependencias PHP (gitignored)
├── node_modules/               ← Dependencias JS de raíz (gitignored)
│
└── docs/                       ← Documentación del proyecto
```

### Decisión clave: Bootstrap personalizado

El proyecto resuelve la separación monorepo mediante un **bootstrap personalizado** en `backend/bootstrap/app.php`. Laravel se inicializa con `basePath` apuntando a la raíz del proyecto (para que `vendor/`, `public/`, `.env` funcionen), pero luego redirige todos los paths internos a `backend/`:

```php
$app = Application::configure(basePath: dirname(__DIR__, 2))
    ->withRouting(...)
    ->create();

$app->useAppPath($backendPath.'/app');
$app->useConfigPath($backendPath.'/config');
$app->useDatabasePath($backendPath.'/database');
$app->useStoragePath($backendPath.'/storage');
// etc.
```

**Esto es deliberado y funcional.** No debe modificarse sin justificación.

---

## 2. Backend (Laravel 13)

### 2.1 Estructura actual

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Controller.php        ← Clase base abstracta (vacía)
│   ├── Models/
│   │   └── User.php                  ← Único modelo existente
│   └── Providers/
│       └── AppServiceProvider.php    ← Vacío (sin registros custom)
│
├── bootstrap/
│   ├── app.php                       ← Bootstrap personalizado (ver arriba)
│   └── providers.php                 ← Lista de providers [AppServiceProvider]
│
├── config/                           ← Configs estándar de Laravel (sin personalización)
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── database.php
│   ├── filesystems.php
│   ├── logging.php
│   ├── mail.php
│   ├── queue.php
│   ├── services.php
│   ├── session.php
│   └── view.php
│
├── database/
│   ├── database.sqlite               ← BD de desarrollo
│   ├── migrations/
│   │   ├── ..._create_users_table.php
│   │   ├── ..._create_cache_table.php
│   │   └── ..._create_jobs_table.php
│   ├── factories/
│   │   └── UserFactory.php
│   └── seeders/
│       └── DatabaseSeeder.php
│
├── resources/
│   └── views/
│       └── app.blade.php             ← Shell HTML para la SPA
│
├── routes/
│   ├── api.php                       ← Rutas de la API REST
│   ├── web.php                       ← Catch-all para SPA
│   └── console.php                   ← Comandos Artisan
│
├── storage/                          ← Logs, cache, uploads
│   ├── app/
│   ├── framework/
│   └── logs/
│
└── tests/
    ├── TestCase.php                  ← Clase base con createApplication()
    ├── Feature/ExampleTest.php
    └── Unit/ExampleTest.php
```

### 2.2 Capas y responsabilidades existentes

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| Rutas | `routes/api.php` | Definir endpoints de la API |
| Rutas web | `routes/web.php` | Servir la SPA (catch-all) |
| Controladores | `app/Http/Controllers/` | Recibir peticiones, orquestar respuestas |
| Modelos | `app/Models/` | Representar entidades, acceso a BD |
| Providers | `app/Providers/` | Registrar servicios en el contenedor |
| Config | `config/` | Configuración de la aplicación |
| Migraciones | `database/migrations/` | Definir esquema de BD |
| Seeders | `database/seeders/` | Datos iniciales / de prueba |
| Factories | `database/factories/` | Generación de datos para tests |
| Views | `resources/views/` | Templates Blade (solo shell SPA) |

### 2.3 Capas recomendadas (no existentes aún)

| Capa | Ubicación sugerida | Responsabilidad |
|------|---------------------|-----------------|
| Form Requests | `app/Http/Requests/` | Validación de datos de entrada |
| API Resources | `app/Http/Resources/` | Transformación de respuestas |
| Middleware | `app/Http/Middleware/` | Lógica transversal (auth, logging) |
| Services | `app/Services/` | Lógica de negocio compleja |
| Policies | `app/Policies/` | Autorización basada en modelos |

> **Nota**: Estas capas no existen porque el proyecto aún no tiene lógica de negocio. Se crearán cuando sean necesarias.

### 2.4 Flujo de una petición API

```
Cliente (React SPA)
    │
    ▼
GET/POST /api/...
    │
    ▼
public/index.php
    │
    ▼
backend/bootstrap/app.php (bootstrap)
    │
    ▼
Middleware Pipeline
    │
    ▼
routes/api.php (matching)
    │
    ▼
Controller (lógica)
    │
    ▼
Model (acceso a BD si aplica)
    │
    ▼
JSON Response
    │
    ▼
Cliente (React SPA)
```

### 2.5 Manejo de errores

Configurado en `bootstrap/app.php`:

```php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->shouldRenderJsonWhen(
        fn (Request $request) => $request->is('api/*'),
    );
})
```

Las peticiones a `api/*` reciben errores en formato JSON automáticamente.

### 2.6 Modelo User existente

El modelo `User` usa **PHP Attributes** (patrón moderno de Laravel 13):

```php
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

**Convención detectada**: Usar PHP Attributes (`#[Fillable]`, `#[Hidden]`) en lugar de propiedades `$fillable` y `$hidden`.

---

## 3. Frontend (React 19 + Vite 8)

### 3.1 Estructura actual

```
frontend/
├── .npmrc                     ← ignore-scripts=true, audit=true
├── jsconfig.json              ← Alias @ → src/, jsx: react-jsx
├── package.json               ← Dependencias y scripts
│
├── src/
│   ├── app.jsx                ← Entry point (createRoot, monta <Main/>)
│   └── Main.jsx               ← Componente de verificación de conexión
│
└── styles/
    └── app.css                ← Tailwind v4 (@import 'tailwindcss')
```

### 3.2 Entry point

El frontend se monta desde `app.jsx`:

```jsx
import '../styles/app.css';
import { createRoot } from 'react-dom/client';
import Main from './Main';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Main />);
}
```

Se monta en el `<div id="root">` del template Blade `app.blade.php`.

### 3.3 Integración con Laravel

El template `app.blade.php` integra React mediante las directivas de Vite:

```html
@viteReactRefresh
@vite(['frontend/src/app.jsx'])
<div id="root"></div>
```

### 3.4 Alias de importación

Configurado en dos lugares (coherente):

- `vite.config.js`: `'@': path.resolve(__dirname, 'frontend/src')`
- `jsconfig.json`: `"@/*": ["src/*"]`

Uso: `import Component from '@/components/MyComponent'`

### 3.5 Tailwind CSS v4

Usa la sintaxis moderna de Tailwind v4:

```css
@import 'tailwindcss';

@theme {
    --font-sans: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif, ...;
}
```

Con source scanning para Blade views y storage views.

### 3.6 Estructura recomendada (no existente aún)

```
frontend/src/
├── app.jsx              ← Entry point (existente)
├── App.jsx              ← Componente raíz con Router
├── components/          ← Componentes reutilizables
│   ├── ui/              ← Componentes de interfaz genéricos
│   └── forms/           ← Componentes de formulario
├── pages/               ← Páginas (una por ruta principal)
├── layouts/             ← Layouts compartidos (sidebar, navbar)
├── hooks/               ← Custom hooks
├── services/            ← Funciones de comunicación con API
├── utils/               ← Utilidades generales
├── context/             ← React Context providers
└── constants/           ← Constantes y configuración
```

> **Nota**: Esta estructura se creará según sea necesario. No crear carpetas vacías anticipadamente.

---

## 4. Comunicación Backend ↔ Frontend

### 4.1 Flujo actual

```
React SPA (frontend)
    │
    │  fetch('/api/...')
    ▼
Laravel API (backend)
    │
    │  JSON response
    ▼
React SPA (actualiza estado)
```

### 4.2 Mecanismo existente

El componente `Main.jsx` demuestra el patrón básico de comunicación:

```jsx
fetch('/api/status')
    .then(res => res.json())
    .then(data => setStatus(data.message))
    .catch(error => console.error(error));
```

**Patrón detectado**: Uso de `fetch` nativo. No hay librería HTTP (como axios) instalada.

### 4.3 Ruta catch-all para SPA

```php
// web.php
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
```

Todas las rutas que no sean `/api/*` sirven la SPA. React Router (cuando se instale) manejará la navegación del lado del cliente.

---

## 5. Base de datos

### 5.1 Estado actual

- **Motor Principal / Producción**: PostgreSQL (`pgsql`)
- **Motor para Tests Automatizados**: SQLite en memoria (`:memory:`)
- **Tablas existentes**:
  - Infraestructura Laravel: `sessions`, `password_reset_tokens`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`
  - Núcleo de Identidad y RBAC: `users`, `roles`, `permissions`, `role_user`, `permission_role`, `permission_user`, `personal_access_tokens`

### 5.2 Configuración

```php
// database.php
'default' => env('DB_CONNECTION', 'pgsql'),
```

Variables en `.env` y `.env.example`: `DB_CONNECTION=pgsql`, `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `DB_DATABASE=erp_instituto`.

---

## 6. Autenticación y autorización

### 6.1 Estado actual

- **Laravel Sanctum 4.0** implementado para autenticación API (tokens) y sesiones web.
- **Núcleo de Identidad**: Modelo `User` con atributos PHP, `SoftDeletes`, `HasRolesAndPermissions`, `is_active`, `username`, `last_login_at`.
- **Sistema RBAC**: Modelos `Role` y `Permission` nativos con soporte para roles del sistema (`superadmin` bypass), permisos granulares y revocaciones directas por usuario.
- **Middlewares de autorización**: `permission` (`CheckPermission`) y `role` (`CheckRole`).
- **Endpoints Auth**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.

### 6.2 Decisiones completadas

- Motor de BD: PostgreSQL confirmado.
- Sistema de autorización: RBAC nativo desacoplado implementado.
- Estrategia de autenticación: Híbrida (Tokens Sanctum + SPA Session).

---

## 7. Testing

### 7.1 Configuración actual

- **Framework**: PHPUnit 12
- **BD para tests**: SQLite en memoria (`:memory:`)
- **Suites**: `Unit` y `Feature`
- **Tests existentes**: Solo `ExampleTest` en ambas suites (scaffold)

### 7.2 Ejecución

```bash
composer test
# equivale a: php artisan config:clear && php artisan test
```

---

## 8. Scripts de desarrollo

### 8.1 Composer scripts

| Script | Descripción |
|--------|-------------|
| `composer run setup` | Instalación completa (PHP + .env + key + migrate + npm + build) |
| `composer run dev` | Levanta servidor Laravel + queue + Vite en paralelo |
| `composer test` | Ejecuta suite de pruebas PHPUnit |

### 8.2 NPM scripts (frontend/)

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia Vite en modo desarrollo |
| `npm run build` | Compila assets para producción |

---

## 9. Convenciones detectadas

### 9.1 Código

| Convención | Detalle |
|------------|---------|
| **Indentación** | 4 espacios (`.editorconfig`) |
| **Encoding** | UTF-8 |
| **Line endings** | LF |
| **PHP Attributes** | Uso de `#[Fillable]`, `#[Hidden]` en modelos |
| **Autoload** | PSR-4: `App\\` → `backend/app/` |
| **Alias frontend** | `@` → `frontend/src/` |

### 9.2 Archivos

| Tipo | Convención de nombre |
|------|---------------------|
| Modelos | PascalCase singular (`User.php`) |
| Controladores | PascalCase + `Controller` (`UserController.php`) |
| Migraciones | Timestamp + snake_case (`create_users_table.php`) |
| Componentes React | PascalCase (`Main.jsx`) |
| Entry points | camelCase (`app.jsx`) |
| CSS | camelCase (`app.css`) |

---

## 10. Auditoría arquitectónica

### ✅ Correcto / consolidado

- Separación limpia `backend/` y `frontend/`.
- Bootstrap personalizado bien diseñado.
- Vite config coherente con alias `@`.
- PHPUnit correctamente configurado para monorepo.
- Uso de PHP Attributes modernos.
- Catch-all SPA con API separada.
- `.editorconfig` coherente.
- Scripts de setup y dev bien organizados.
- `.npmrc` con `ignore-scripts=true` y `audit=true` (seguridad).
- Errores API en JSON automáticamente.

### ⚠️ Mejorable

| Aspecto | Estado actual | Mejora sugerida | Justificación |
|---------|--------------|-----------------|---------------|
| Locale | `'en'` en `app.php` | Considerar `'es'` | Institución hispanohablante |
| APP_NAME | `'Laravel'` en `.env.example` | `'ERP Instituto'` | Identificación correcta |
| Timezone | `'UTC'` | Considerar `'America/Lima'` | Reportes con hora local |
| Faker locale | `'en_US'` | Considerar `'es_PE'` | Datos de prueba en español |

### 🔴 Riesgo

| Riesgo | Descripción | Impacto |
|--------|-------------|---------|
| SQLite en producción | No es adecuado para un ERP multi-usuario | Alto — Definir motor antes de implementar módulos |
| Sin roles/permisos | Un ERP de 14 módulos requiere control de acceso | Alto — Definir tempranamente |

### 📋 Pendiente

- Motor de BD para producción.
- Estrategia de autenticación SPA (cookies vs tokens).
- Sistema de roles y permisos.
- Estructura de carpetas para módulos del backend (¿por dominio o por tipo?).
- Librería HTTP para el frontend (¿fetch nativo, axios, u otra?).
- Router para el frontend (¿react-router-dom?).
- Gestión de estado global (¿Context, Zustand, u otra?).
- Estrategia de despliegue.
- Configuración CORS.

---

*Última actualización: Septiembre 2026*
