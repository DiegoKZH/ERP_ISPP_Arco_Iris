# Plan de implementación: [Nombre de la funcionalidad]

> **Spec**: [enlace a la spec]
> **Fecha**: [fecha]
> **Autor**: [persona o agente]

---

## 1. Análisis de la implementación actual

¿Qué existe actualmente en el proyecto relacionado con esta funcionalidad?

- Modelos existentes relevantes: ...
- Endpoints existentes relevantes: ...
- Componentes existentes relevantes: ...
- Tablas existentes relevantes: ...

¿Qué se puede reutilizar? ¿Qué necesita modificarse? ¿Qué debe crearse desde cero?

## 2. Arquitectura afectada

¿Qué capas del sistema serán modificadas?

- [ ] Migraciones / Base de datos
- [ ] Modelos
- [ ] Controladores
- [ ] Form Requests
- [ ] API Resources
- [ ] Services
- [ ] Policies
- [ ] Middleware
- [ ] Rutas API
- [ ] Componentes React
- [ ] Páginas
- [ ] Hooks
- [ ] Servicios frontend
- [ ] Tests

## 3. Base de datos

### Tablas nuevas

| Tabla | Descripción | Campos principales |
|-------|-------------|-------------------|
| ... | ... | ... |

### Tablas modificadas

| Tabla | Modificación |
|-------|-------------|
| ... | ... |

### Relaciones

Describir las relaciones entre tablas nuevas y existentes.

## 4. Backend

### Modelos

| Modelo | Tabla | Relaciones principales |
|--------|-------|----------------------|
| ... | ... | ... |

### Endpoints

| Método | Ruta | Controlador@Método | Descripción |
|--------|------|-------------------|-------------|
| ... | ... | ... | ... |

### Form Requests

| Request | Campos validados |
|---------|-----------------|
| ... | ... |

### Services (si aplica)

| Service | Responsabilidad |
|---------|----------------|
| ... | ... |

## 5. Frontend

### Páginas

| Página | Ruta | Descripción |
|--------|------|-------------|
| ... | ... | ... |

### Componentes

| Componente | Tipo | Descripción |
|-----------|------|-------------|
| ... | Reutilizable / Específico | ... |

## 6. Seguridad

- Autenticación requerida: sí / no.
- Permisos necesarios: ...
- Datos sensibles: ...
- Validaciones de seguridad adicionales: ...

## 7. Testing

### Tests de backend

| Test | Tipo | Qué verifica |
|------|------|-------------|
| ... | Feature / Unit | ... |

### Tests de frontend (si aplica)

| Test | Qué verifica |
|------|-------------|
| ... | ... |

## 8. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| ... | Alta/Media/Baja | Alto/Medio/Bajo | ... |

## 9. Compatibilidad

- ¿Afecta funcionalidades existentes? ...
- ¿Requiere migración de datos? ...
- ¿Es retrocompatible? ...

## 10. Estrategia de implementación

Orden recomendado de implementación:

1. Migraciones y modelos.
2. Lógica de negocio (services si aplica).
3. Endpoints API (controladores, requests, resources).
4. Tests de backend.
5. Componentes y páginas frontend.
6. Integración y verificación.

## 11. Documentación

Documentos que deben actualizarse al completar:

- [ ] `docs/modules/[módulo].md`
- [ ] `docs/03-domain-model.md` (si hay entidades nuevas)
- [ ] `docs/specs/README.md` (marcar como completada)
- [ ] Otros: ...

---

*Última actualización: [fecha]*
