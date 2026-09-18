# Especificaciones (Specs)

> Directorio de especificaciones funcionales del ERP Instituto.
> Cada especificación define una funcionalidad antes de su implementación.

---

## Flujo de trabajo

Ver [docs/08-sdd-workflow.md](../08-sdd-workflow.md) para el flujo completo de Spec-Driven Development.

## Estructura de archivos

Cada funcionalidad genera hasta tres archivos:

```
docs/specs/
├── <funcionalidad>.md           ← Especificación (qué hacer)
├── <funcionalidad>.plan.md      ← Plan de implementación (cómo hacerlo)
└── <funcionalidad>.tasks.md     ← Lista de tareas (pasos concretos)
```

## Nombrado

- Usar **kebab-case** en español: `matricula-online.md`, `registro-pagos.md`.
- El nombre debe ser descriptivo y conciso.

## Plantillas

- Especificación: [docs/templates/SPEC.md](../templates/SPEC.md)
- Plan: [docs/templates/PLAN.md](../templates/PLAN.md)
- Tareas: [docs/templates/TASKS.md](../templates/TASKS.md)

## Índice de especificaciones

| Especificación | Módulo | Estado | Última actualización |
|---------------|--------|--------|----------------------|
| [Persistencia PostgreSQL + Núcleo de Identidad](persistencia-identidad-roles-permisos.md) | Núcleo Transversal | `completada` | Septiembre 2026 |

> Las especificaciones se crearán a medida que se desarrollen funcionalidades, siguiendo el flujo SDD.

---

*Última actualización: Septiembre 2026*
