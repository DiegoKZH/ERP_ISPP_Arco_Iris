# Módulo 08 — Admisión

> **Área**: Académica
> **Estado**: Implementado y Verificado
> **Implementación actual**: Backend Laravel (API REST), Frontend React (SPA Monorepo), Integración con Tesorería, Theme Modular

---

## Propósito

Gestionar de forma integral el proceso de admisión de nuevos estudiantes para el Instituto de Educación Superior Pedagógico Público (IESPP): control de convocatorias, inscripción y ficha integral de postulantes, integración con Tesorería para emisión del Formulario Único de Trámite (FUT), calificación de evaluaciones, publicación de resultados y emisión de formatos reglamentarios.

---

## Alcance Implementado

### 1. Control y Gestión de Convocatorias (`/admission/convocatorias`)
- Pantalla dedicada y exclusiva para la administración del ciclo de vida de convocatorias.
- Estados estrictos: **Convocatoria Abierta** (`CONVOCATORIA_ABIERTA`) y **Convocatoria Cerrada** (`CONVOCATORIA_CERRADA`).
- Alternancia de estado con modal de confirmación y bloqueo en backend (HTTP 422) y frontend de nuevas solicitudes cuando la convocatoria esté cerrada.
- Creación de convocatorias con asignación exclusiva para los dos (02) programas pedagógicos autorizados:
  - **Educación Inicial**
  - **Educación Física**

### 2. Flujo Institucional Integrado con Tesorería & Emisión de FUT
- **Código de Cobranza en Tesorería**: Es el propio **DNI / documento** del postulante.
- **Fase Inicial (Generación de Código)**: Se registran los datos de identidad (Tipo de Documento, DNI/CE/Pasaporte, Nombres y Apellidos).
- **Fase de Pago en Tesorería**: En el Módulo de Tesorería (`/treasury`), se registra el abono del derecho de admisión (S/ 150.00) y se emite de manera correlativa y automática el **Código Oficial de FUT** (`FUT-YYYY-XXXX`).
- **Fase de Expediente y Continuidad**: Una vez emitido el FUT, se completa la ficha integral (datos personales complementarios, procedencia escolar con código modular de 7 dígitos y requisitos físicos).
- **Reanudación y Continuidad Fluida**: Endpoint `GET /api/admision/postulaciones/consultar-dni/{dni}` y botón de consulta en el Paso 1 para retomar solicitudes sin duplicidad de clave única.

### 3. Pantalla Dedicada de Inscripción (`/admission/inscribir`)
- Flujo interactivo en 6 pasos visuales con barra de progreso superior:
  1. **Datos (Información Personal)**: Selector de tipo de documento (`DNI`, `CE`, `PASAPORTE`), número de documento con botón **COMPROBAR / RENIEC**, fecha de inscripción, país, correo personal, nombres, apellidos, sexo, fecha de nacimiento, lengua materna, segunda lengua, ubigeo de origen y domicilio, dirección y teléfonos.
  2. **Foto (Imagen de Perfil)**: Subida real de fotografía desde el ordenador mediante `FileReader` e input de archivo (JPG/PNG hasta 5 MB), vista previa instantánea, botón para remover foto y campo alternativo para enlace URL.
  3. **Especialidad (Carrera Profesional)**: Selección interactiva entre Educación Inicial y Educación Física.
  4. **Colegio (Institución Educativa)**: Nombre de colegio secundario, código modular (7 dígitos), año de egreso, tipo de gestión (Pública/Privada) y ubicación.
  5. **Documentos (Requisitos)**: Verificación física de copia de documento a color, partida de nacimiento y certificado original de estudios secundarios completos.
  6. **Pago (Voucher / Monto & Formatos)**: Validación de comprobante de caja y visor para imprimir en formato A4 el **Formulario Único de Trámite (FUT)** y la **Declaración Jurada de Antecedentes** (Ley N° 27444).

### 4. Padrón Oficial de Postulantes (`/admission`)
- Pantalla dedicada con tabla completa de postulantes por convocatoria activa.
- Búsqueda en tiempo real por nombres, apellidos, DNI, código de postulante o número de FUT.
- Filtro por estado de inscripción (`TODOS`, `PENDIENTE_PAGO`, `PAGO_VALIDADO`, `INSCRITO`, `APTO_EVALUACION`).
- Acciones rápidas:
  - **Continuar Inscripción**: Permite reanudar trámites incompletos.
  - **Ver FUT** y **Declaración Jurada**: Acceso instantáneo a los formatos oficiales en modal A4 imprimible.
  - **Eliminar Postulante**: Modal de confirmación para dar de baja la postulación. **Algoritmo de Reciclaje de Códigos**: Al eliminar a un postulante, su código de postulante (`POST-...`) y correlativo de FUT (`FUT-...`) se liberan inmediatamente, quedando disponibles para ser reasignados a la siguiente inscripción.

### 5. Vacantes Ofertadas (`/admission/vacantes`)
- Pantalla dedicada con métricas visuales del proceso:
  - Total de vacantes ofertadas, postulantes inscritos y vacantes disponibles.
  - Tarjetas de progreso por especialidad (Educación Inicial y Educación Física).
  - Porcentaje de cobertura y distribución de postulantes.

### 6. Cuadro de Mérito y Resultados (`/admission/resultados`)
- Pantalla dedicada para calificación y orden de mérito:
  - Tabla de resultados con puntaje de examen escrito, evaluación vocacional/entrevista y puntaje final ponderado.
  - Modal para ingreso de calificaciones de postulantes.
  - Estado condicional de mérito: **ALCANZÓ VACANTE** o **NO ALCANZÓ VACANTE** según las vacantes de cada especialidad.
  - Emisión de constancia de ingreso institucional.

### 7. Navegación Exclusiva por Menú Lateral y Theme Modular
- Menú lateral optimizado con acordeones colapsables en `DashboardLayout.jsx`.
- Las subopciones del menú son las **únicas vías de acceso** a cada pantalla, eliminando tabs internos cruzados:
  - `Padrón de Postulantes` (`/admission`)
  - `Inscripción de Postulantes` (`/admission/inscribir`)
  - `Gestión de Convocatorias` (`/admission/convocatorias`)
  - `Vacantes Ofertadas` (`/admission/vacantes`)
  - `Cuadro de Mérito y Resultados` (`/admission/resultados`)
- **Theme Modular**: Paleta centralizada en `frontend/src/theme/colors.js` con azul oscuro institucional (`darkNavy: '#0a111a'`, `darkNavySurface: '#101c2a'`) aplicado uniformemente en el encabezado, menú y componentes. Cero colores independientes hardcodeados.

---

## Arquitectura y Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admision/procesos` | Listar convocatorias |
| `POST` | `/api/admision/procesos` | Crear nueva convocatoria (EI y EF) |
| `PATCH` | `/api/admision/procesos/{id}/toggle-estado` | Alternar estado Abierta / Cerrada |
| `GET` | `/api/admision/postulaciones` | Padrón oficial de postulantes (con filtros) |
| `GET` | `/api/admision/postulaciones/consultar-dni/{dni}` | Consultar postulación por DNI/documento para reanudar |
| `POST` | `/api/admision/postulaciones/pre-inscribir` | Registro inicial / Código de Tesorería |
| `POST` | `/api/admision/postulaciones/{id}/validar-pago` | Validar abono y emitir Código FUT |
| `POST` | `/api/admision/postulaciones/{id}/completar-expediente` | Ficha integral y requisitos documentarios |
| `DELETE` | `/api/admision/postulaciones/{id}` | Eliminar postulante y reciclar códigos correlativos |
| `GET` | `/api/admision/postulaciones/{id}/fut-documento` | Datos del FUT prellenado |
| `GET` | `/api/admision/postulaciones/{id}/declaracion-jurada` | Datos de la Declaración Jurada |
| `GET` | `/documentos/fut/{id}` | Vista imprimible A4 del FUT |
| `GET` | `/documentos/declaracion-jurada/{id}` | Vista imprimible A4 de la Declaración Jurada |

---

*Última actualización: Octubre 2026 — SDD Suite Verificada (46 tests pasando, 195 aserciones, 0 errores en build)*
