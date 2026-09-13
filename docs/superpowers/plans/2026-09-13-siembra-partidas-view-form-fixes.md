# SiembraPartidas View Form Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix "Presion" typo to "Prensado" and surface taskshift creator as "Encargado" in the siembraPartidas view form.

**Architecture:** Add `createdByUser` to the TaskShift query, add `createdByNombre` to the DTO schema, resolve it in the service, and display it in the frontend Turno tab.

**Tech Stack:** Prisma (backend ORM), Zod (shared schemas), React (frontend)

## Global Constraints

- Legacy database uses raw MySQL queries (not Prisma)
- All data types must be in `packages/shared/src/schemas/`
- Conventional Commits enforced by commitlint
- Verification: `pnpm lint && pnpm type-check && pnpm test`

---

### Task 1: Update TaskShift Repository

**Files:**
- Modify: `apps/backend/src/modules/taskShifts/repositories/taskShifts.repository.ts:8-23,63-78`

**Interfaces:**
- Consumes: nothing
- Produces: `TaskShiftWithEmployees` with `createdByUser`, `findByPartidaComposite` including `createdByUser`

- [ ] **Step 1: Update TaskShiftWithEmployees type**

In `apps/backend/src/modules/taskShifts/repositories/taskShifts.repository.ts`, update the type:

```typescript
export type TaskShiftWithEmployees = {
  id: string;
  createdByUserId: string;
  createdByUser: { username: string } | null;
  entityId: string;
  partidaId: number;
  anio: number;
  indice: number;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedByUserId: string | null;
  employees: { userId: string }[];
};
```

- [ ] **Step 2: Update findByPartidaComposite include**

In the same file, update `findByPartidaComposite`:

```typescript
async findByPartidaComposite(
  partidaId: number,
  anio: number,
  indice: number,
): Promise<TaskShiftWithEmployees | null> {
  return this.prisma.taskShift.findFirst({
    where: {
      partidaId,
      anio,
      indice,
      deletedAt: null,
      isActive: true,
    },
    include: {
      employees: { select: { userId: true } },
      createdByUser: { select: { username: true } },
    },
  });
}
```

- [ ] **Step 3: Run backend type-check**

Run: `pnpm --filter backend type-check`
Expected: PASS

---

### Task 2: Update Shared Schema

**Files:**
- Modify: `packages/shared/src/schemas/siembraPartida.schema.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `SiembraPartidaSchema` with `createdByNombre`

- [ ] **Step 1: Add createdByNombre field**

In `packages/shared/src/schemas/siembraPartida.schema.ts`, add after `usuarioNombre`:

```typescript
createdByNombre: z.string().optional(),
```

- [ ] **Step 2: Run shared type-check**

Run: `pnpm --filter @vivero/shared type-check`
Expected: PASS

---

### Task 3: Update SiembraPartidas Service

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts:91-184`

**Interfaces:**
- Consumes: `TaskShiftWithEmployees` with `createdByUser` from Task 1, `SiembraPartidaSchema` with `createdByNombre` from Task 2
- Produces: `SiembraPartidaDto` with `createdByNombre`

- [ ] **Step 1: Add createdByNombre to mapToDto**

In `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`, add after `empleados`:

```typescript
// Resolve taskshift creator
let createdByNombre: string | undefined;
if (taskShift?.createdByUser?.username) {
  createdByNombre = taskShift.createdByUser.username;
}
```

And add to the return object:

```typescript
createdByNombre,
```

- [ ] **Step 2: Run backend type-check**

Run: `pnpm --filter backend type-check`
Expected: PASS

---

### Task 4: Update Frontend View Form

**Files:**
- Modify: `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx:171,302-312`

**Interfaces:**
- Consumes: `SiembraPartidaDto` with `createdByNombre` from Task 2
- Produces: updated UI with "Prensado" label and "Encargado" InfoRow

- [ ] **Step 1: Fix typo**

In `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx`, line 171:

```tsx
<InfoRow
  icon={Activity}
  label="Prensado"
  value={`${selectedPartida.prensadoSemilla}`}
/>
```

- [ ] **Step 2: Add Encargado InfoRow**

In the Turno tab, add before the Empleados InfoRow:

```tsx
<InfoRow
  icon={ClipboardList}
  label="Encargado"
  value={selectedPartida.createdByNombre}
/>
```

- [ ] **Step 3: Run frontend type-check**

Run: `pnpm --filter frontend type-check`
Expected: PASS

---

### Task 5: Full Verification

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: PASS (0 errors)

- [ ] **Step 2: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: PASS
