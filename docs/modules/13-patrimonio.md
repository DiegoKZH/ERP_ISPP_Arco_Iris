# Módulo 13 — Patrimonio

> **Área**: Administrativa
> **Estado**: Pendiente de implementación
> **Implementación actual**: Ninguna

---

## Propósito

Gestionar los activos fijos de la institución: registro de bienes patrimoniales, inventario, asignaciones, depreciación y bajas.

## Alcance conocido

### Procesos principales

- Registro de bienes patrimoniales (muebles, equipos, inmuebles).
- Codificación y etiquetado de bienes.
- Asignación de bienes a áreas y responsables.
- Control de inventario patrimonial.
- Cálculo de depreciación.
- Baja de bienes.
- Transferencias entre áreas.

### Funcionalidades conocidas

- CRUD de bienes patrimoniales.
- Asignación de responsable por bien.
- Inventario por ubicación/área.
- Registro de estado del bien (bueno, regular, malo, de baja).
- Historial de movimientos del bien.
- Cálculo de depreciación acumulada.
- Reportes de inventario patrimonial.

## Actores

| Actor | Rol en este módulo |
|-------|-------------------|
| Patrimonio / Control Patrimonial | Gestión completa |
| Áreas / responsables | Custodia de bienes asignados |
| Contabilidad | Registro contable y depreciación |
| Director General | Aprobación de bajas |

## Relaciones con otros módulos

| Módulo | Relación |
|--------|----------|
| Logística | Los activos fijos adquiridos se registran como patrimonio |
| Almacén | Los bienes pueden transitar de almacén a patrimonio |
| Contabilidad | Depreciación y valor en libros |

## Aspectos pendientes de definición

- Clasificación de bienes patrimoniales.
- Método de codificación.
- Tasas de depreciación por tipo de bien.
- Proceso de baja (acta, resolución, destino del bien).
- Proceso de inventario físico.
- Normativa de control patrimonial aplicable.

---

*Última actualización: Septiembre 2026*
