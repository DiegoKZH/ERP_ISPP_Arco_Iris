# Constitución del Proyecto — Principios Fundamentales

> Estos principios rigen todas las decisiones de diseño, desarrollo y mantenimiento del ERP Instituto.
> Son obligatorios para desarrolladores humanos y agentes de IA.

---

## 1. Especificación antes de implementación

Las funcionalidades complejas deben especificarse antes de codificarse. Una especificación define qué debe hacer el sistema, para quién, bajo qué reglas y con qué límites. El código es la consecuencia de una especificación, no al revés.

## 2. Respeto por la arquitectura existente

La arquitectura actual es el punto de partida. No se rediseña el proyecto para adoptar un patrón diferente sin justificación concreta. Antes de proponer un cambio arquitectónico, se debe documentar: qué problema resuelve, qué alternativas se consideraron y cuál es el impacto.

## 3. Evolución incremental

El sistema crece de forma gradual. Cada cambio debe ser pequeño, verificable y reversible cuando sea posible. No se implementan abstracciones prematuras ni se anticipan necesidades hipotéticas.

## 4. Negocio antes que tecnología

Las decisiones técnicas están al servicio de las necesidades institucionales. El ERP existe para resolver problemas reales de la institución educativa. La tecnología es el medio, no el fin.

## 5. Seguridad desde el diseño

La seguridad no es una capa que se añade al final. Cada funcionalidad debe considerar desde el inicio: autenticación, autorización, validación de datos, protección de información sensible y auditoría de acciones críticas.

## 6. Integridad de datos

Los datos académicos, financieros y administrativos son el activo más importante del sistema. Toda operación que modifique datos críticos debe usar transacciones, validaciones y, cuando corresponda, registros de auditoría.

## 7. No sobreingeniería

No se crean abstracciones, servicios, interfaces o patrones arquitectónicos a menos que exista un problema concreto que los justifique. La simplicidad es preferible a la elegancia teórica.

## 8. Cambios verificables

Todo cambio debe poder verificarse. Si no se puede probar que un cambio funciona correctamente, el cambio no está completo. Los tests automatizados son la forma preferida de verificación.

## 9. Compatibilidad

Los cambios no deben romper funcionalidades existentes sin justificación y sin un plan de migración. La retrocompatibilidad se respeta por defecto.

## 10. Evidencia antes de afirmar

No se afirma que algo funciona, está roto o es necesario sin evidencia. Los diagnósticos se basan en logs, tests, inspección de código o reproducción del problema, no en suposiciones.

## 11. Documentación como parte del desarrollo

La documentación no es una tarea separada que se hace "después". Forma parte del ciclo de desarrollo. Una funcionalidad sin documentación no está completa.

## 12. No invención de reglas de negocio

Las reglas de negocio las define la institución, no el desarrollador ni el agente de IA. Cuando una regla no está definida, se marca como pendiente. No se convierte una suposición en una regla oficial.

---

## Aplicación de estos principios

Estos principios se aplican en este orden de prioridad cuando entren en conflicto:

1. **Integridad de datos** y **Seguridad** tienen prioridad sobre velocidad de desarrollo.
2. **Negocio antes que tecnología** tiene prioridad sobre preferencias técnicas.
3. **Especificación antes de implementación** tiene prioridad sobre urgencia percibida.
4. **No invención** tiene prioridad sobre completitud aparente.

---

*Última actualización: Septiembre 2026*
