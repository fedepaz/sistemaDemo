fix(users): refine activation permissions and button visibility

- GET /to-activate endpoint uses action:read instead of action:create
- Gate "Activar usuarios" button behind canCreate permission
- Only show pending users table when canCreate is true
- Remove canUpdate guard from ActivateUserButton in SlideOver
- RestorePasswordButton still requires canUpdate
