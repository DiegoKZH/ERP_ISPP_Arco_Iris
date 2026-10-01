# PLAN — Implementación de Convocatorias, Módulo de Tesorería y Reformulación del Flujo de Admisión

| Metadato | Detalle |
|----------|---------|
| **SPEC Asociada** | `docs/specs/convocatorias-tesoreria-flujo-admision.md` |
| **Fecha** | 2026-10-01 |
| **Objetivo** | Implementar de extremo a extremo el control de convocatorias abiertas/cerradas con los 2 programas autorizados, el Módulo de Tesorería para gestión de pagos y emisión de FUT, y el nuevo flujo de datos escalonado. |

---

## 1. Arquitectura y Componentes a Desarrollar / Modificar

```
[ Frontend: React 19 SPA ]
   ├── src/pages/treasury/TreasuryDashboard.jsx   <-- NUEVO Módulo de Tesorería y Caja
   ├── src/services/treasuryService.js             <-- NUEVO Servicio API de Tesorería
   ├── src/pages/admission/AdmissionDashboard.jsx  <-- Control de Convocatoria (Abierta/Cerrada, Modal Crear)
   ├── src/pages/admission/ModalInscripcionFlujo.jsx <-- Flujo Reformulado (Datos básicos -> Tesorería -> FUT -> Datos completos)
   ├── src/pages/admission/ModalCrearConvocatoria.jsx <-- NUEVO Modal de Creación de Convocatoria
   ├── src/layouts/DashboardLayout.jsx             <-- Agrega enlace al "Módulo de Tesorería"
   └── src/App.jsx                                 <-- Ruta protegida /treasury
           │
           ▼
[ Backend: Laravel 13 API ]
   ├── app/Http/Controllers/Api/TesoreriaPagoController.php <-- NUEVO Controlador de Tesorería
   ├── app/Http/Controllers/Api/AdmisionProcesoController.php <-- Métodos store() y toggleEstado()
   ├── app/Http/Controllers/Api/AdmisionPostulacionController.php <-- Validar convocatoria abierta y completar datos personales
   ├── app/Http/Requests/StoreAdmisionProcesoRequest.php <-- Validación de nueva convocatoria
   ├── app/Http/Requests/PreInscribirPostulacionRequest.php <-- Solo DNI, Nombres y Apellidos
   ├── app/Http/Requests/CompletarExpedienteRequest.php <-- Incluye datos personales complementarios
   ├── database/seeders/PermissionSeeder.php <-- Permisos de Tesorería y Convocatoria
   └── routes/api.php <-- Rutas de Tesorería y Convocatorias
```

---

## 2. Fases de Implementación

### Fase 1: Backend — Control de Convocatorias y Reglas de Negocio
1. Crear `StoreAdmisionProcesoRequest`: valida nombre, código, fechas, puntaje y vacantes para los 2 programas autorizados.
2. En `AdmisionProcesoController`:
   - Implementar `store()`: crea la convocatoria y genera automáticamente los registros de oferta exclusivamente para `Educación Inicial` y `Educación Física`.
   - Implementar `toggleEstado()`: alterna entre `CONVOCATORIA_ABIERTA` y `CONVOCATORIA_CERRADA`.
3. En `AdmisionPostulacionController`:
   - En `preInscribir()`: verificar que la convocatoria esté abierta (`CONVOCATORIA_ABIERTA`). Si está cerrada, responder 422.
   - En `completarExpediente()`: verificar que el pago esté validado y exista `numero_fut`. Si no, responder 422. Actualizar datos personales complementarios en `Persona`.

### Fase 2: Backend — Módulo de Tesorería
1. Crear `TesoreriaPagoController`:
   - `index()`: listar postulaciones para cobro con filtros y búsqueda.
   - `consultarDni()`: consulta rápida de derecho de admisión por DNI.
   - `registrarPago()`: valida el pago, emite el número correlativo de FUT y habilita la postulación.
2. Registrar rutas en `backend/routes/api.php` bajo `/api/tesoreria/pagos-admision`.
3. Actualizar `PermissionSeeder` con permisos de tesorería y asignarlos al rol admin/superadmin.

### Fase 3: Frontend — Módulo de Tesorería
1. Crear `treasuryService.js` con llamadas a los endpoints de tesorería.
2. Desarrollar `TreasuryDashboard.jsx`:
   - Métricas de recaudación.
   - Buscador rápido por DNI/código de tesorería.
   - Tabla interactiva con estados de pago.
   - Modal de cobro que muestra claramente el código FUT generado.
3. Registrar la ruta `/treasury` en `App.jsx` y en la barra de navegación de `DashboardLayout.jsx`.

### Fase 4: Frontend — Control de Convocatoria y Flujo Reformulado
1. En `AdmissionDashboard.jsx`:
   - Añadir badge de estado: "Convocatoria Abierta" (verde) / "Convocatoria Cerrada" (rojo).
   - Botón toggle para abrir/cerrar convocatoria.
   - Botón y modal para "Crear Convocatoria" con los 2 programas fijos.
   - Bloquear nuevas inscripciones si la convocatoria está cerrada.
2. En `ModalInscripcionFlujo.jsx`:
   - Reformular textos profesionales (eliminar "inscripción Ofial" y afines).
   - Paso 1: Ingreso exclusivo de DNI, Nombres y Apellidos + selección de carrera (Ed. Inicial / Ed. Física).
   - Paso 2: Pantalla de Código de Tesorería (DNI) con opción de ir a caja.
   - Paso 3: Validación de Pago & Emisión de FUT.
   - Paso 4: Solo una vez emitido el FUT, habilitar formulario de datos personales complementarios (fecha nac., sexo, cel, email, dir), procedencia escolar y requisitos.
   - Paso 5: Formatos Oficiales (FUT y Declaración Jurada).

### Fase 5: Tests Automatizados y Verificación
1. Actualizar y ampliar Feature Tests en `backend/tests/Feature/AdmisionFlujoInscripcionTest.php` y nuevo `TesoreriaPagoTest.php`.
2. Ejecutar `php artisan test` para asegurar el 100% de tests pasando.
3. Verificar la interfaz y flujo completo en el navegador.
