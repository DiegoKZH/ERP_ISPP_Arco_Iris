# Módulo 05 — Cuentas por Cobrar

> **Área**: Financiera
> **Estado**: Pendiente de implementación
> **Implementación actual**: Ninguna

---

## Propósito

Gestionar los ingresos de la institución: conceptos de cobro, deudas de estudiantes, registro de pagos, cronogramas y recibos.

## Alcance conocido

### Procesos principales

- Definición de conceptos de cobro (matrícula, pensiones, certificados, constancias).
- Generación de deudas por estudiante.
- Registro de pagos.
- Generación de cronogramas de pagos.
- Emisión de recibos/comprobantes.
- Seguimiento de morosidad.

### Funcionalidades conocidas

- CRUD de conceptos de cobro.
- Generación masiva de deudas (por periodo, por programa).
- Registro de pagos (manual, eventual integración con pasarela).
- Consulta de estado de cuenta por estudiante.
- Reportes de ingresos y morosidad.
- Emisión de recibos.

## Actores

| Actor | Rol en este módulo |
|-------|-------------------|
| Tesorería | Gestión de cobros y pagos |
| Estudiante | Consulta de deuda, realización de pagos |
| Contabilidad | Registro contable de ingresos |

## Relaciones con otros módulos

| Módulo | Relación |
|--------|----------|
| Académico | La matrícula genera deuda |
| Admisión | La inscripción genera costo |
| Contabilidad | Los pagos generan asientos contables |
| Planificación y Presupuesto | Los ingresos alimentan el presupuesto |
| FUT Electrónico | Algunos trámites tienen costo |

## Aspectos pendientes de definición

- Conceptos de cobro específicos y sus montos.
- Política de descuentos y becas.
- Proceso de cobranza y morosidad.
- Reglas de bloqueo por deuda (¿bloqueo de matrícula, notas, certificados?).
- Integración con pasarelas de pago.
- Formato de recibos y comprobantes.

---

*Última actualización: Septiembre 2026*
