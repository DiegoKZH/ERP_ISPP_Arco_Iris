# Módulo 01 — Académico

> **Área**: Académica
> **Estado**: Pendiente de implementación
> **Implementación actual**: Ninguna

---

## Propósito

Gestionar el ciclo académico de la institución: planes de estudio, matriculas, horarios, calificaciones, asistencia y documentos académicos.

## Alcance conocido

### Procesos principales

- Gestión de programas de estudios y planes curriculares.
- Matrícula de estudiantes por periodo académico.
- Asignación de docentes a cursos.
- Elaboración de horarios.
- Registro de calificaciones y actas de notas.
- Control de asistencia de estudiantes.
- Generación de constancias y certificados.
- Gestión de periodos académicos (semestres, ciclos).

### Funcionalidades conocidas

- CRUD de programas de estudios.
- CRUD de planes de estudio (con versionamiento por programa).
- CRUD de cursos/asignaturas (créditos, horas, tipo, prerrequisitos).
- Proceso de matrícula (selección de cursos disponibles por estudiante).
- Gestión de horarios (aula, docente, curso, hora, día).
- Registro de notas por curso y periodo.
- Generación de actas de notas.
- Consulta de historial académico.
- Control de asistencia.

## Actores

| Actor | Rol en este módulo |
|-------|-------------------|
| Secretaría Académica | Administrar programas, planes, matrículas, actas |
| Docente | Registrar notas, asistencia |
| Estudiante | Consultar notas, horario, historial |
| Director Académico | Supervisar, aprobar planes de estudio |

## Relaciones con otros módulos

| Módulo | Relación |
|--------|----------|
| Cuentas por Cobrar | La matrícula genera deuda |
| Plataforma Virtual | Los cursos se reflejan como aulas virtuales |
| Admisión | Los ingresantes se convierten en estudiantes |
| Recursos Humanos | Los docentes son empleados |
| Evaluación Docente | Las asignaciones de cursos alimentan la evaluación |
| Bienestar | Información académica para seguimiento |

## Información principal

| Entidad | Descripción |
|---------|-------------|
| Programa de Estudios | Carrera ofrecida por la institución |
| Plan de Estudios | Malla curricular de un programa |
| Curso / Asignatura | Unidad de enseñanza |
| Periodo Académico | Semestre o ciclo |
| Matrícula | Inscripción de estudiante en un periodo |
| Horario | Distribución de horas |
| Calificación | Nota obtenida por estudiante en un curso |
| Acta de Notas | Documento oficial de calificaciones |

## Aspectos pendientes de definición

- Sistema de notas (¿vigesimal, literal, otro?).
- Reglas de prerrequisitos y co-requisitos.
- Estados de matrícula (regular, extemporánea, retiro, reserva).
- Reglas de aprobación y desaprobación.
- Número máximo de créditos por periodo.
- Proceso de convalidación.
- Reglas de permanencia (máximo de periodos, promedio mínimo).
- Formato de actas y certificados.
- Reglas de generación de horarios.

---

*Última actualización: Septiembre 2026*
