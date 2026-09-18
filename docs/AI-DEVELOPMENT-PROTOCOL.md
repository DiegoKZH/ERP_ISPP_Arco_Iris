# Protocolo de Desarrollo con IA

> Este documento define cómo deben trabajar los agentes de inteligencia artificial en este proyecto.
> Es obligatorio para cualquier agente que modifique código o documentación.

---

## 1. Principio rector

> **"¿Cómo resuelve actualmente el proyecto este problema?"**

Antes de crear una solución nueva, el agente debe asumir que el proyecto ya tiene (o está preparado para) una forma de resolver el problema. La primera acción siempre es **inspeccionar**, no inventar.

---

## 2. Protocolo de trabajo

Antes de modificar código, el agente debe seguir estos pasos en orden:

### Paso 1: Leer documentación

1. Leer `AGENTS.md` (punto de entrada).
2. Leer `docs/00-constitution.md` (principios).
3. Leer `docs/02-architecture.md` (arquitectura).
4. Leer la documentación específica según la tarea:
   - Si toca API → `docs/04-api-rules.md`
   - Si toca frontend → `docs/05-frontend-rules.md`
   - Si toca auth/permisos → `docs/06-security.md`
   - Si toca tests → `docs/07-testing.md`
   - Si es funcionalidad nueva → `docs/08-sdd-workflow.md`
   - Si toca un módulo → `docs/modules/<módulo>.md`

### Paso 2: Inspeccionar la implementación existente

- Revisar los archivos relacionados con la tarea.
- Entender las convenciones actuales del código.
- Identificar patrones existentes que deben seguirse.
- Verificar si ya existe una solución similar.

### Paso 3: Verificar especificaciones

- ¿Existe una especificación en `docs/specs/` para esta funcionalidad?
- Si existe, seguirla. Si no existe y la funcionalidad es compleja, crearla primero.

### Paso 4: Evaluar dependencias e impactos

- ¿El cambio afecta a otros módulos?
- ¿Modifica tablas existentes?
- ¿Cambia el contrato de una API?
- ¿Afecta la autenticación o autorización?

### Paso 5: Implementar

- Implementar solo el alcance autorizado.
- Seguir las convenciones existentes.
- No introducir dependencias nuevas sin justificación.
- No reorganizar archivos sin necesidad.

### Paso 6: Probar

- Escribir tests para la funcionalidad nueva o modificada.
- Ejecutar `composer test` para verificar que nada se rompió.
- Verificar manualmente si aplica.

### Paso 7: Verificar

- ¿El cambio cumple con lo solicitado?
- ¿Los tests pasan?
- ¿Se respetaron las convenciones?
- ¿Se documentó lo necesario?

### Paso 8: Documentar

- Actualizar documentación afectada si corresponde.
- No crear documentación innecesaria.

---

## 3. Lo que el agente NO debe hacer

### Nunca

- **Inventar reglas de negocio** no especificadas.
- **Asumir** que algo no existe sin inspeccionarlo.
- **Rediseñar** la arquitectura del proyecto.
- **Instalar dependencias** sin justificación explícita.
- **Ejecutar migraciones** en producción.
- **Eliminar código** sin verificar que no esté en uso.
- **Cambiar convenciones** establecidas unilateralmente.
- **Resolver conflictos** arquitectónicos silenciosamente.

### Sin aprobación previa

- Refactorizaciones que afecten múltiples archivos.
- Cambios en el esquema de base de datos.
- Modificaciones a la autenticación o autorización.
- Cambios en la estructura de carpetas del proyecto.
- Actualización de dependencias mayores.

---

## 4. Reglas para cambios específicos

### Antes de crear un archivo nuevo

1. Verificar que no existe un archivo con propósito similar.
2. Ubicarlo según las convenciones de `docs/02-architecture.md`.
3. Seguir las convenciones de nombrado del proyecto.

### Antes de crear un componente React

1. Verificar si existe un componente reutilizable.
2. ¿Realmente será reutilizado, o es específico de una página?
3. Ubicar en `components/` (reutilizable) o directamente en la página.

### Antes de crear un endpoint API

1. Revisar si existe un endpoint similar.
2. Seguir las convenciones de `docs/04-api-rules.md`.
3. Incluir validación (Form Request), no validar en el controlador.
4. Escribir test Feature para el endpoint.

### Antes de crear un Service

1. ¿La lógica es realmente lo suficientemente compleja para justificar un Service?
2. ¿No puede resolverse en el Controller para un caso simple?
3. ¿Existe un Service similar que pueda extenderse?

### Antes de instalar una dependencia

1. ¿El proyecto ya tiene una solución para este problema?
2. ¿Se puede resolver con código simple sin dependencia?
3. ¿La dependencia es mantenida activamente?
4. ¿Es compatible con las versiones del proyecto?

### Antes de crear una migración

1. Verificar que no exista una migración pendiente que haga algo similar.
2. Incluir método `down()` para rollback.
3. Documentar el cambio en el modelo de dominio si aplica.

---

## 5. Manejo de incertidumbre

Cuando el agente encuentre ambigüedad:

| Situación | Acción |
|-----------|--------|
| Regla de negocio no definida | Marcar como "Pendiente de definición", no inventar |
| Dos formas de hacer algo | Seguir la convención existente en el proyecto |
| Convención no establecida | Proponer una, documentar por qué, esperar aprobación |
| Código existente parece incorrecto | Documentar el hallazgo, no corregir sin confirmación |
| Dependencia necesaria | Justificar, proponer alternativas |

---

## 6. Formato de comunicación

Cuando el agente reporte su trabajo:

- **Qué se hizo**: Cambios realizados (archivos creados/modificados).
- **Por qué**: Justificación o referencia a spec/tarea.
- **Qué se probó**: Tests ejecutados y resultado.
- **Qué falta**: Tareas pendientes o decisiones requeridas.
- **Qué se asumió**: Cualquier suposición hecha (para validación).

---

## 7. Checklist rápido

Antes de finalizar cualquier tarea, verificar:

- [ ] ¿Leí la documentación relevante?
- [ ] ¿Inspeccioné el código existente?
- [ ] ¿Seguí las convenciones del proyecto?
- [ ] ¿Escribí tests?
- [ ] ¿Los tests pasan (`composer test`)?
- [ ] ¿No introduje dependencias innecesarias?
- [ ] ¿No inventé reglas de negocio?
- [ ] ¿Documenté lo necesario?
- [ ] ¿El cambio es el mínimo necesario para cumplir la tarea?

---

*Última actualización: Septiembre 2026*
