# TASKS: Consolidación del Núcleo de Usuarios, Roles, Permisos y Autorización

> **Módulo**: Núcleo Transversal
> **Referencia**: `docs/specs/consolidacion-usuarios-roles-permisos.plan.md`

## Fase 1: Autorización y Bypass de Superadmin
- [ ] 1.1 Modificar `App\Providers\AppServiceProvider` (o similar en Laravel 13) para agregar el `Gate::before()` interceptor para el rol `superadmin`.

## Fase 2: Control de Login (Usuarios Inactivos)
- [ ] 2.1 Modificar `AuthController` (o donde se procese el login) para asegurar que un usuario con `is_active = false` reciba un error `403 Forbidden` y no se genere su token.

## Fase 3: Semilla de Datos (Seeders)
- [ ] 3.1 Crear/Actualizar `PermissionSeeder` con los permisos granulares: `usuarios.usuarios.ver`, `usuarios.usuarios.crear`, `usuarios.usuarios.editar`, `usuarios.usuarios.deshabilitar`, `usuarios.usuarios.reactivar`, `usuarios.roles.asignar`.
- [ ] 3.2 Actualizar `DatabaseSeeder` para asegurar que el `PermissionSeeder` se ejecute correctamente y asigne los permisos al rol `admin`.

## Fase 4: Restricciones de Negocio en Controladores
- [ ] 4.1 Modificar `UserController@store` para impedir que alguien sin rol `superadmin` asigne el rol `superadmin`.
- [ ] 4.2 Modificar `UserController@update` para proteger la edición de un `superadmin` por parte de un usuario que no lo sea.
- [ ] 4.3 Modificar `UserController@toggleStatus` (o equivalente) para evitar la desactivación lógica de un `superadmin`.

## Fase 5: Protección de Rutas API
- [ ] 5.1 En `routes/api.php`, agregar el middleware de verificación de permisos (`permission:...`) a cada ruta individual de `UserController`.

## Fase 6: Pruebas y Documentación
- [ ] 6.1 Escribir o actualizar tests Feature para verificar la denegación de login de inactivos.
- [ ] 6.2 Escribir o actualizar tests para la inmutabilidad de superadmins.
- [ ] 6.3 Ejecutar `composer test` y verificar 100% de éxito.
