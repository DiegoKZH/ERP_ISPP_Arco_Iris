# Módulo 07 — Cuentas por Pagar

> **Área**: Financiera
> **Estado**: Pendiente de implementación
> **Implementación actual**: Ninguna

---

## Propósito

Gestionar las obligaciones de pago de la institución: proveedores, órdenes de pago, seguimiento de deudas y desembolsos.

## Alcance conocido

### Procesos principales

- Registro de proveedores.
- Registro de obligaciones de pago.
- Autorización y ejecución de pagos.
- Seguimiento de deudas pendientes.
- Reportes de egresos.

### Funcionalidades conocidas

- CRUD de proveedores.
- Registro de cuentas por pagar (origen, monto, vencimiento).
- Generación de órdenes de pago.
- Aprobación de pagos.
- Registro de desembolsos.
- Estado de cuenta por proveedor.

## Actores

| Actor | Rol en este módulo |
|-------|-------------------|
| Tesorería | Ejecución de pagos |
| Contabilidad | Registro contable de egresos |
| Logística | Genera obligaciones de pago por compras |
| Director General | Aprobación de pagos mayores |

## Relaciones con otros módulos

| Módulo | Relación |
|--------|----------|
| Logística | Las órdenes de compra generan cuentas por pagar |
| Recursos Humanos | Las planillas generan obligaciones de pago |
| Contabilidad | Los pagos generan asientos contables |
| Planificación y Presupuesto | Los pagos ejecutan presupuesto |

## Aspectos pendientes de definición

- Proceso de aprobación de pagos (niveles, montos).
- Medios de pago (cheque, transferencia, efectivo).
- Integración bancaria.
- Retenciones tributarias.
- Formato de comprobantes de egreso.

---

*Última actualización: Septiembre 2026*
