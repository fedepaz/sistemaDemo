# Design: Self-Registration Flow

**Date:** 2026-08-10
**Status:** Approved
**Scope:** Frontend-only (register page redesign + stale code cleanup)

## Context

The old flow had admins creating users from the UsersDataTable slide-over. Commit `0108c6c` removed that inline creation, leaving the `/register` page as the only registration path. However, the register form still uses admin-facing language ("Crear nuevo usuario"), redirects to `/` after submit (which is broken for non-signed-in users), and has stale code references.

The new flow: the boss tells employees to visit `/auth/register`, they create their own account, see a success message with instructions, then go to login.

## Goals

1. Reframe the register form as employee-facing ("Registrar cuenta")
2. Show a success card after registration with clear next-step instructions
3. Remove all stale code from the old admin-create-user flow
4. Fix the broken error handling (empty `catch {}` + redirect on failure)

## Non-Goals

- No backend changes (endpoint already works correctly)
- No permissions auto-grant (boss manually assigns permissions)
- No email verification (out of scope)

## Design

### Part A: Stale Code Cleanup

| File | Issue | Fix |
|------|-------|-----|
| `components.json:343` | Orphaned registry entry for deleted `UserCreateForm` | Remove the entry |
| `user-data-table.tsx:110,113,117,120,121,133` | Dead ternary branches for create mode (never reached) | Simplify to direct edit-only values |
| `register-form.tsx:38-43` | Empty `catch {}` swallows errors, redirects to `/` even on failure | Handle success/error separately |

### Part B: Register Page Redesign

**Two states in `RegisterForm`: form and success.**

#### Form State

- Title: **"Registrar cuenta"**
- Description: "Completa los campos para crear tu cuenta. Se generará una contraseña por defecto que deberás cambiar en tu primer inicio de sesión."
- Fields: username, firstName, lastName, email (optional) — same Zod schema
- Submit button: "Crear cuenta"
- On error: toast notification via `sonner`, stay on form
- On success: toggle to success state

#### Success State

Same card dimensions, form replaced by:
- Icon: `CheckCircle2` from lucide-react (primary color tint)
- Title: **"Cuenta creada correctamente"**
- Message (3 lines):
  1. "Ingresa a **Iniciar sesión** con tu usuario y la contraseña por defecto: **123456**"
  2. "En tu primer inicio de sesión se te pedirá cambiar la contraseña."
  3. "Una vez finalizado, **avísale a tu encargado** para que te asigne los permisos necesarios."
- Button: **"Ir a login"** → `router.push("/auth/login")`

### Part C: UX/UI Alignment

Verified against `ui-ux-pro-max` guidelines:

- Auth card: `rounded-xl border bg-card p-4 sm:p-6 shadow-sm` (matches login)
- Typography: `font-serif` body, `font-sans uppercase tracking-widest` labels
- Button: `bg-primary` with `Loader2` spinner during pending state
- Focus: inputs have `autoFocus` and `tabIndex={0}`
- Loading: button disabled + spinner during `isPending`
- Error: toast via `sonner` (existing pattern)
- Responsive: mobile-first with `md:` breakpoints
- No layout shift between states

## User Flow

```
Employee visits /auth/register (URL given by boss)
  → Fills form (username, name, email)
  → Submits
  → Success card appears:
    "Cuenta creada correctamente"
    "Ingresa a Iniciar sesión con tu usuario y la contraseña por defecto: 123456"
    "En tu primer inicio de sesión se te pedirá cambiar la contraseña."
    "Una vez finalizado, avísale a tu encargado para que te asigne los permisos necesarios."
  → Clicks "Ir a login"
  → Goes to /auth/login
  → Logs in with default password
  → Forced to change password (existing flow)
  → Boss assigns permissions via permissions panel
```

## Files to Modify

1. `apps/frontend/src/features/auth/components/register-form.tsx` — redesign with two states
2. `apps/frontend/src/features/users/components/user-data-table.tsx` — remove stale create-mode ternaries
3. `apps/frontend/components.json` — remove orphaned `UserCreateForm` registry entry
