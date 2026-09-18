# Flujo Spec-Driven Development (SDD)

> Este documento establece el flujo de trabajo para desarrollar funcionalidades del ERP Instituto.
> El principio central es: **especificar antes de implementar**.

---

## 1. ¿Qué es SDD?

Spec-Driven Development es un enfoque donde cada funcionalidad significativa se define formalmente antes de codificarse. La especificación es un contrato que describe qué debe hacer el sistema, no cómo debe implementarse.

### ¿Por qué SDD para este proyecto?

- Un ERP con 14 módulos requiere claridad sobre qué hace cada parte.
- Evita implementar funcionalidades basadas en suposiciones.
- Permite que desarrolladores y agentes de IA trabajen con un entendimiento compartido.
- Facilita la verificación: se sabe cuándo una funcionalidad está completa.
- Crea documentación útil como efecto secundario.

---

## 2. Flujo completo

```
Necesidad
    │
    │  ¿Es una funcionalidad compleja?
    │
    ├── NO → Implementar directamente (con tests)
    │
    └── SÍ → Seguir el flujo SDD:
            │
            ▼
        ┌─────────────────┐
        │ ESPECIFICACIÓN   │  docs/specs/<funcionalidad>.md
        │ (SPEC)           │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ REVISIÓN         │  ¿La spec es correcta y completa?
        │                  │  ¿Hay decisiones pendientes?
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ PLANIFICACIÓN    │  <funcionalidad>.plan.md
        │ (PLAN)           │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ TAREAS           │  <funcionalidad>.tasks.md
        │ (TASKS)          │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ IMPLEMENTACIÓN   │  Código según plan y tareas
        │                  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ TESTING          │  Tests automatizados
        │                  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ VERIFICACIÓN     │  ¿Cumple los criterios de aceptación?
        │                  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ DOCUMENTACIÓN    │  Actualizar docs afectados
        │                  │
        └─────────────────┘
```

---

## 3. ¿Cuándo usar el flujo SDD completo?

### Usar SDD cuando:

- La funcionalidad involucra más de un módulo.
- Requiere nuevas tablas o modificaciones significativas al esquema.
- Implica lógica de negocio compleja (cálculos, estados, validaciones).
- Afecta la seguridad o el acceso a datos.
- El alcance no está completamente claro.

### No necesitas SDD completo cuando:

- Es una corrección de bug simple.
- Es un ajuste de estilo o UI menor.
- Es un refactor interno sin cambio de comportamiento.
- Es una tarea técnica sin impacto funcional.

---

## 4. Etapas del flujo

### 4.1 Especificación (SPEC)

**Archivo**: `docs/specs/<funcionalidad>.md`

**Propósito**: Definir *qué* debe hacer la funcionalidad.

**Contenido** (usar plantilla `docs/templates/SPEC.md`):

- Nombre y contexto.
- Objetivo.
- Alcance y fuera de alcance.
- Actores involucrados.
- Comportamiento esperado (flujos principales y alternativos).
- Reglas de negocio conocidas.
- Validaciones.
- Estados (si aplica).
- Permisos.
- Manejo de errores.
- Interacción con otros módulos.
- Criterios de aceptación.
- Decisiones pendientes.

**Reglas**:

- No inventar reglas de negocio que no estén confirmadas.
- Marcar explícitamente lo que es **Confirmado**, **Propuesto** o **Pendiente**.
- No incluir detalles de implementación (eso va en el Plan).

### 4.2 Revisión

**Propósito**: Validar que la especificación es correcta y completa.

**Preguntas clave**:

- ¿Están todos los flujos descritos?
- ¿Hay reglas de negocio que faltan?
- ¿Hay ambigüedades?
- ¿Hay decisiones que el equipo debe tomar antes de implementar?
- ¿Se identificaron las dependencias con otros módulos?

### 4.3 Planificación (PLAN)

**Archivo**: `docs/specs/<funcionalidad>.plan.md`

**Propósito**: Definir *cómo* se implementará la funcionalidad.

**Contenido** (usar plantilla `docs/templates/PLAN.md`):

- Análisis de la implementación actual (qué existe ya).
- Componentes afectados (backend, frontend, BD).
- Diseño técnico (modelos, endpoints, componentes).
- Estrategia de migración de datos (si aplica).
- Seguridad.
- Testing.
- Riesgos.
- Estrategia de implementación (orden de tareas).

**Regla fundamental**: El plan debe partir de la **arquitectura existente**, no de una ideal.

### 4.4 Tareas (TASKS)

**Archivo**: `docs/specs/<funcionalidad>.tasks.md`

**Propósito**: Dividir el plan en unidades de trabajo concretas y verificables.

**Cada tarea debe**:

- Ser pequeña (completable en una sesión de trabajo).
- Ser verificable (se puede confirmar que está completa).
- Respetar dependencias (no empezar la tarea B si depende de A).
- Incluir testing.

### 4.5 Implementación

- Seguir las tareas definidas.
- Respetar la arquitectura existente (ver `docs/02-architecture.md`).
- Respetar las convenciones de API y frontend.
- Escribir tests según se implementa (no después).

### 4.6 Testing

- Ejecutar `composer test` para verificar que no se rompió nada.
- Los tests deben cubrir los criterios de aceptación de la SPEC.
- Verificar validaciones, permisos y flujos alternativos.

### 4.7 Verificación

Recorrer los criterios de aceptación de la SPEC y confirmar que todos se cumplen.

### 4.8 Actualización documental

- Actualizar `docs/02-architecture.md` si hubo cambios arquitectónicos.
- Actualizar el documento del módulo afectado en `docs/modules/`.
- Actualizar `docs/03-domain-model.md` si se crearon nuevas entidades.
- Marcar la SPEC como implementada.

---

## 5. Estructura de archivos de specs

```
docs/specs/
├── README.md                          ← Índice de especificaciones
├── matricula-online.md                ← SPEC
├── matricula-online.plan.md           ← PLAN
├── matricula-online.tasks.md          ← TASKS
├── registro-pagos.md
├── registro-pagos.plan.md
├── registro-pagos.tasks.md
└── ...
```

---

## 6. Estados de una especificación

| Estado | Significado |
|--------|-------------|
| `borrador` | En proceso de escritura |
| `en revisión` | Esperando validación |
| `aprobada` | Lista para planificar e implementar |
| `en desarrollo` | Se está implementando |
| `completada` | Implementada y verificada |
| `suspendida` | Pospuesta indefinidamente |

---

*Última actualización: Septiembre 2026*
