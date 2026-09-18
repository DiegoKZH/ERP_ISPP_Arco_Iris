# Módulo 11 — Almacén

> **Área**: Administrativa
> **Estado**: Pendiente de implementación
> **Implementación actual**: Ninguna

---

## Propósito

Gestionar el almacenamiento de bienes de la institución: ingresos, salidas, control de existencias y reportes de inventario.

## Alcance conocido

### Procesos principales

- Recepción e ingreso de bienes al almacén.
- Despacho/salida de bienes.
- Control de existencias (kardex).
- Clasificación de productos por categoría.
- Reportes de inventario.

### Funcionalidades conocidas

- CRUD de productos/bienes (descripción, unidad de medida, categoría).
- Registro de ingresos (con referencia a orden de compra).
- Registro de salidas (con referencia a solicitud del área).
- Kardex por producto (entradas, salidas, saldo).
- Inventario general.
- Alertas de stock mínimo.

## Actores

| Actor | Rol en este módulo |
|-------|-------------------|
| Almacenero | Gestión del almacén |
| Áreas solicitantes | Solicitan bienes |
| Logística | Envía bienes adquiridos |

## Relaciones con otros módulos

| Módulo | Relación |
|--------|----------|
| Logística | Los bienes adquiridos ingresan a almacén |
| Contabilidad | Valorización de existencias |
| Patrimonio | Los activos fijos pueden pasar de almacén a patrimonio |

## Aspectos pendientes de definición

- Método de valorización (PEPS, promedio ponderado).
- Proceso de toma de inventario físico.
- Categorías de productos.
- Unidades de medida estándar.
- Ubicaciones dentro del almacén.
- Proceso de baja de bienes deteriorados.

---

*Última actualización: Septiembre 2026*
