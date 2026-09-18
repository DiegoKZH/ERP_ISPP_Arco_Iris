# Contexto del Proyecto

## Propósito

ERP Instituto es un sistema de gestión integral diseñado para una **institución de educación superior pedagógica**. Su objetivo es centralizar y automatizar los procesos académicos, administrativos y financieros de la institución en una única plataforma web.

## Contexto institucional

Las instituciones de educación superior pedagógica (IESP) en Perú forman profesionales en educación. Sus procesos incluyen:

- Gestión académica (matrículas, planes de estudio, notas, horarios).
- Gestión de personal docente y administrativo.
- Gestión financiera (contabilidad, presupuesto, cobranzas, pagos).
- Procesos de admisión.
- Gestión logística y patrimonial.
- Bienestar estudiantil.
- Trámite documentario.
- Evaluación del desempeño docente.
- Plataforma virtual educativa.

> **Nota**: Los procesos específicos, reglas de negocio y normativas de la institución están **pendientes de definición detallada**. Este documento describe el contexto general; las especificaciones funcionales se desarrollarán módulo por módulo.

## Objetivo general

Proveer un sistema unificado que permita a la institución:

- Gestionar el ciclo de vida académico completo del estudiante.
- Administrar recursos humanos, financieros y materiales.
- Generar información para la toma de decisiones.
- Cumplir con requisitos normativos y de acreditación.
- Ofrecer servicios digitales a estudiantes, docentes y personal administrativo.

## Alcance general

El sistema está compuesto por **14 módulos funcionales**:

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

> Los módulos se documentan individualmente en `docs/modules/`.

## Usuarios y actores conocidos

Los siguientes tipos de usuarios se identifican conceptualmente. Los roles, permisos y accesos específicos están **pendientes de definición**.

| Actor | Descripción |
|-------|-------------|
| Estudiante | Alumno matriculado o postulante |
| Docente | Profesor de la institución |
| Personal administrativo | Empleados de áreas no académicas |
| Director General | Máxima autoridad de la institución |
| Director Académico | Responsable del área académica |
| Secretaría Académica | Gestión de registros y certificaciones |
| Tesorería | Gestión de cobros y pagos |
| Contabilidad | Registro contable y reportes financieros |
| Logística | Gestión de compras y abastecimiento |
| Bienestar | Servicios de apoyo al estudiante |
| Administrador del sistema | Configuración y mantenimiento técnico |

## Tecnologías

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Backend | Laravel | 13.x |
| Frontend | React | 19.x |
| Bundler | Vite | 8.x |
| Estilos | Tailwind CSS | 4.x |
| Autenticación | Laravel Sanctum | 4.x |
| BD desarrollo | SQLite | — |
| BD producción | **Pendiente** (MySQL o PostgreSQL) | — |
| Testing backend | PHPUnit | 12.x |
| PHP | — | ^8.3 |
| Node.js | — | ^20.x |

## Características principales de la arquitectura

- **Monorepo híbrido**: Backend y frontend en el mismo repositorio, separados en carpetas independientes.
- **API REST + SPA**: El backend expone una API REST; el frontend es una Single Page Application que consume esa API.
- **Separación de responsabilidades**: Laravel se encarga de la lógica de negocio, validación, autenticación y persistencia. React se encarga de la interfaz de usuario.

## Límites conocidos

- El proyecto se encuentra en **fase inicial** (bootstrapping completado, sin lógica de negocio implementada).
- No se han definido aún los procesos institucionales detallados.
- No existe sistema de roles y permisos implementado.
- La base de datos de producción no ha sido seleccionada definitivamente.
- No se ha definido la estrategia de despliegue.

---

*Última actualización: Septiembre 2026*
