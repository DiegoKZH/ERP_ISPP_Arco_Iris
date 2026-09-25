# Plan de Implementación: Evolución de Base de Datos, Entidad Persona y Módulo de Admisión

> **Spec**: [evolucion-bd-admision.md](file:///c:/Users/RECURSOS%20HUMANOS/Documents/PROYECTO/erp-instituto/docs/specs/evolucion-bd-admision.md)  
> **Fecha**: 23 de Septiembre de 2026  
> **Autor**: Antigravity AI (Pair Programming)  

---

## 1. Análisis de la Implementación Actual y Corrección Previa

- **Inconsistencia a subsanar**: En la tabla `migrations` de PostgreSQL existe el registro huérfano `2026_09_22_000001_create_students_table` (Batch 2). Debe eliminarse dicho registro para que la tabla `migrations` refleje exactamente los archivos físicos existentes.
- **Estructuras a conservar intactas**: `users`, `roles`, `permissions`, `role_user`, `permission_role`, `permission_user`, `personal_access_tokens`, `sessions`. Las credenciales y accesos de `superadmin` y `docente123` deben permanecer inalterados.
- **Entidades a crear**:
  1. `personas` (núcleo civil transversal).
  2. `programas_estudio` y `periodos_academicos` (catálogos maestros institucionales).
  3. `admision_procesos`, `admision_modalidades`, `admision_programas_ofertados`.
  4. `admision_requisitos`, `admision_modalidad_requisitos`.
  5. `admision_postulaciones`, `admision_documentos_postulante`.
  6. `admision_ambientes`, `admision_postulante_ambiente`.
  7. `admision_evaluaciones`, `admision_calificaciones`.
  8. `admision_resultados`, `admision_constancias`.
  9. `estudiantes` (vinculado a `personas`, `programas_estudio` y postulación de origen).

---

## 2. Arquitectura Afectada

- [x] Base de datos y Migraciones (`backend/database/migrations/`)
- [x] Modelos Eloquent (`backend/app/Models/`)
- [x] Factories y Seeders (`backend/database/seeders/`)
- [x] Form Requests de Validación (`backend/app/Http/Requests/`)
- [x] API Resources (`backend/app/Http/Resources/`)
- [x] Controladores API REST (`backend/app/Http/Controllers/Api/`)
- [x] Rutas de API (`backend/routes/api.php`)
- [x] Servicios Frontend (`frontend/src/services/`)
- [x] Vistas y Páginas Frontend (`frontend/src/pages/admission/`)
- [x] Navegación y Router (`frontend/src/app.jsx`, `frontend/src/layouts/DashboardLayout.jsx`)
- [x] Tests Feature Automatizados (`backend/tests/Feature/`)

---

## 3. Orden Estratégico de Implementación

1. **Subsanación de Base de Datos**:
   - Limpiar el registro huérfano en `migrations` mediante script seguro.
2. **Migraciones del Núcleo y Catálogos**:
   - `create_personas_table`
   - `create_programas_estudio_table`
   - `create_periodos_academicos_table`
3. **Migraciones del Módulo de Admisión**:
   - `create_admision_procesos_y_modalidades_tables`
   - `create_admision_requisitos_tables`
   - `create_admision_postulaciones_y_documentos_tables`
   - `create_admision_ambientes_y_evaluaciones_tables`
   - `create_admision_calificaciones_resultados_constancias_tables`
   - `create_estudiantes_table` (diseño definitivo vinculado a persona)
4. **Modelos Eloquent y Relaciones**:
   - `Persona`, `ProgramaEstudio`, `PeriodoAcademico`
   - `AdmisionProceso`, `AdmisionModalidad`, `AdmisionProgramaOfertado`
   - `AdmisionRequisito`, `AdmisionPostulacion`, `AdmisionDocumentoPostulante`
   - `AdmisionAmbiente`, `AdmisionEvaluacion`, `AdmisionCalificacion`
   - `AdmisionResultado`, `AdmisionConstancia`, `Estudiante`
5. **Seeders y Datos de Prueba**:
   - `PersonaSeeder`, `ProgramaEstudioSeeder`, `PeriodoAcademicoSeeder`
   - `AdmisionSeeder` (proceso 2026-I, modalidades, programas ofertados, vacantes, requisitos, ambientes, evaluaciones, postulantes de prueba con calificaciones y resultados)
   - Actualización de `PermissionSeeder` con permisos de admisión
6. **Backend API REST**:
   - Requests de validación para postulación y calificación
   - Resources para serialización JSON
   - Controladores: `PersonaController`, `AdmisionProcesoController`, `AdmisionPostulacionController`, `AdmisionResultadoController`
   - Rutas protegidas en `api.php`
7. **Tests Feature**:
   - Pruebas automatizadas del ciclo completo de admisión
8. **Frontend**:
   - Servicios API `personaService.js`, `admissionService.js`
   - Páginas de gestión de admisión en React + MUI
   - Integración al menú lateral y router
9. **Verificación y Documentación**:
   - Ejecución completa de tests
   - Verificación de no regresión en login y usuarios existentes

---

*Última actualización: Septiembre 2026*

