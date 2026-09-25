# PLAN — Implementación del Flujo Integral de Inscripción de Admisión con Tesorería y FUT

| Metadato | Detalle |
|----------|---------|
| **SPEC Asociada** | `docs/specs/flujo-inscripcion-admision-fut.md` |
| **Fecha** | 2026-09-24 |
| **Objetivo** | Implementar de extremo a extremo (BD, Backend, Frontend, Tests) el flujo oficial de admisión en 6 fases. |

---

## 1. Arquitectura y Componentes a Modificar

```
[ Frontend: React 19 SPA ]
   ├── AdmissionDashboard.jsx (Selector de procesos, métricas reales, padrón dinámico con acciones de FUT y DJ)
   ├── ModalInscripcionFlujo.jsx (Asistente paso a paso: Datos → Tesorería → Pago/FUT → Colegio/Requisitos → Documentos PDF)
   ├── VisorFutModal.jsx (Formato oficial imprimible A4 de FUT con casillas en blanco para lapicero)
   ├── VisorDeclaracionJuradaModal.jsx (Formato oficial imprimible A4 de Declaración Jurada con recuadro para huella y firma)
   └── admissionService.js (Métodos para pre-inscripción, validación de pago, expediente y documentos)
           │
           ▼
[ Backend: Laravel 13 API ]
   ├── Migración: add_flujo_inscripcion_to_admision_postulaciones
   ├── Modelo: AdmisionPostulacion (fillable, casts, relaciones)
   ├── Request: PreInscribirPostulacionRequest, ValidarPagoPostulacionRequest, CompletarExpedienteRequest
   ├── Resource: AdmisionPostulacionResource (nuevos campos de tesorería, FUT, colegio y checklist)
   ├── Controller: AdmisionPostulacionController (métodos de flujo y generación de datos oficiales)
   ├── DocumentController / Blade Views: Formato imprimible oficial de FUT y Declaración Jurada
   └── Rutas: api.php
           │
           ▼
[ Base de Datos: PostgreSQL (Desarrollo) / SQLite (Pruebas) ]
   └── Actualización de `admision_postulaciones` con las 17 columnas reglamentarias.
```

---

## 2. Estrategia de Implementación por Fases

### Fase 1: Base de Datos y Modelo Eloquent
- Crear migración `2026_09_24_000001_add_flujo_inscripcion_to_admision_postulaciones.php`.
- Ejecutar migración en PostgreSQL y SQLite en memoria para tests.
- Actualizar `$fillable` y `$casts` en el modelo `AdmisionPostulacion`.

### Fase 2: Lógica Backend, Validación y Controladores
- Crear `PreInscribirPostulacionRequest` con validaciones de persona y programa ofertado.
- Crear `ValidarPagoPostulacionRequest` con comprobante de pago.
- Crear `CompletarExpedienteRequest` con datos de I.E. secundaria, código modular, foto y checklist.
- Implementar los métodos en `AdmisionPostulacionController`:
  - `preInscribir()`: Registra persona, crea postulación con `codigo_tesoreria = DNI`, estado `PENDIENTE_PAGO`.
  - `validarPago()`: Valida pago, genera correlativo `numero_fut = FUT-{YYYY}-{correlativo}`.
  - `completarExpediente()`: Guarda colegio modular, checklist de requisitos, estado `INSCRITO`.
  - `futDocumento()`: Retorna estructura para el FUT.
  - `declaracionJurada()`: Retorna estructura para la Declaración Jurada.
  - `imprimirFut()` e `imprimirDeclaracion()`: Vistas Blade institucionales listas para imprimir en A4.

### Fase 3: Servicios y Vistas Frontend
- Actualizar `admissionService.js` con las nuevas rutas y acciones.
- Crear asistente por pasos interactivo e intuitivo en el Dashboard de Admisión.
- Crear componentes de visualización e impresión para el Formato Único de Trámite (FUT) y la Declaración Jurada con estilos de impresión `@media print` en hoja A4.
- Actualizar el padrón de postulantes para mostrar datos verídicos con badges de estado de pago, número de FUT, código modular y botones para imprimir documentos.

### Fase 4: Pruebas Automatizadas y Verificación
- Crear Feature Test `backend/tests/Feature/AdmisionFlujoInscripcionTest.php` probando las 6 fases del flujo:
  1. Pre-inscripción y generación de código de tesorería (DNI).
  2. Validación de pago y asignación de número de FUT.
  3. Completado de datos de institución educativa (código modular) y requisitos documentarios.
  4. Generación de documentos oficiales FUT y Declaración Jurada.
- Ejecutar suite de pruebas con `composer test`.
- Compilar frontend con `npx vite build` para verificar cero errores de empaquetado.

### Fase 5: Documentación y Cierre
- Actualizar especificaciones, tareas y manuales del sistema.

