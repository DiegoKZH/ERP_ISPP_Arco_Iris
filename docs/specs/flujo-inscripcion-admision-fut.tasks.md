# TASKS — Tareas de Implementación del Flujo de Admisión con Tesorería y FUT

| Metadato | Detalle |
|----------|---------|
| **Plan Asociado** | `docs/specs/flujo-inscripcion-admision-fut.plan.md` |
| **Fecha** | 2026-09-24 |
| **Estado General** | En Progreso |

---

## Lista de Tareas

- [x] **Tarea 1: Base de Datos**
  - [x] Crear migración `2026_09_24_000001_add_flujo_inscripcion_to_admision_postulaciones.php`.
  - [x] Aplicar migración en PostgreSQL (`php artisan migrate`).
  - [x] Actualizar modelo `AdmisionPostulacion` con nuevos campos en `$fillable` y `$casts`.

- [x] **Tarea 2: Backend Requests y Controlador**
  - [x] Crear Form Requests: `PreInscribirPostulacionRequest`, `ValidarPagoPostulacionRequest`, `CompletarExpedienteRequest`.
  - [x] Actualizar `AdmisionPostulacionResource` para incluir todos los campos del nuevo flujo.
  - [x] Implementar métodos en `AdmisionPostulacionController`: `preInscribir`, `validarPago`, `completarExpediente`, `futDocumento`, `declaracionJurada`.
  - [x] Crear vistas Blade para impresión oficial en A4: `fut.blade.php` y `declaracion_jurada.blade.php`.
  - [x] Registrar las nuevas rutas en `backend/routes/api.php` y `backend/routes/web.php`.

- [x] **Tarea 3: Frontend Services y Asistente Guiado**
  - [x] Actualizar `frontend/src/services/admissionService.js`.
  - [x] Crear componente de asistente paso a paso (Modal Wizard) en `AdmissionDashboard.jsx` para guiar al usuario por los 6 pasos.
  - [x] Crear componentes de impresión oficial para FUT y Declaración Jurada con estilos `@media print` A4.
  - [x] Enriquecer el Padrón de Postulantes con columnas verídicas de base de datos (FUT, Estado Pago, Colegio/Modular, Acciones de reimpresión de documentos oficiales).

- [x] **Tarea 4: Pruebas Automatizadas**
  - [x] Crear `backend/tests/Feature/AdmisionFlujoInscripcionTest.php`.
  - [x] Validar cobertura de las 6 fases y ejecución de `composer test` (36/36 tests pasando).
  - [x] Validar compilación frontend con `npm run build` en `frontend/`.

- [x] **Tarea 5: Verificación y Documentación**
  - [x] Verificar con datos reales en el navegador.
  - [x] Actualizar auditoría de base de datos en `docs/09-database-audit-actual.md`.
