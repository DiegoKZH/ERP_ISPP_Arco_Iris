# AGENTS.md — Guía para Agentes de IA

> **Este archivo es el punto de entrada obligatorio para cualquier agente de IA que trabaje en este proyecto.**
> Léelo completamente antes de realizar cualquier modificación.

---

## 1. ¿Qué es este proyecto?

**ERP Instituto** es un sistema de gestión integral para una institución de educación superior pedagógica. Está compuesto por 14 módulos funcionales que abarcan áreas académicas, administrativas y financieras.

- **Backend**: Laravel 13 (API REST)
- **Frontend**: React 19 + Vite 8 (SPA)
- **Estilos**: Tailwind CSS v4
- **Base de datos**: SQLite (desarrollo), relacional (producción — pendiente de definir)
- **Autenticación**: Laravel Sanctum
- **Arquitectura**: Monorepo híbrido con separación `backend/` y `frontend/`

---

## 2. Estructura del repositorio

```
erp-instituto/
├── artisan                  ← CLI de Laravel
├── composer.json            ← Dependencias PHP + scripts
├── vite.config.js           ← Configuración Vite (alias @ → frontend/src)
├── phpunit.xml              ← Configuración de tests
├── public/                  ← Document root (index.php)
│
├── backend/                 ← Todo el código Laravel
│   ├── app/                 ← Modelos, Controllers, Providers, Services...
│   ├── bootstrap/app.php    ← Bootstrap personalizado (redirige paths)
│   ├── config/              ← Configuración de Laravel
│   ├── database/            ← Migraciones, seeders, factories
│   ├── resources/views/     ← Blade templates (solo app.blade.php para SPA)
│   ├── routes/              ← api.php, web.php, console.php
│   ├── storage/             ← Logs, cache, uploads
│   └── tests/               ← PHPUnit (Feature/, Unit/)
│
├── frontend/                ← Todo el código React
│   ├── src/                 ← Componentes, páginas, hooks, servicios
│   ├── styles/              ← CSS (Tailwind)
│   └── package.json         ← Dependencias JS
│
└── docs/                    ← Documentación del proyecto
    ├── 00-constitution.md
    ├── 01-project-context.md
    ├── 02-architecture.md
    ├── ...
    ├── modules/             ← Documentación por módulo funcional
    ├── specs/               ← Especificaciones por funcionalidad
    └── templates/           ← Plantillas SPEC, PLAN, TASKS
```

---

## 3. Documentación que debes leer

Antes de trabajar en cualquier parte del proyecto, lee los documentos relevantes en este orden:

| Prioridad | Documento | Cuándo leerlo |
|-----------|-----------|---------------|
| **Siempre** | `AGENTS.md` (este archivo) | Antes de cualquier tarea |
| **Siempre** | `docs/00-constitution.md` | Principios no negociables |
| **Siempre** | `docs/02-architecture.md` | Antes de escribir código |
| Según tarea | `docs/04-api-rules.md` | Si trabajas en endpoints |
| Según tarea | `docs/05-frontend-rules.md` | Si trabajas en UI |
| Según tarea | `docs/06-security.md` | Si tocas auth/permisos |
| Según tarea | `docs/07-testing.md` | Antes de crear/modificar tests |
| Según tarea | `docs/modules/<módulo>.md` | Si trabajas en un módulo específico |
| Según tarea | `docs/specs/<funcionalidad>.md` | Si existe una spec para la funcionalidad |

---

## 4. Reglas fundamentales

### 4.1 Antes de crear algo nuevo

> **Antes de introducir una nueva estructura, patrón, abstracción o dependencia, revisa cómo se resuelve actualmente ese problema en el proyecto.**

- ¿Ya existe un componente, servicio o utilidad que haga algo similar?
- ¿Existe una convención establecida para este tipo de archivo?
- ¿Es realmente necesaria una nueva abstracción, o basta con una solución simple?

### 4.2 No inventar reglas de negocio

No inventes:
- Reglas institucionales, procesos administrativos o políticas.
- Fórmulas de cálculo, estados, permisos o validaciones no especificados.
- Relaciones entre entidades que no estén documentadas o en el código.

Si algo no está definido, márcalo como **"Pendiente de definición"**.

### 4.3 Respetar la arquitectura existente

- El backend va en `backend/`.
- El frontend va en `frontend/`.
- Las rutas API van en `backend/routes/api.php`.
- La ruta web catch-all en `backend/routes/web.php` **no debe modificarse** sin justificación.
- Los modelos van en `backend/app/Models/`.
- Los controladores van en `backend/app/Http/Controllers/`.

### 4.4 Dónde colocar código nuevo

| Tipo de archivo | Ubicación |
|-----------------|-----------|
| Modelo Eloquent | `backend/app/Models/` |
| Controlador API | `backend/app/Http/Controllers/` |
| Form Request | `backend/app/Http/Requests/` |
| API Resource | `backend/app/Http/Resources/` |
| Middleware | `backend/app/Http/Middleware/` |
| Servicio / lógica de negocio | `backend/app/Services/` |
| Migración | `backend/database/migrations/` |
| Seeder | `backend/database/seeders/` |
| Factory | `backend/database/factories/` |
| Ruta API | `backend/routes/api.php` |
| Test Feature | `backend/tests/Feature/` |
| Test Unit | `backend/tests/Unit/` |
| Componente React | `frontend/src/components/` |
| Página React | `frontend/src/pages/` |
| Hook | `frontend/src/hooks/` |
| Servicio API (frontend) | `frontend/src/services/` |
| Utilidad JS | `frontend/src/utils/` |
| Layout | `frontend/src/layouts/` |
| Estilos globales | `frontend/styles/` |

### 4.5 Metodología SDD

Para funcionalidades complejas:

1. **Especificar** antes de implementar (`docs/specs/`).
2. **Planificar** antes de codificar (`<spec>.plan.md`).
3. **Dividir en tareas** concretas (`<spec>.tasks.md`).
4. **Implementar** respetando la arquitectura existente.
5. **Probar** con tests automatizados.
6. **Verificar** el resultado.
7. **Documentar** los cambios.

Ver `docs/08-sdd-workflow.md` para el flujo completo.

---

## 5. Cómo ejecutar el proyecto

```bash
# Instalación completa
composer run setup

# Desarrollo (levanta Laravel + Queue + Vite)
composer run dev
# o: npm run dev (desde la raíz)

# Tests
composer test
```

---

## 6. Cómo verificar cambios

Después de cualquier modificación:

1. **Ejecutar tests**: `composer test`
2. **Verificar que la API responda**: `GET /api/status`
3. **Verificar que la SPA cargue**: Navegar a `http://localhost:8000`
4. **Si creaste migraciones**: `php artisan migrate:fresh --seed` en entorno de desarrollo

---

## 7. Cuándo crear una especificación

Crea una especificación en `docs/specs/` cuando:

- La funcionalidad afecte a más de un módulo.
- Involucre lógica de negocio no trivial.
- Requiera nuevas migraciones de base de datos.
- Implique cambios en autenticación o autorización.
- El alcance no esté claramente definido.

No necesitas una especificación para:

- Correcciones de bugs simples.
- Ajustes de estilo.
- Refactorizaciones menores dentro de un archivo.

---

## 8. Cuándo pedir aclaraciones

Pide aclaraciones cuando:

- Una regla de negocio no esté documentada.
- Exista contradicción entre la especificación y el código existente.
- El cambio solicitado pueda afectar la seguridad o integridad de datos.
- No esté claro si un cambio debe ser retrocompatible.
- La tarea implique eliminar código que podría estar en uso.

---

## 9. Jerarquía de autoridad

Cuando exista conflicto, resuelve según esta prioridad:

1. Instrucciones explícitas del usuario.
2. Especificaciones aprobadas del proyecto (`docs/specs/`).
3. Reglas del proyecto (`docs/00-constitution.md`, este archivo).
4. Arquitectura y convenciones existentes consolidadas.
5. Código existente.
6. Propuestas del agente.
7. Inferencias.

**Nunca resuelvas silenciosamente un conflicto importante.** Documéntalo.
