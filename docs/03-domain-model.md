# Modelo de Dominio

> Este documento describe conceptualmente las entidades y relaciones del dominio del ERP Instituto.
> **No es un esquema de base de datos**. Es un modelo conceptual para guiar el diseño.

---

## 1. Clasificación de entidades

### Estado de las entidades

Cada entidad se clasifica según su estado actual:

- **Existente en código**: Ya tiene modelo, migración o tabla en el proyecto.
- **Conceptualmente necesaria**: Requerida por el dominio pero no implementada aún.
- **Propuesta**: Sugerida por el análisis pero pendiente de validación.

---

## 2. Entidades existentes en código

| Entidad | Modelo | Tabla | Descripción |
|---------|--------|-------|-------------|
| User | `App\Models\User` | `users` | Usuario del sistema (identidad, auth, roles) |
| Role | `App\Models\Role` | `roles` | Roles institucionales RBAC |
| Permission | `App\Models\Permission` | `permissions` | Permisos granulares por módulo |
| PersonalAccessToken | `Laravel\Sanctum\PersonalAccessToken` | `personal_access_tokens` | Tokens API de Sanctum |
| Session | — (tabla Laravel) | `sessions` | Sesiones de usuario |
| PasswordResetToken | — (tabla Laravel) | `password_reset_tokens` | Tokens de reset |
| Cache | — (tabla Laravel) | `cache`, `cache_locks` | Cache del sistema |
| Job | — (tabla Laravel) | `jobs`, `job_batches`, `failed_jobs` | Cola de trabajos |

> **Nota**: Se cuenta con el núcleo de persistencia en PostgreSQL y el sistema RBAC transversal implementado. Las entidades de negocio de los 14 módulos se irán implementando según el flujo SDD.

---

## 3. Entidades conceptualmente necesarias

### 3.1 Entidades transversales (compartidas entre módulos)

| Entidad | Descripción | Módulos que la usan |
|---------|-------------|---------------------|
| Persona | Datos personales base (nombre, DNI, dirección, contacto) | Todos |
| Estudiante | Persona matriculada en la institución | Académico, Admisión, Bienestar, Cuentas por Cobrar |
| Docente | Persona que imparte enseñanza | Académico, RRHH, Evaluación Docente, Plataforma Virtual |
| Empleado | Persona que trabaja en la institución | RRHH, todos los administrativos |
| Periodo Académico | Semestre o ciclo lectivo | Académico, Admisión, Planificación |
| Programa de Estudios | Carrera o especialidad ofrecida | Académico, Admisión |

### 3.2 Entidades del módulo Académico

| Entidad | Descripción |
|---------|-------------|
| Plan de Estudios | Conjunto de cursos y créditos de un programa |
| Curso / Asignatura | Unidad de enseñanza con créditos y horas |
| Matrícula | Registro de un estudiante en un periodo |
| Detalle de Matrícula | Cursos específicos matriculados |
| Horario | Distribución de horas por curso, docente y aula |
| Aula | Espacio físico de enseñanza |
| Calificación / Nota | Evaluación del estudiante en un curso |
| Acta de Notas | Documento oficial de calificaciones |
| Asistencia | Registro de asistencia de estudiantes |

### 3.3 Entidades del módulo Recursos Humanos

| Entidad | Descripción |
|---------|-------------|
| Contrato | Relación laboral con la institución |
| Cargo | Puesto dentro de la institución |
| Área / Dependencia | Unidad organizacional |
| Control de Asistencia | Registro de entrada/salida del personal |
| Licencia / Permiso | Ausencias autorizadas |
| Planilla | Registro de remuneraciones |

### 3.4 Entidades del módulo Contabilidad

| Entidad | Descripción |
|---------|-------------|
| Plan Contable | Catálogo de cuentas contables |
| Asiento Contable | Registro contable (debe/haber) |
| Libro Contable | Libro diario, mayor, etc. |
| Comprobante de Pago | Documento tributario |
| Periodo Contable | Mes/año fiscal |

### 3.5 Entidades del módulo Planificación y Presupuesto

| Entidad | Descripción |
|---------|-------------|
| Presupuesto | Asignación de recursos por periodo |
| Partida Presupuestal | Clasificador de gastos |
| Ejecución Presupuestal | Registro de gastos contra presupuesto |

### 3.6 Entidades del módulo Cuentas por Cobrar

| Entidad | Descripción |
|---------|-------------|
| Concepto de Cobro | Tipo de ingreso (matrícula, pensión, certificado) |
| Cuenta por Cobrar | Deuda registrada a un estudiante/tercero |
| Pago | Registro de pago recibido |
| Cronograma de Pagos | Fechas y montos programados |
| Recibo | Comprobante de pago emitido |

### 3.7 Entidades del módulo Cuentas por Pagar

| Entidad | Descripción |
|---------|-------------|
| Proveedor | Persona o empresa proveedora |
| Cuenta por Pagar | Obligación de pago pendiente |
| Orden de Pago | Autorización de desembolso |

### 3.8 Entidades del módulo Admisión

| Entidad | Descripción |
|---------|-------------|
| Proceso de Admisión | Convocatoria de ingreso por periodo |
| Postulante | Persona que aplica para ingreso |
| Inscripción | Registro del postulante en un proceso |
| Examen de Admisión | Evaluación aplicada |
| Resultado de Admisión | Calificación y estado (ingresante/no ingresante) |

### 3.9 Entidades del módulo FUT Electrónico

| Entidad | Descripción |
|---------|-------------|
| Solicitud (FUT) | Formulario Único de Trámite |
| Tipo de Trámite | Categoría de solicitud |
| Seguimiento | Historial de estados de la solicitud |
| Resolución | Respuesta oficial a la solicitud |

### 3.10 Entidades del módulo Logística

| Entidad | Descripción |
|---------|-------------|
| Requerimiento | Solicitud de bienes o servicios |
| Orden de Compra | Autorización de adquisición |
| Cotización | Propuesta de precio de un proveedor |
| Cuadro Comparativo | Comparación de cotizaciones |

### 3.11 Entidades del módulo Almacén

| Entidad | Descripción |
|---------|-------------|
| Producto / Bien | Artículo almacenado |
| Categoría | Clasificación de productos |
| Ingreso de Almacén | Entrada de bienes |
| Salida de Almacén | Despacho de bienes |
| Kardex | Control de existencias |

### 3.12 Entidades del módulo Bienestar

| Entidad | Descripción |
|---------|-------------|
| Servicio de Bienestar | Tipo de servicio ofrecido (psicología, salud, tutoría) |
| Atención | Registro de atención a un estudiante |
| Beca | Beneficio económico otorgado |

### 3.13 Entidades del módulo Patrimonio

| Entidad | Descripción |
|---------|-------------|
| Bien Patrimonial | Activo fijo de la institución |
| Inventario | Registro de bienes por ubicación |
| Baja de Bien | Retiro de un bien del patrimonio |
| Asignación | Responsable de un bien |

### 3.14 Entidades del módulo Evaluación Docente

| Entidad | Descripción |
|---------|-------------|
| Periodo de Evaluación | Ciclo de evaluación docente |
| Instrumento de Evaluación | Rúbrica o cuestionario utilizado |
| Evaluación | Resultado de evaluación de un docente |
| Criterio | Dimensión evaluada |

### 3.15 Entidades del módulo Plataforma Virtual

| Entidad | Descripción |
|---------|-------------|
| Aula Virtual | Espacio digital de un curso |
| Material | Recurso educativo compartido |
| Tarea | Actividad asignada al estudiante |
| Entrega | Respuesta del estudiante a una tarea |
| Foro | Espacio de discusión |

---

## 4. Relaciones principales (conceptuales)

```
Persona
  ├── Estudiante (1:1)
  ├── Docente (1:1)
  └── Empleado (1:1)

Estudiante
  ├── Matrículas (1:N)
  ├── Calificaciones (1:N)
  ├── Cuentas por Cobrar (1:N)
  ├── Solicitudes FUT (1:N)
  └── Atenciones Bienestar (1:N)

Docente
  ├── Horarios (1:N)
  ├── Evaluaciones Docentes (1:N)
  └── Aulas Virtuales (1:N)

Programa de Estudios
  ├── Plan de Estudios (1:N por versión)
  └── Estudiantes (1:N)

Plan de Estudios
  └── Cursos (N:M)

Periodo Académico
  ├── Matrículas (1:N)
  ├── Horarios (1:N)
  └── Proceso de Admisión (1:1)
```

> **IMPORTANTE**: Estas relaciones son conceptuales. Los detalles de implementación (claves foráneas, tablas pivot, polimorfismo) se definirán en las especificaciones de cada módulo.

---

## 5. Consideraciones

### Relación User ↔ Persona

**Pendiente de definición**: ¿El modelo `User` (autenticación) y `Persona` (datos personales) serán la misma tabla o tablas separadas? Opciones:

1. **Misma tabla**: `users` contiene datos de auth + datos personales.
2. **Tablas separadas**: `users` solo para auth, `personas` para datos personales, con relación 1:1.
3. **Polimorfismo**: Un User puede ser asociado a un Estudiante, Docente o Empleado.

> Esta decisión afecta a todo el sistema y debe tomarse antes de implementar cualquier módulo.

### Soft deletes

**Pendiente de definición**: ¿Se usará eliminación lógica (`SoftDeletes`) en las entidades del ERP? Recomendado para entidades con valor histórico (matrículas, notas, pagos).

### Multi-tenancy

**No aplica**: El sistema es para una sola institución. No se requiere multi-tenancy.

---

*Última actualización: Septiembre 2026*
