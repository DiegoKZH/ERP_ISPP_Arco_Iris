# Módulo 08 — Admisión

> **Área**: Académica
> **Estado**: Implementado
> **Implementación actual**: Backend Laravel (API REST), Frontend React (SPA), Integración con Tesorería

---

## Propósito

Gestionar de forma integral el proceso de admisión de nuevos estudiantes para el Instituto de Educación Superior Pedagógico Público (IESPP): control de convocatorias, inscripción y ficha integral de postulantes, integración con Tesorería para emisión del Formulario Único de Trámite (FUT), calificación de evaluaciones, publicación de resultados y emisión de formatos reglamentarios.

---

## Alcance Implementado

### 1. Control y Gestión de Convocatorias
- Estados estrictos: **Convocatoria Abierta** (`CONVOCATORIA_ABIERTA`) y **Convocatoria Cerrada** (`CONVOCATORIA_CERRADA`).
- Bloqueo en backend (HTTP 422) y frontend de nuevas solicitudes de inscripción cuando la convocatoria esté cerrada.
- Oferta académica restringida exclusivamente a los dos (02) programas pedagógicos autorizados:
  - **Educación Inicial**
  - **Educación Física**

### 2. Flujo Institucional Integrado con Tesorería & Emisión de FUT
- **Código de Cobranza en Tesorería**: Es el propio **DNI** del postulante.
- **Fase Inicial (Generación de Código)**: Se registran los datos de identidad (DNI, Nombres y Apellidos). El sistema asigna el código de cobranza sin bloquear el trámite por programa.
- **Fase de Pago en Tesorería**: En el Módulo de Tesorería (`/treasury`), se registra el abono del derecho de admisión (S/ 150.00) y se emite de manera correlativa y automática el **Código Oficial de FUT** (`FUT-YYYY-XXXX`).
- **Fase de Expediente y Continuidad**: Una vez emitido el FUT, se completa la ficha integral (datos personales complementarios, procedencia escolar con código modular de 7 dígitos y requisitos físicos).
- **Mecanismo de Reanudación y Continuidad**: Permite consultar y continuar el flujo mediante DNI (`GET /api/admision/postulaciones/consultar-dni/{dni}`) o desde el Padrón ("Continuar Inscripción"), evitando errores de duplicidad de clave única y precargando automáticamente el estado y los datos guardados.

### 3. Pantalla Dedicada de Inscripción (`/admission/inscribir`)
- Interfaz estructurada en 6 pasos visuales con barra de progreso superior:
  1. **Datos (Información Personal)**: DNI con botón de consulta **[RENIEC]**, correo, nombres, apellidos, sexo, fecha de nacimiento, lengua materna, segunda lengua, ubigeo de origen y domicilio, dirección y teléfonos.
  2. **Foto (Imagen de Perfil)**: Subida y previsualización de fotografía formal tamaño carnet.
  3. **Especialidad (Carrera Profesional)**: Selección interactiva entre Educación Inicial y Educación Física.
  4. **Colegio (Institución Educativa)**: Nombre de colegio secundario, código modular (7 dígitos), año de egreso, tipo de gestión y ubicación.
  5. **Documentos (Requisitos)**: Verificación física de copia DNI color, partida de nacimiento y certificado de estudios.
  6. **Pago (Voucher / Monto & Formatos)**: Verificación del pago y visor para imprimir en formato A4 el **Formulario Único de Trámite (FUT)** y la **Declaración Jurada de Antecedentes** (Ley N° 27444).

---

## Arquitectura y Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admision/procesos` | Listar convocatorias |
| `POST` | `/api/admision/procesos` | Crear nueva convocatoria |
| `PATCH` | `/api/admision/procesos/{id}/toggle-estado` | Alternar estado Abierta / Cerrada |
| `GET` | `/api/admision/postulaciones` | Padrón oficial de postulantes (con filtros) |
| `GET` | `/api/admision/postulaciones/consultar-dni/{dni}` | Consultar postulación por DNI para reanudar |
| `POST` | `/api/admision/postulaciones/pre-inscribir` | Registro inicial / Código de Tesorería (DNI) |
| `POST` | `/api/admision/postulaciones/{id}/validar-pago` | Validar abono y emitir Código FUT |
| `POST` | `/api/admision/postulaciones/{id}/completar-expediente` | Ficha integral y requisitos documentarios |
| `GET` | `/api/admision/postulaciones/{id}/fut-documento` | Datos del FUT prellenado |
| `GET` | `/api/admision/postulaciones/{id}/declaracion-jurada` | Datos de la Declaración Jurada |
| `GET` | `/documentos/fut/{id}` | Vista imprimible A4 del FUT |
| `GET` | `/documentos/declaracion-jurada/{id}` | Vista imprimible A4 de la Declaración Jurada |

---

*Última actualización: Octubre 2026*
