feat: add restore password endpoint and UI button

Allow authorized managers (users.update.ALL permission) to reset a
user's password to the default via PATCH /auth/restore. Adds a
"Restaurar contraseña" button in the admin user-edit slide-over,
visible only when editing another user.

- shared: RestorePasswordSchema/RestorePasswordDto in auth.schema.ts
- backend: restorePassword() in AuthService + PATCH /auth/restore endpoint
- frontend: useRestorePassword hook, userService.restorePassword, restore button
