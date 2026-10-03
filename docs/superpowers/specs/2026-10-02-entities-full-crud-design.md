# Entities Full CRUD — Design

**Date:** 2026-10-02
**Status:** Approved (pending spec review)
**Scope:** `apps/backend/src/modules/entities`, `apps/frontend/src/features/entities`, `packages/shared`

## Goal

Complete the CRUD surface for the `entities` feature: add Update (PATCH) and View, harden existing endpoints, and improve the status display — following the canonical `productos` pattern.

## Non-Goals

- Editing `name` (unique key referenced by permissions guard, `useTableByName`, table mapping).
- Editing `isActive` via API/UI (only set at create → `true`, soft-delete → `false`).
- **Recover action** for soft-deleted entities — future follow-up, out of scope.
- Global `StatusBadge` changes — status display changes apply to the entities feature only.

## Decisions (from brainstorming)

1. **Scope:** Update + View + hardening (delete by `id`, `GET /entities/:id`, system-entity protection).
2. **Editable fields:** `label` + `permissionType` only. `name` and `isActive` are not editable.
3. **permissionType re-sync:** whenever an update includes `permissionType`, re-sync all of that entity's `userPermission` rows (`updateMany`), because `canPerform()` enforces from the denormalized copy on `userPermission`. The operation is idempotent, so syncing even when the value is unchanged is fine.
4. **System entities:** `SYSTEM_ENTITIES` (`user_profile`, `dev_account`, `audit_logs`, `entities`) blocked from update **and** delete at the API level with `ForbiddenException`.
5. **UI pattern:** productos-style single `SlideOverForm` with `mode: "view" | "create" | "edit"`.
6. **Status display:** data-table Estado column shows a muted `—` for active records and the `"Inactivo"` badge only when inactive (no new column); view form shows the badge only when inactive.

## 1. Shared contracts (`packages/shared`)

- `src/schemas/permissions.schema.ts`: add

  ```ts
  export const UpdateEntitySchema = z.object({
    label: z.string().min(1).max(50).optional(),
    permissionType: PermissionTypeSchema.optional(),
  });
  export type UpdateEntityDto = z.infer<typeof UpdateEntitySchema>;
  ```

  No `name`, no `isActive`. The `ZodValidationPipe` strips unknown keys, so a client sending `isActive` is ignored (not rejected).
- `src/schemas/field-labels.ts`: add `fieldLabels.UpdateEntity` (`label`, `permissionType`).
- Rebuild: `pnpm --filter @vivero/shared build`.

## 2. Backend (`apps/backend/src/modules/entities`)

### Repository (`repositories/entities.repository.ts`)

- `update(id, data: UpdateEntityDto)` — mirror `productos.repository.ts`:

  ```ts
  return this.model.update({
    where: { id, deletedAt: null, isActive: true },
    data: { ...data, updatedAt: new Date() },
  });
  ```

- `syncPermissionType(entityId, permissionType)` — `this.prisma.userPermission.updateMany({ where: { entityId }, data: { permissionType } })`.

### Service (`entities.service.ts`)

- `updateEntity(id, data, requesterId)`:
  1. `findById(id, requesterId)` → throw `NotFoundException` if missing.
  2. If the existing row's `name` is in `SYSTEM_ENTITIES` → `ForbiddenException`.
  3. `repo.update(id, data)`.
  4. If `data.permissionType` is present → `repo.syncPermissionType(id, data.permissionType)` (idempotent; only invoked when the field is sent, and the schema only sends it when the form includes it).
  5. Return the same mapped `Entity` DTO shape used by list/create (`id`, `name`, `label`, `isActive`, `permissionType`).
- `getTableById(requesterId, id)` → mapped DTO via `repo.findById`; `NotFoundException` if missing.
- `softRemove(nameOrId, deletedByUserId)` — keep the existing name→id resolution, then reject with `ForbiddenException` when the resolved entity's `name` is in `SYSTEM_ENTITIES`, before calling `repo.softDelete`.

### Controller (`entities.controller.ts`)

- `PATCH ':id'` — `@RequirePermission({ tableName: 'entities', action: 'update', scope: 'ALL' })`, `@Body(new ZodValidationPipe(UpdateEntitySchema))`.
- `GET ':id'` — `@RequirePermission({ tableName: 'entities', action: 'read', scope: 'ALL' })`. **Declared after** `GET 'tables'` and `GET 'table/:tableName'` to avoid route shadowing.
- Existing routes unchanged (`GET tables`, `GET table/:tableName`, `POST entity`, `DELETE ':id'`).
- Audit: `AuditCrudInterceptor` already maps `PATCH → UPDATE`; no interceptor changes.

## 3. Frontend (`apps/frontend/src/features/entities`)

### API (`api/entityService.ts`)

- `update: (id, data: UpdateEntityDto) => clientFetch<Entity>(\`entities/${id}\`, { method: "PATCH", body: JSON.stringify(data) })`.
- `fetchById: (id) => clientFetch<Entity>(\`entities/${id}\`, { method: "GET" })`.
- Delete call site (in the data table) switches from `row.name` to `row.id` (backend still accepts both).

### Hooks & query keys

- `hooks/useEntities.ts`: add `useUpdateEntity` — `useMutation<Entity, Error, { id: string; data: UpdateEntityDto }>`, `toast.success` in `onSuccess`, then `invalidateQueries(queryClient, "updateEntity")` (productos shape).
- `src/lib/query-invalidation-map.ts`: add `updateEntity: { queries: () => [entityQueryKeys.all()] }`.
- `entityQueryKeys` already exists (`all`, `byName`, `byLabel`) — no new keys needed. Create/delete already invalidate `entityQueryKeys.all()`, so list rows appear/disappear automatically.

### Components

- **`components/columns.tsx`** — Estado cell: active → muted `—`; inactive → `<StatusBadge status="inactive">Inactivo</StatusBadge>`. Column structure, header, and sort unchanged. No new column.
- **New `components/entity-edit-form.tsx`** — dumb form (receives `form: UseFormReturn<UpdateEntityDto>`), two fields: `label` (Input), `permissionType` (Select). Same `FormProps` interface (`onSubmit`, `onCancel`, `formId`, `form`) as `entity-create-form.tsx`.
- **New `components/entity-view-form.tsx`** — read-only display of `name`, `label`, `permissionType`, and status (badge only when inactive, muted otherwise).
- **`components/entity-data-table.tsx`** — adopt the productos state model:
  - State: `mode: "view" | "create" | "edit"`, `selectedEntity: Entity | null`, `formEditEntity = useForm<UpdateEntityDto>({ resolver: zodResolver(UpdateEntitySchema), defaultValues from selected row })`.
  - `handleView`: set row, `mode="view"`, open. `handleEdit`: set row, `formEditEntity.reset({ label, permissionType })`, `mode="edit"`, open.
  - `handleUpdate`: `await updateEntity({ id: selectedEntity.id, data })` inside `try/catch` — close the slideover only on success (stays open on validation error).
  - `handleDelete`: pass `row.id`.
  - `SlideOverForm`: `formId` switches per mode; `mode="view"` disables editing; `saveLabel` switches; edit `confirm.summaryFields: ["label", "permissionType"]`; `fieldLabels` switch between `CreateEntity`/`UpdateEntity`.
  - Wire `onView` + `onEdit` to `DataTable` (action buttons are injected by `DataTable`, gated by the `entities` table's `permissionType`).
- **`index.ts`**: export `useUpdateEntity`.

## 4. Error handling

| Case | Response |
|---|---|
| PATCH body fails Zod (e.g. empty `label`) | 400 `VALIDATION_ERROR` (existing pipe) |
| PATCH/GET `:id` not found or soft-deleted | 404 (`NotFoundException`) |
| PATCH/DELETE of a `SYSTEM_ENTITIES` row | 403 (`ForbiddenException`) |
| Edit slideover submit fails | toast via error path; slideover stays open |

## 5. Testing

**Backend unit** (`pnpm --filter backend test`):

- `entities.repository.spec.ts`: `update` asserts `where: { id, deletedAt: null, isActive: true }` + `updatedAt`; `syncPermissionType` asserts `userPermission.updateMany` args.
- `entities.service.spec.ts`: `updateEntity` → 404 missing, 403 system entity, calls `repo.update`, syncs when `permissionType` present, returns mapped DTO; `softRemove` → 403 system entity; `getTableById` → 404.
- **New** `entities.controller.spec.ts`: direct delegation tests + `REQUIRE_PERMISSION_KEY` metadata assertions for `PATCH` (`entities:update`) and `GET :id` (`entities:read`).

**Backend integration** (`pnpm --filter backend test:integration`):

- Add `updateEntity` + `getTableById` to `createEntitiesMock()` in `test/integration/helpers/mock-factories.ts`.
- Cases: PATCH 200; PATCH 400 invalid body; PATCH 404; GET `/entities/:id` 200/404; DELETE system entity → 403.
- Fixture: `validUpdateEntityPayload`.

**Frontend** (`pnpm --filter frontend test`):

- New `__tests__/entityService.test.ts`: mock `clientFetch`; assert `update` → `PATCH entities/:id` with body; `fetchById` → GET.
- Extend `components/__tests__/entity-data-table.test.tsx` per `producto-data-table.test.tsx`: add `onEdit`/`onView` to the `DataTable` mock, mock `useUpdateEntity`, assert edit → `formId === "edit"` + `summaryFields`, submitting `#edit` calls `updateEntity({ id, data })`, delete called with `id`, view renders `EntityViewForm`.

## 6. Verification

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm --filter backend test:integration
```

## 7. Follow-ups (out of scope)

- **Recover action** for soft-deleted entities (dev-only, mirrors users/tenants `recover`).
- Frontend: showing soft-deleted entities (currently filtered from `findAll`) to act on recover.
