# ERP Instituto — Sistema de Gestión Integral

Sistema de gestión integral para una institución de educación superior pedagógica. Estructurado como una arquitectura **Monorepo Híbrido**:

- **Backend**: API REST con Laravel 13 (`/backend`)
- **Frontend**: Single Page Application (SPA) con React 19, Vite 8 y Tailwind CSS v4 (`/frontend`)
- **Metodología**: Spec-Driven Development (SDD)

---

## 📋 Módulos del sistema

| # | Módulo | Área |
|---|--------|------|
| 1 | Académico | Académica |
| 2 | Recursos Humanos | Administrativa |
| 3 | Contabilidad | Financiera |
| 4 | Planificación y Presupuesto | Financiera |
| 5 | Cuentas por Cobrar | Financiera |
| 6 | Plataforma Virtual | Académica |
| 7 | Cuentas por Pagar | Financiera |
| 8 | Admisión | Académica |
| 9 | FUT Electrónico | Administrativa |
| 10 | Logística | Administrativa |
| 11 | Almacén | Administrativa |
| 12 | Bienestar | Académica/Administrativa |
| 13 | Patrimonio | Administrativa |
| 14 | Evaluación Docente | Académica |

---

## 🏗️ Estructura del proyecto

```
erp-instituto/
├── backend/            ← API REST (Laravel 13)
│   ├── app/            ← Modelos, Controllers, Services
│   ├── config/         ← Configuración Laravel
│   ├── database/       ← Migraciones, seeders, factories
│   ├── routes/         ← Rutas API y web
│   ├── storage/        ← Logs, cache, uploads
│   └── tests/          ← PHPUnit (Feature, Unit)
│
├── frontend/           ← SPA (React 19 + Vite 8)
│   ├── src/            ← Componentes, páginas, hooks
│   └── styles/         ← Tailwind CSS v4
│
├── docs/               ← Documentación del proyecto
│   ├── modules/        ← Documentación por módulo
│   ├── specs/          ← Especificaciones por funcionalidad
│   └── templates/      ← Plantillas SPEC, PLAN, TASKS
│
├── public/             ← Document root
├── AGENTS.md           ← Guía para agentes de IA
└── README.md           ← Este archivo
```

---

## 🚀 Requisitos previos

- **PHP**: ^8.3
- **Composer**: ^2.x
- **Node.js**: ^20.x o superior
- **npm**: ^10.x

---

## 🛠️ Instalación y Configuración Inicial

1. Clonar el repositorio.
2. Instalar dependencias del proyecto:
   ```bash
   composer run setup
   ```
   *Este comando instalará las dependencias PHP, creará el archivo `.env` si no existe, generará la clave de la aplicación, ejecutará las migraciones e instalará/compilará los assets del frontend.*

---

## 💻 Desarrollo Local

Para iniciar todos los servidores en simultáneo (Laravel API y Vite Frontend):

```bash
npm run dev
# o usando composer:
composer run dev
```

Esto levanta:
- **Laravel** en `http://localhost:8000`
- **Vite** con HMR para el frontend
- **Queue listener** para jobs en segundo plano

---

## 🧪 Pruebas

Para ejecutar el suite de pruebas:

```bash
composer test
```

Tests configurados con PHPUnit 12 usando SQLite en memoria.

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [📘 Guía Rápida de Desarrollo](docs/GUIA-DESARROLLO-RAPIDO.md) | **¡Empieza aquí!** Manual didáctico en 10 min para nuevos desarrolladores |
| [AGENTS.md](AGENTS.md) | Punto de entrada para agentes de IA |
| [Constitución](docs/00-constitution.md) | Principios fundamentales del proyecto |
| [Contexto](docs/01-project-context.md) | Propósito, alcance y tecnologías |
| [Arquitectura](docs/02-architecture.md) | Arquitectura real del sistema |
| [Auditoría de BD](docs/09-database-audit-actual.md) | Estructura detallada de la base de datos |
| [Modelo de dominio](docs/03-domain-model.md) | Entidades y relaciones conceptuales |
| [Reglas API](docs/04-api-rules.md) | Convenciones del API REST |
| [Reglas Frontend](docs/05-frontend-rules.md) | Convenciones del frontend React |
| [Seguridad](docs/06-security.md) | Autenticación, autorización, protección |
| [Testing](docs/07-testing.md) | Estrategia de pruebas |
| [Flujo SDD](docs/08-sdd-workflow.md) | Metodología Spec-Driven Development |
| [Protocolo IA](docs/AI-DEVELOPMENT-PROTOCOL.md) | Protocolo para agentes de IA |
| [Módulos](docs/modules/README.md) | Documentación funcional por módulo |

---

## 🔄 Metodología: Spec-Driven Development (SDD)

Las funcionalidades complejas siguen este flujo:

```
Necesidad → Especificación → Revisión → Plan → Tareas → Implementación → Testing → Verificación
```

Ver [docs/08-sdd-workflow.md](docs/08-sdd-workflow.md) para detalles.

---

## 📏 Reglas básicas de desarrollo

1. **Especificar** antes de implementar funcionalidades complejas.
2. **Respetar** la arquitectura existente (ver `docs/02-architecture.md`).
3. **No inventar** reglas de negocio no definidas por la institución.
4. **Probar** todo cambio con tests automatizados (`composer test`).
5. **Documentar** las decisiones técnicas y funcionales.
6. **Buscar primero** si ya existe una solución antes de crear algo nuevo.
