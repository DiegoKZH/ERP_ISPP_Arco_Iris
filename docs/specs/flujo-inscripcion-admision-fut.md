# SPEC — Flujo Integral de Inscripción de Admisión, Tesorería y Emisión de FUT

| Metadato | Detalle |
|----------|---------|
| **Módulo** | 08 — Admisión |
| **Fecha de Creación** | 2026-09-24 |
| **Estado** | APROBADO PARA IMPLEMENTACIÓN |
| **Prioridad** | ALTA |
| **Autores** | Equipo de Desarrollo ERP Instituto |

---

## 1. Contexto y Problema

El módulo de admisión actual presentaba un registro simplificado que no contemplaba el flujo real e institucional que rige el proceso de admisión en las Instituciones de Educación Superior Pedagógica (IESP).

En la práctica institucional peruana:
1. El postulante se pre-inscribe con sus datos personales e identificación (DNI).
2. Se le asigna como **código de tesorería su propio DNI** para realizar el abono por derecho de admisión en caja / banco.
3. Al confirmarse el pago en tesorería con dicho código (DNI), el sistema valida el comprobante y emite automáticamente un **Número Oficial de FUT (Formulario Único de Trámite)** correlativo.
4. Con el FUT emitido, el postulante/operador completa los datos de su **colegio de procedencia secundaria con su código modular**, adjunta/registra su **fotografía tamaño carnet/pasaporte**, y se verifica la entrega de requisitos indispensables (fotocopia de DNI a color, partida de nacimiento, certificado de nacimiento/estudios original).
5. El sistema genera los documentos oficiales listos para imprimir o descargar en PDF:
   - **Formato Oficial de FUT** con los datos prellenados y las casillas/líneas en blanco reglamentarias para ser completadas a mano con lapicero por Mesa de Partes y el administrado.
   - **Declaración Jurada Oficial de no registrar antecedentes penales, judiciales ni policiales**, con espacios para firma manuscrita, fecha y huella dactilar.
6. El postulante queda formalmente registrado e inscrito en la base de datos con su expediente completo y apto para rendir las evaluaciones.

---

## 2. Requerimientos Funcionales y Fases del Flujo

### Fase 1: Datos Personales Iniciales y Pre-inscripción
- **Selección académica**: Proceso de admisión activo y Programa Ofertado / Modalidad.
- **Datos de Persona**:
  - DNI / Documento de identidad.
  - Nombres, Apellido Paterno, Apellido Materno.
  - Sexo, Fecha de Nacimiento.
  - Celular, Correo Electrónico Personal, Domicilio / Dirección.
- **Salida**: Se crea/actualiza el registro en `personas` y la postulación en `admision_postulaciones` con estado `PENDIENTE_PAGO`.

### Fase 2: Generación del Código de Tesorería
- El sistema asigna automáticamente el **número de DNI** del postulante como su `codigo_tesoreria`.
- Se genera una orden de pago por derecho de admisión pendiente de cobro en tesorería.

### Fase 3: Retorno / Validación de Pago de Tesorería y Emisión de FUT
- Tesorería (o el operador con recibo de caja) valida el abono mediante el DNI.
- Se registra `estado_pago = 'PAGADO'`, `fecha_pago` y el `comprobante_pago` (N° de operación o recibo de caja).
- El sistema genera un correlativo oficial único: `numero_fut` (ejemplo: `FUT-2026-0001`).
- El estado de la postulación pasa a `PAGO_VALIDADO`.

### Fase 4: Datos Faltantes (Colegio Modular) y Requisitos Documentarios
- **Colegio de procedencia**:
  - Nombre de la Institución Educativa donde concluyó secundaria.
  - Código Modular (7 dígitos del MINEDU).
  - Año de egreso secundario.
  - Tipo de gestión (Pública / Privada).
  - Departamento, Provincia, Distrito.
- **Expediente Documentario**:
  - Fotografía digital del postulante (`foto_url`).
  - Fotocopia de DNI a color (`tiene_copia_dni_color`: booleano verificado).
  - Partida de nacimiento (`tiene_partida_nacimiento`: booleano verificado).
  - Certificado de estudios / nacimiento original (`tiene_certificado_nacimiento_original`: booleano verificado).

### Fase 5: Generación de Documentos Oficiales en PDF / Imprimibles
1. **Formato Único de Trámite (FUT)**:
   - Membrete oficial institucional (Ministerio de Educación, DRE, IESP, año oficial).
   - N° de FUT generado correlativamente.
   - Resumen y cuerpo de la petición.
   - Identificación completa del administrado.
   - Procedencia académica (Colegio y código modular).
   - Cuadro de requisitos adjuntos presentados.
   - **Espacios en blanco para completar con lapicero**:
     - Líneas de fundamentación adicional a mano.
     - Casilla de folio y sellos de mesa de partes.
     - Recuadro para firma y sello de recepción.
     - Firma del administrado solicitante.
2. **Declaración Jurada de No Registrar Antecedentes**:
   - Formato legal bajo la Ley de Procedimiento Administrativo General (Ley N° 27444).
   - Datos del declarante y declaración expresa de no poseer antecedentes policiales, penales ni judiciales.
   - Recuadros para firma, huella dactilar (índice derecho), fecha y lugar.

### Fase 6: Confirmación y Registro Oficial
- Estado de la postulación pasa a `INSCRITO` / `APTO_EVALUACION`.
- Se visualiza en el Padrón Oficial de Postulantes con datos de base de datos verídicos y opciones de reimpresión de FUT y Declaración Jurada en cualquier momento.

---

## 3. Modelo de Datos y Cambios en Base de Datos

### Tabla `admision_postulaciones` (Nuevas Columnas)
| Columna | Tipo | Nulable | Descripción |
|---------|------|---------|-------------|
| `codigo_tesoreria` | string(30) | Sí | Código para pagar en caja (DNI del postulante) |
| `estado_pago` | string(30) | No | 'PENDIENTE', 'PAGADO', 'EXONERADO' (Default: 'PENDIENTE') |
| `fecha_pago` | timestamp | Sí | Fecha y hora en que se confirmó el pago |
| `comprobante_pago` | string(50) | Sí | Número de recibo o boleta de tesorería |
| `monto_pago` | decimal(10,2) | Sí | Monto abonado por derecho de admisión |
| `numero_fut` | string(30) | Sí (Unique) | Número de FUT oficial correlativo emitido |
| `fecha_emision_fut` | timestamp | Sí | Fecha y hora de emisión del FUT |
| `colegio_fin_secundaria` | string(200) | Sí | Nombre de la I.E. donde terminó secundaria |
| `codigo_modular_colegio` | string(10) | Sí | Código modular del colegio (7 dígitos) |
| `anio_egreso_colegio` | integer | Sí | Año en que egresó de secundaria |
| `colegio_tipo_gestion` | string(20) | Sí | 'PUBLICA' o 'PRIVADA' |
| `colegio_departamento` | string(50) | Sí | Departamento de la I.E. |
| `colegio_provincia` | string(50) | Sí | Provincia de la I.E. |
| `colegio_distrito` | string(50) | Sí | Distrito de la I.E. |
| `foto_url` | string(255) | Sí | Ruta o URL de la fotografía del postulante |
| `tiene_copia_dni_color` | boolean | No | Verificación de copia DNI a color (Default: false) |
| `tiene_partida_nacimiento` | boolean | No | Verificación de partida de nacimiento (Default: false) |
| `tiene_certificado_nacimiento_original` | boolean | No | Verificación de certificado original (Default: false) |

---

## 4. Endpoints API REST

1. `POST /api/admision/postulaciones/pre-inscribir`:
   - Registra/actualiza `Persona`, genera `AdmisionPostulacion` en estado `PENDIENTE_PAGO` y asigna `codigo_tesoreria = DNI`.
2. `POST /api/admision/postulaciones/{id}/validar-pago`:
   - Recibe `comprobante_pago` y confirma pago. Genera correlativo `numero_fut` (ej. `FUT-2026-0001`) y cambia estado a `PAGO_VALIDADO`.
3. `POST /api/admision/postulaciones/{id}/completar-expediente`:
   - Guarda datos del colegio modular, fotografía y checklist de documentos (DNI color, partida, certificado). Estado pasa a `INSCRITO`.
4. `GET /api/admision/postulaciones/{id}/fut-documento`:
   - Devuelve la información completa formateada para el FUT oficial institucional.
5. `GET /api/admision/postulaciones/{id}/declaracion-jurada`:
   - Devuelve la información formateada para la Declaración Jurada oficial de antecedentes.
6. `GET /api/admision/postulaciones/{id}/imprimir-fut`:
   - Renderiza la plantilla HTML oficial lista para imprimir en hoja A4 con márgenes y cajas reglamentarias.
7. `GET /api/admision/postulaciones/{id}/imprimir-declaracion`:
   - Renderiza la plantilla HTML oficial de Declaración Jurada para imprimir en hoja A4 con recuadros de firma y huella dactilar.

---

## 5. Criterios de Aceptación

1. **Flujo secuencial y guiado**: El usuario puede completar el registro paso a paso sin errores de inconsistencia de datos.
2. **Validación de Tesorería por DNI**: El código de tesorería es exactamente el DNI del postulante y sólo tras validar el pago se emite el número de FUT.
3. **Número de FUT correlativo**: Se garantiza que el número de FUT es único y correlativo por año/proceso.
4. **Datos Escolares y Documentarios**: Se guardan en base de datos real el nombre del colegio, código modular, año y los 3 requisitos físicos verificados.
5. **Generación e Impresión Oficial**: El sistema genera el FUT con casillas en blanco para lapicero y la Declaración Jurada con recuadros de firma y huella dactilar, permitiendo impresión o descarga directa en PDF desde el navegador.
6. **Padrón de Postulantes Dinámico**: La tabla de postulantes muestra datos verídicos obtenidos del backend (FUT, Estado de Pago, Colegio, DNI, Programa) y permite descargar los documentos de cualquier postulante.

