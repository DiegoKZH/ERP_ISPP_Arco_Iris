# Tareas: [Nombre de la funcionalidad]

> **Spec**: [enlace a la spec]
> **Plan**: [enlace al plan]
> **Fecha**: [fecha]

---

## Instrucciones

- Completar las tareas en orden (respetar dependencias).
- Marcar como `[x]` al completar cada tarea.
- Cada tarea debe ser verificable independientemente.
- Si una tarea genera un problema inesperado, documentarlo antes de continuar.

---

## Base de datos

- [ ] Crear migración para tabla `...`
- [ ] Crear migración para tabla `...`
- [ ] Verificar que las migraciones corren sin error (`php artisan migrate:fresh`)

## Modelos

- [ ] Crear modelo `...` con relaciones, fillable y casts
- [ ] Crear factory para `...`
- [ ] Crear seeder para datos iniciales de `...`

## Backend — Lógica

- [ ] Crear Form Request `...` con validaciones
- [ ] Crear API Resource `...` para transformar respuestas
- [ ] Crear Service `...` (si aplica lógica compleja)
- [ ] Crear Policy `...` (si aplica control de acceso)

## Backend — Endpoints

- [ ] Crear controlador `...Controller`
- [ ] Implementar `index` — listar recursos
- [ ] Implementar `store` — crear recurso
- [ ] Implementar `show` — ver detalle
- [ ] Implementar `update` — actualizar recurso
- [ ] Implementar `destroy` — eliminar recurso
- [ ] Registrar rutas en `api.php`

## Tests — Backend

- [ ] Test: crear recurso con datos válidos retorna 201
- [ ] Test: crear recurso sin datos obligatorios retorna 422
- [ ] Test: usuario no autenticado recibe 401
- [ ] Test: usuario sin permiso recibe 403
- [ ] Test: listar recursos retorna colección paginada
- [ ] Test: ver detalle de recurso existente retorna 200
- [ ] Test: ver detalle de recurso inexistente retorna 404
- [ ] Ejecutar `composer test` — todos los tests pasan

## Frontend

- [ ] Crear página de listado
- [ ] Crear página de creación (formulario)
- [ ] Crear página de detalle
- [ ] Crear página de edición
- [ ] Crear servicio API para `...`
- [ ] Conectar formularios con validación del servidor

## Integración

- [ ] Verificar flujo completo: crear → listar → ver → editar → eliminar
- [ ] Verificar manejo de errores en UI
- [ ] Verificar permisos en UI y API

## Documentación

- [ ] Actualizar `docs/modules/[módulo].md`
- [ ] Actualizar `docs/03-domain-model.md` si hay entidades nuevas
- [ ] Actualizar `docs/specs/README.md` — marcar spec como completada

---

*Última actualización: [fecha]*
