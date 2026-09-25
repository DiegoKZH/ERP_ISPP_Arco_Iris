# Tareas: Evolución de Base de Datos, Entidad Persona y Módulo de Admisión

> **Spec**: [evolucion-bd-admision.md](file:///c:/Users/RECURSOS%20HUMANOS/Documents/PROYECTO/erp-instituto/docs/specs/evolucion-bd-admision.md)  
> **Plan**: [evolucion-bd-admision.plan.md](file:///c:/Users/RECURSOS%20HUMANOS/Documents/PROYECTO/erp-instituto/docs/specs/evolucion-bd-admision.plan.md)  
> **Fecha**: 23 de Septiembre de 2026  

---

## 1. Subsanación y Corrección de Base de Datos
- [x] Eliminar el registro huérfano de `2026_09_22_000001_create_students_table` en la tabla `migrations`
- [x] Verificar que `php artisan migrate:status` esté 100% limpio y coincidente con el disco

## 2. Migraciones
- [x] Crear migración `create_personas_table`
- [x] Crear migración `create_academic_catalogs_tables` (`programas_estudio`, `periodos_academicos`)
- [x] Crear migración `create_admission_core_tables` (`admision_procesos`, `admision_modalidades`, `admision_programas_ofertados`, `admision_requisitos`, `admision_modalidad_requisitos`)
- [x] Crear migración `create_admission_postulaciones_tables` (`admision_postulaciones`, `admision_documentos_postulante`, `admision_ambientes`, `admision_postulante_ambiente`)
- [x] Crear migración `create_admission_evaluaciones_y_resultados_tables` (`admision_evaluaciones`, `admision_calificaciones`, `admision_resultados`, `admision_constancias`)
- [x] Crear migración `create_estudiantes_table` (diseño normalizado con `persona_id`, `programa_estudio_id`, `admision_postulacion_id`)
- [x] Ejecutar migraciones (`php artisan migrate`)

## 3. Modelos Eloquent
- [x] Modelo `Persona` (casts, fillable, relaciones con `user`, `postulaciones`, `estudiante`)
- [x] Modelos de catálogos: `ProgramaEstudio`, `PeriodoAcademico`
- [x] Modelos de admisión: `AdmisionProceso`, `AdmisionModalidad`, `AdmisionProgramaOfertado`, `AdmisionRequisito`, `AdmisionPostulacion`, `AdmisionDocumentoPostulante`, `AdmisionAmbiente`, `AdmisionEvaluacion`, `AdmisionCalificacion`, `AdmisionResultado`, `AdmisionConstancia`
- [x] Modelo `Estudiante` actualizado
- [x] Relación opcional en modelo `User` (`persona()`)

## 4. Seeders y Permisos
- [x] Registrar permisos del módulo de admisión en `PermissionSeeder`
- [x] Crear `AcademicCatalogsSeeder` (programas de estudio como Educación Inicial, Primaria, etc., y periodo 2026-I)
- [x] Crear `AdmisionSeeder` (proceso de admisión 2026-I, modalidades, oferta de vacantes, requisitos, evaluaciones, postulantes de prueba, calificaciones y cuadro de méritos con ingresantes y no ingresantes)
- [x] Ejecutar seeders y verificar integridad

## 5. Backend REST API
- [x] Form Requests de validación para admisión
- [x] API Resources para respuestas estructuradas
- [x] Controladores: `AdmisionProcesoController`, `AdmisionPostulacionController`, `AdmisionResultadoController`
- [x] Registrar rutas protegidas en `backend/routes/api.php`

## 6. Pruebas Automatizadas
- [x] Crear `backend/tests/Feature/AdmissionModuleTest.php`
- [x] Ejecutar suite completa (`php artisan test`) y verificar que todos los tests pasen (31/31 pasando al 100%)

## 7. Frontend
- [x] Crear servicio `frontend/src/services/admissionService.js`
- [x] Crear vista `frontend/src/pages/admission/AdmissionDashboard.jsx` (procesos, métricas, cuadro de mérito, postulantes)
- [x] Integrar ruta en `frontend/src/app.jsx` y menú lateral en `frontend/src/layouts/DashboardLayout.jsx`

## 8. Verificación y Cierre
- [x] Comprobar que los usuarios existentes (`superadmin`, `docente123`) inicien sesión sin problemas
- [x] Documentar cambios y actualizar documentación del proyecto

---

*Última actualización: 23 de Septiembre de 2026*

