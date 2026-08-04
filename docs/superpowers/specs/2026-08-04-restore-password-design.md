# Restore Password Feature

**Date:** 2026-08-04
**Status:** Approved
**Author:** opencode

## Problem

When a user forgets their password, there's no way for an authorized manager to reset it. The user has to contact the developer directly, creating unnecessary friction.

## Solution

Add a "Restore Password" button to the admin user-edit slide-over that resets a user's password to the default (same as registration). The user can then log in with the default password and change it on first access.

## Scope

- Backend: new `PATCH /auth/restore` endpoint
- Frontend: restore button in admin user-edit slide-over
- Shared: new `RestorePasswordSchema` / `RestorePasswordDto`

## Design

### Backend

#### New endpoint: `PATCH /auth/restore`

**Controller** (`apps/backend/src/modules/auth/auth.controller.ts`):

```typescript
@Patch('restore')
@HttpCode(HttpStatus.OK)
@RequirePermission({ tableName: 'users', action: 'update', scope: 'ALL' })
async restorePassword(
  @Body(new ZodValidationPipe(RestorePasswordSchema)) dto: RestorePasswordDto,
): Promise<{ success: boolean; message: string }> {
  return this.authService.restorePassword(dto.userId);
}
```

**Service** (`apps/backend/src/modules/auth/auth.service.ts`):

```typescript
async restorePassword(userId: string): Promise<{ success: boolean; message: string }> {
  const user = await this.userAuthRepo.findById(userId);
  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  const defaultPassword = this.config.get('config.defaultPassword') || '123456';
  const passwordHash = await bcrypt.hash(defaultPassword, this.BCRYPT_ROUNDS);
  await this.userAuthRepo.updatePassword(userId, passwordHash);

  return {
    success: true,
    message: 'Contraseña restaurada correctamente',
  };
}
```

**Repository:** `UserAuthRepository.updatePassword()` already exists at `apps/backend/src/modules/auth/repositories/userAuth.repository.ts:105-120`. No changes needed.

**Shared schema** (`packages/shared/src/schemas/auth.schema.ts`):

```typescript
export const RestorePasswordSchema = z.object({
  userId: z.string().min(1, { message: 'ID de usuario es obligatorio' }),
});

export type RestorePasswordDto = z.infer<typeof RestorePasswordSchema>;
```

### Frontend

#### New hook: `useRestorePassword`

**File:** `apps/frontend/src/features/users/hooks/usersHooks.ts`

```typescript
export const useRestorePassword = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { success: boolean; message: string },
    Error,
    { userId: string }
  >({
    mutationFn: async ({ userId }) => {
      const response = await api.patch(`/auth/restore`, { userId });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Contraseña restaurada correctamente', { duration: 3000 });
      invalidateQueries(queryClient, 'restorePassword');
    },
    onError: () => {
      toast.error('Error al restaurar la contraseña', { duration: 3000 });
    },
  });
};
```

#### Button in user-data-table.tsx

**File:** `apps/frontend/src/features/users/components/user-data-table.tsx`

Add below `<UserEditForm>` inside the slide-over's `children` area:

```tsx
{selectedUser && canUpdate && selectedUser.id !== currentUser?.id && (
  <div className="pt-4 border-t">
    <Button
      variant="outline"
      className="w-full"
      onClick={() => restorePassword({ userId: selectedUser.id })}
      disabled={isRestoring}
    >
      {isRestoring ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <KeyRound className="mr-2 h-4 w-4" />
      )}
      Restaurar contraseña
    </Button>
  </div>
)}
```

**Permission check:** `usePermission('users').canUpdate` — only shown to users who can update other users.

**Self-check:** `selectedUser.id !== currentUser?.id` — prevent restoring your own password.

### Data flow

1. Manager opens user-edit slide-over for a user
2. Manager clicks "Restaurar contraseña" button
3. Frontend calls `PATCH /auth/restore` with `{ userId }`
4. Backend finds user, hashes default password, updates `passwordHash`
5. Frontend shows success toast, closes slide-over
6. User logs in with default password, prompted to change it

### Files to modify

| File | Change |
|------|--------|
| `packages/shared/src/schemas/auth.schema.ts` | Add `RestorePasswordSchema` + `RestorePasswordDto` |
| `apps/backend/src/modules/auth/auth.controller.ts` | Add `restorePassword()` endpoint |
| `apps/backend/src/modules/auth/auth.service.ts` | Add `restorePassword()` method |
| `apps/frontend/src/features/users/hooks/usersHooks.ts` | Add `useRestorePassword` hook |
| `apps/frontend/src/features/users/components/user-data-table.tsx` | Add restore button |

### Testing

- Unit test for `AuthService.restorePassword()` — user not found, success case
- Integration test for `PATCH /auth/restore` — permission checks, validation
- Frontend: button visibility based on permissions, self-check, loading/success states
