# Restore Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Restore Password" button to the admin user-edit slide-over that resets a user's password to the default via a new `PATCH /auth/restore` endpoint.

**Architecture:** Backend: new `PATCH /auth/restore` endpoint with `users.update.ALL` permission. Frontend: restore button in the admin user-edit slide-over with permission and self-user checks. Shared: new `RestorePasswordSchema`/`RestorePasswordDto`.

**Tech Stack:** NestJS 11, Prisma, Zod, React Query, shadcn/ui, Tailwind v4, bcrypt

## Global Constraints

- Conventional Commits enforced by commitlint (feat, fix, docs, etc.)
- All data types must be in `packages/shared/src/schemas/`
- Backend port: `PORT` env var (default 3001)
- `pnpm overrides` in root package.json — don't remove them
- Verification order before committing: `pnpm lint && pnpm type-check && pnpm test`

---

### Task 1: Add RestorePasswordSchema to shared package

**Files:**
- Modify: `packages/shared/src/schemas/auth.schema.ts`

**Interfaces:**
- Produces: `RestorePasswordSchema` (Zod schema), `RestorePasswordDto` (type)

- [ ] **Step 1: Add the schema and type at the end of auth.schema.ts**

```typescript
// Restore Password
export const RestorePasswordSchema = z.object({
  userId: z.string().min(1, { message: "ID de usuario es obligatorio" }),
});

export type RestorePasswordDto = z.infer<typeof RestorePasswordSchema>;
```

- [ ] **Step 2: Build the shared package**

```bash
pnpm --filter @vivero/shared build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/schemas/auth.schema.ts
git commit -m "feat(shared): add RestorePasswordSchema and RestorePasswordDto"
```

---

### Task 2: Add restorePassword method to AuthService

**Files:**
- Modify: `apps/backend/src/modules/auth/auth.service.ts:19-20` (imports)

**Interfaces:**
- Consumes: `RestorePasswordDto` from `@vivero/shared`
- Produces: `AuthService.restorePassword(userId: string)` returning `{ success: boolean; message: string }`

- [ ] **Step 1: Add RestorePasswordDto to the imports**

At line 20 in `apps/backend/src/modules/auth/auth.service.ts`, add `RestorePasswordDto` to the existing import from `@vivero/shared`:

```typescript
import {
  LoginAuthDto,
  AuthResponseDto,
  TokensDto,
  RegisterAuthDto,
  ChangePasswordDto,
  RestorePasswordDto,
} from '@vivero/shared';
```

- [ ] **Step 2: Add the restorePassword method**

Add after the `changePassword` method (after line 202) and before the `generateTokens` private method:

```typescript
async restorePassword(
  userId: string,
): Promise<{ success: boolean; message: string }> {
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

- [ ] **Step 3: Verify the backend compiles**

```bash
pnpm --filter backend build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/auth/auth.service.ts
git commit -m "feat(backend): add restorePassword method to AuthService"
```

---

### Task 3: Add restorePassword endpoint to AuthController

**Files:**
- Modify: `apps/backend/src/modules/auth/auth.controller.ts:24` (imports)
- Modify: `apps/backend/src/modules/auth/auth.controller.ts:117` (new endpoint after changePassword)

**Interfaces:**
- Consumes: `RestorePasswordSchema`, `RestorePasswordDto` from `@vivero/shared`
- Produces: `PATCH /auth/restore` endpoint

- [ ] **Step 1: Add RestorePasswordSchema and RestorePasswordDto to imports**

At line 24 in `apps/backend/src/modules/auth/auth.controller.ts`, add to the existing import:

```typescript
import {
  RegisterAuthDto,
  LoginAuthDto,
  RegisterAuthSchema,
  AuthResponseDto,
  LoginAuthSchema,
  RefreshTokenSchema,
  RefreshTokenDto,
  TokensDto,
  ChangePasswordDto,
  ChangePasswordSchema,
  RestorePasswordSchema,
  RestorePasswordDto,
} from '@vivero/shared';
```

- [ ] **Step 2: Add the restorePassword endpoint**

Add after the `changePassword` method (after line 117):

```typescript
/**
 * PATCH /auth/restore
 * Protected endpoint - restore user password to default
 */
@Patch('restore')
@HttpCode(HttpStatus.OK)
@RequirePermission({ tableName: 'users', action: 'update', scope: 'ALL' })
async restorePassword(
  @Body(new ZodValidationPipe(RestorePasswordSchema)) dto: RestorePasswordDto,
): Promise<{ success: boolean; message: string }> {
  return this.authService.restorePassword(dto.userId);
}
```

- [ ] **Step 3: Verify the backend compiles**

```bash
pnpm --filter backend build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/auth/auth.controller.ts
git commit -m "feat(backend): add PATCH /auth/restore endpoint"
```

---

### Task 4: Add useRestorePassword hook to frontend

**Files:**
- Modify: `apps/frontend/src/features/users/hooks/usersHooks.ts` (add hook)
- Modify: `apps/frontend/src/features/users/index.ts` (export hook)
- Modify: `apps/frontend/src/lib/query-invalidation-map.ts` (add invalidation entry)

**Interfaces:**
- Consumes: `RestorePasswordDto` from `@vivero/shared`, `clientFetch` from `@/lib/api/client-fetch`
- Produces: `useRestorePassword()` hook returning `{ mutateAsync, isPending }`

- [ ] **Step 1: Add the useRestorePassword hook to usersHooks.ts**

Add at the end of `apps/frontend/src/features/users/hooks/usersHooks.ts`:

```typescript
export const useRestorePassword = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    { userId: string }
  >({
    mutationFn: async ({ userId }) => {
      const response = await clientFetch<{ success: boolean; message: string }>(
        "auth/restore",
        {
          method: "PATCH",
          body: JSON.stringify({ userId }),
        }
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Contraseña restaurada correctamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "restorePassword");
    },
    onError: () => {
      toast.error("Error al restaurar la contraseña", { duration: 3000 });
    },
  });
};
```

- [ ] **Step 2: Add clientFetch import to usersHooks.ts**

Add the import at the top of `apps/frontend/src/features/users/hooks/usersHooks.ts`:

```typescript
import { clientFetch } from "@/lib/api/client-fetch";
```

- [ ] **Step 3: Add restorePassword to the invalidation map**

In `apps/frontend/src/lib/query-invalidation-map.ts`, add after the `deleteUser` entry (after line 50):

```typescript
restorePassword: {
  queries: () => [usersQueryKeys.all()],
},
```

- [ ] **Step 4: Export the hook from the barrel file**

In `apps/frontend/src/features/users/index.ts`, add `useRestorePassword` to the hooks export:

```typescript
export {
  useUsers,
  useUsersByUserName,
  useUsersByTenantId,
  useUpdateUserProfile,
  useUpdateUser,
  useDeleteUser,
  useGetAllUsersAdmin,
  useRestorePassword,
} from "./hooks/usersHooks";
```

- [ ] **Step 5: Verify the frontend compiles**

```bash
pnpm --filter frontend build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/features/users/hooks/usersHooks.ts apps/frontend/src/features/users/index.ts apps/frontend/src/lib/query-invalidation-map.ts
git commit -m "feat(frontend): add useRestorePassword hook and query invalidation"
```

---

### Task 5: Add restore button to user-data-table.tsx

**Files:**
- Modify: `apps/frontend/src/features/users/components/user-data-table.tsx`

**Interfaces:**
- Consumes: `useRestorePassword` from `../hooks/usersHooks`, `usePermission` from `@/hooks/usePermission`, `useAuthContext` from `@/features/auth/providers/AuthProvider`
- Produces: Restore password button in the slide-over

- [ ] **Step 1: Add imports**

Add to the imports at the top of `apps/frontend/src/features/users/components/user-data-table.tsx`:

```typescript
import { useRestorePassword } from "../hooks/usersHooks";
import { usePermission } from "@/hooks/usePermission";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound } from "lucide-react";
```

- [ ] **Step 2: Add hooks inside the component**

Inside the `UsersDataTable` component, after the existing hooks (after line 33):

```typescript
const { mutateAsync: restorePassword, isPending: isRestoring } =
  useRestorePassword();
const { canUpdate } = usePermission("users");
const { userProfile: currentUser } = useAuthContext();
```

- [ ] **Step 3: Add the restore button below the form**

In the slide-over's `children` area, after the `<UserEditForm>` component (after line 141), add the restore button. The full children block should become:

```tsx
<div className="space-y-2">
  {selectedUser ? (
    <UserEditForm
      form={formEditUser}
      onSubmit={handleUpdate}
      onCancel={() => setSlideOverOpen(false)}
      formId={
        selectedUser ? `edit-${selectedUser.username}` : "create"
      }
    />
  ) : (
    <UserCreateForm
      form={formCreateUser}
      onSubmit={handleCreate}
      onCancel={() => setSlideOverOpen(false)}
      formId="create"
    />
  )}
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
</div>
```

- [ ] **Step 4: Verify the frontend compiles**

```bash
pnpm --filter frontend build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/users/components/user-data-table.tsx
git commit -m "feat(frontend): add restore password button to admin user-edit slide-over"
```

---

### Task 6: End-to-end verification

- [ ] **Step 1: Run full lint and type-check**

```bash
pnpm lint && pnpm type-check
```

Expected: No errors.

- [ ] **Step 2: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 3: Manual verification**

1. Start dev servers: `pnpm dev`
2. Log in as a user with `users.update.ALL` permission
3. Navigate to Users > click edit on a user
4. Verify "Restaurar contraseña" button is visible
5. Click the button — verify success toast and slide-over closes
6. Log in as the restored user with the default password — verify login works
7. Verify the button is NOT visible when editing your own profile
8. Verify the button is NOT visible for users without `users.update` permission
