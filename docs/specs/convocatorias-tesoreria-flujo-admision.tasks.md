# TASKS — Tareas de Implementación: Convocatorias, Tesorería y Flujo de Admisión

| Metadato | Detalle |
|----------|---------|
| **Plan Asociado** | `docs/specs/convocatorias-tesoreria-flujo-admision.plan.md` |
| **Fecha** | 2026-10-01 |
| **Estado General** | En Progreso |

---

## Lista de Tareas

- [x] **Tarea 1: Backend — Control y Creación de Convocatorias**
  - [x] Crear `StoreAdmisionProcesoRequest` con validaciones de fechas, código y vacantes para los 2 programas autorizados.
  - [x] Implementar `store()` en `AdmisionProcesoController` asignando exclusivamente los programas `EI-01` (Educación Inicial) y `EF-01` (Educación Física).
  - [x] Implementar `toggleEstado()` en `AdmisionProcesoController` para alternar entre `CONVOCATORIA_ABIERTA` y `CONVOCATORIA_CERRADA`.
  - [x] Registrar rutas en `backend/routes/api.php`.

- [x] **Tarea 2: Backend — Validación de Estado de Convocatoria y Flujo de Datos**
  - [x] En `AdmisionPostulacionController::preInscribir()`:
    - Validar que la convocatoria esté abierta (`CONVOCATORIA_ABIERTA`). Si está cerrada, responder 422.
    - Validar que solo se requiera DNI, Nombres y Apellidos en `PreInscribirPostulacionRequest`.
  - [x] En `AdmisionPostulacionController::completarExpediente()`:
    - Exigir que `numero_fut` no sea nulo y `estado_pago == 'PAGADO'`.
    - Actualizar `Persona` con los datos complementarios (fecha nacimiento, sexo, celular, email, dirección).
    - Actualizar `CompletarExpedienteRequest` con las reglas de validación para estos campos.

- [x] **Tarea 3: Backend — Módulo de Tesorería**
  - [x] Crear `TesoreriaPagoController` con métodos `index`, `consultarDni` y `registrarPago`.
  - [x] Registrar permisos de tesorería en `PermissionSeeder` y asignarlos al rol admin/superadmin.
  - [x] Registrar rutas de tesorería en `backend/routes/api.php`.

- [x] **Tarea 4: Frontend — Módulo de Tesorería**
  - [x] Crear servicio `frontend/src/services/treasuryService.js`.
  - [x] Crear componente `frontend/src/pages/treasury/TreasuryDashboard.jsx` con panel de cobros, búsqueda por DNI y modal de confirmación con código FUT emitido.
  - [x] Configurar ruta `/treasury` en `frontend/src/App.jsx`.
  - [x] Añadir ítem "Módulo de Tesorería" en el sidebar en `frontend/src/layouts/DashboardLayout.jsx`.

- [x] **Tarea 5: Frontend — Control de Convocatorias y Flujo Reformulado**
  - [x] Actualizar `admissionService.js` con métodos para crear convocatoria, alternar estado y listar programas.
  - [x] Crear `ModalCrearConvocatoria.jsx` en `frontend/src/pages/admission/`.
  - [x] Actualizar `AdmissionDashboard.jsx`:
    - Mostrar badge y botón para abrir/cerrar convocatoria.
    - Botón para abrir modal de creación de convocatoria.
    - Banner informativo y bloqueo de inscripciones si la convocatoria está cerrada.
  - [x] Reformular `ModalInscripcionFlujo.jsx`:
    - Eliminar "inscripción Ofial" y afines por terminología profesional reglamentaria.
    - Paso 1: Únicamente DNI, Nombres y Apellidos + Selección de carrera autorizada (Ed. Inicial / Ed. Física).
    - Paso 2: Código de Tesorería (DNI).
    - Paso 3: Retorno de Tesorería & Emisión de FUT.
    - Paso 4: Solo con FUT habilitado, completar ficha de datos personales completos, procedencia escolar y requisitos documentarios.
    - Paso 5: Formatos Oficiales (FUT y Declaración Jurada).

- [x] **Tarea 6: Pruebas Automatizadas y Verificación**
  - [x] Crear prueba `ConvocatoriasYTesoreriaTest.php` y ejecutar suite completa.
  - [x] Ejecutar `php artisan test` (42/42 tests pasando con 175 aserciones).
  - [x] Compilar frontend con `npm run build` sin errores de empaquetado.

- [x] **Tarea 7: Rediseño de Menú Lateral, Pantalla Dedicada de Inscripción y Reanudación por DNI**
  - [x] Rediseño de `DashboardLayout.jsx` con fondo azul oscuro (`#0f172a`), barra superior a juego y menú lateral colapsable con acordeones para `Usuarios y Roles` y `Admisión`.
  - [x] Creación de `InscripcionPostulantePage.jsx` como pantalla completa dedicada (`/admission/inscribir`) con Stepper de 6 pasos (Datos, Foto, Especialidad, Colegio, Documentos, Pago) exacto al diseño requerido.
  - [x] Eliminación del selector obligatorio de programa pedagógico en el Paso 1, permitiendo inscripción general y selección de especialidad en el Paso 3.
  - [x] Solución al percance de reanudación: endpoint `GET /api/admision/postulaciones/consultar-dni/{dni}` y botón RENIEC para precargar y continuar sin error de clave única.
  - [x] Botón "Continuar Inscripción" en la tabla del Padrón de Postulantes para postulaciones en curso (`PENDIENTE_PAGO` o `PAGO_VALIDADO`).
  - [x] Suite de pruebas expandida: 45/45 tests unitarios y de integración pasando (`ConvocatoriasYTesoreriaTest` con 9 tests y 52 aserciones).
  - [x] Compilación de producción Vite (`npx vite build`) exitosa (0 errores).
