# "A Sembrar" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a two-person sowing workflow where User A authorizes partidas and User B completes the technical assignment.

**Architecture:** New `a_sembrar` permission entity with its own frontend feature. Backend adds GET pending + POST autorizar + PATCH completar endpoints. Existing `SiembraPartidas` table is the bridge between both users.

**Tech Stack:** NestJS, Prisma, MariaDB, Next.js (App Router), TanStack Query, Zod, shadcn/ui, Tailwind v4

## Global Constraints

- MariaDB (not PostgreSQL) — no `RETURNING` clause, use separate queries
- Prisma ORM — follow existing patterns in `siembraPartidas` module
- Zod schemas in `packages/shared/src/schemas/` for all DTOs
- TDD: write tests before implementation
- Conventional commits: `feat:`, `fix:`, `docs:`, etc.
- Run `pnpm lint && pnpm type-check && pnpm test` before committing

---

## File Map

### Backend (Create)
| File | Purpose |
|------|---------|
| — | No new files — all changes are to existing files |

### Backend (Modify)
| File | Changes |
|------|---------|
| `apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts` | Add `findPendingSiembraPartidas()` method |
| `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts` | Add `autorizarSiembra()`, `findPendingSiembraPartidas()`, `completarSiembraPartida()` methods |
| `apps/backend/src/modules/siembraPartidas/siembraPartidas.controller.ts` | Add GET `pending`, wire existing service methods |
| `apps/backend/src/modules/legacy/partidas/partidas.controller.ts` | Add POST `autorizar-siembra`, change `asignar-siembra` from POST to PATCH with `:id` param |

### Shared (Modify)
| File | Changes |
|------|---------|
| `packages/shared/src/schemas/field-labels.ts` | Add `ASembrar` section |

### Frontend (Create)
| File | Purpose |
|------|---------|
| `apps/frontend/src/features/aSembrar/index.ts` | Barrel exports |
| `apps/frontend/src/features/aSembrar/api/aSembrarService.ts` | API client (fetchPending, completarSiembra) |
| `apps/frontend/src/features/aSembrar/hooks/useASembrarPartidas.ts` | Query hook for pending records |
| `apps/frontend/src/features/aSembrar/hooks/useASembrarMutation.ts` | Mutation hook for completing assignment |
| `apps/frontend/src/features/aSembrar/components/ASembrarDashboard.tsx` | Dashboard wrapper |
| `apps/frontend/src/features/aSembrar/components/a-sembrar-view.tsx` | LoadingBoundary + DataTable |
| `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx` | DataTable with SlideOverForm |
| `apps/frontend/src/features/aSembrar/components/a-sembrar-edit-form.tsx` | Technical fields form |
| `apps/frontend/src/features/aSembrar/components/columns.tsx` | Column definitions |

### Frontend (Modify)
| File | Changes |
|------|---------|
| `apps/frontend/src/constants/routes.ts` | Add `A_SEMBRAR` route |
| `apps/frontend/src/lib/queryKeys.ts` | Add `aSembrarQueryKeys` |
| `apps/frontend/src/lib/query-invalidation-map.ts` | Add `aSembrar` entry |
| `apps/frontend/src/lib/config/navigations.ts` | Add "A Sembrar" nav entry |
| `apps/frontend/src/features/permissions/constants/table-meta.ts` | Add `siembra` and `a_sembrar` entries |
| `apps/frontend/src/features/siembra/api/siembraService.ts` | Add `autorizarSiembra()` method |
| `apps/frontend/src/features/siembra/hooks/useSiembraPartidaMutation.ts` | Add autorizacion mutation |
| `apps/frontend/src/features/siembra/components/siembra-data-table.tsx` | Add "Autorizar" action button |
| `apps/frontend/src/features/siembra/components/siembra-edit-form.tsx` | Refactor to show only preliminary fields |

---

### Task 0: Backend — Register `a_sembrar` Entity

**Files:**
- Modify: `apps/backend/prisma/seed.ts` (or create a standalone seed script)

**Context:** The `entities` table stores permission entities. `a_sembrar` must exist before any permission checks work. Follow the same pattern as how `siembra` was created (dynamically or via seed).

- [ ] **Step 1: Create seed entry for `a_sembrar` entity**

Add to the seed file or create a migration SQL:

```sql
INSERT INTO entities (id, name, label, permissionType, isActive, createdAt, updatedAt)
VALUES (CONCAT('c', LPAD(FLOOR(RAND() * 10000000000000000), 24, '0')), 'a_sembrar', 'A Sembrar', 'CRUD', true, NOW(), NOW());
```

Or programmatically in the seed:

```typescript
await prisma.entity.upsert({
  where: { name: 'a_sembrar' },
  update: {},
  create: {
    name: 'a_sembrar',
    label: 'A Sembrar',
    permissionType: 'CRUD',
  },
});
```

- [ ] **Step 2: Also add `siembra` entity if missing**

Check if `siembra` exists in the entities table. If not, create it:

```typescript
await prisma.entity.upsert({
  where: { name: 'siembra' },
  update: {},
  create: {
    name: 'siembra',
    label: 'Siembra',
    permissionType: 'CRUD',
  },
});
```

- [ ] **Step 3: Run seed**

Run the appropriate seed command for your project. Check `package.json` scripts:

```bash
pnpm --filter backend db:seed
```

If no generic seed exists, create a standalone script or add the entity upsert to the existing seed file.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/prisma/seed.ts
git commit -m "feat(backend): register a_sembrar and siembra entities in seed"
```

---

### Task 1: Backend — Repository `findPendingSiembraPartidas` + `update`

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts`

**Interfaces:**
- Produces: `findPendingSiembraPartidas(requesterId: string): Promise<SiembraPartidasWithRelations[]>`, `update(id: string, data: Prisma.SiembraPartidasUpdateInput): Promise<SiembraPartidas>`

- [ ] **Step 1: Add `update` method**

```typescript
async update(
  id: string,
  data: Prisma.SiembraPartidasUpdateInput,
): Promise<SiembraPartidas> {
  return this.model.update({
    where: { id },
    data,
  });
}
```

- [ ] **Step 2: Add `findPendingSiembraPartidas` method**

```typescript
async findPendingSiembraPartidas(
  requesterId: string,
): Promise<SiembraPartidasWithRelations[]> {
  const devIds = await this.getDevAccounts();

  return this.prisma.siembraPartidas.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      profundidadSemilla: 0,
      ...(devIds.includes(requesterId)
        ? {}
        : {
            id: { notIn: devIds },
          }),
    },
    include: {
      mezcla: {
        include: {
          sustrato1: { select: { nombre: true } },
          sustrato2: { select: { nombre: true } },
          sustrato3: { select: { nombre: true } },
          sustrato4: { select: { nombre: true } },
        },
      },
      user: { select: { username: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts
git commit -m "feat(backend): add findPendingSiembraPartidas and update repository methods"
```

---

### Task 2: Backend — Service methods

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`

**Interfaces:**
- Consumes: `PartidaHeader` (from `@vivero/shared`), `AsignarUbiSiembraCompletaDto` (from `@vivero/shared`)
- Produces: `autorizarSiembra()`, `findPendingSiembraPartidas()`, `completarSiembraPartida()`

- [ ] **Step 1: Add `autorizarSiembra` method**

```typescript
async autorizarSiembra(
  data: PartidaHeader,
  requesterId: string,
): Promise<SiembraPartidaDto> {
  const mezclaId = await this.getOrCreateGenericMezcla();

  const row = await this.repo.createSiembraPartida({
    partidaId: data.partidaId,
    anio: data.anio,
    indice: data.indice,
    metodoMaquina: true,
    presionSemilla: 0,
    profundidadSemilla: 0,
    tratamientoSemilla: '',
    mezcla: { connect: { id: mezclaId } },
    user: { connect: { id: requesterId } },
  });

  const full = await this.repo.findById(row.id, requesterId);
  const [legacyData, taskShift] = await Promise.all([
    this.partidasRepo.findByComposite(row.partidaId, row.anio, row.indice),
    this.taskShiftsRepo.findByPartidaComposite(row.partidaId, row.anio, row.indice),
  ]);

  return this.mapToDto(full as SiembraPartidasWithRelations, legacyData, taskShift);
}
```

- [ ] **Step 2: Add `findPendingSiembraPartidas` method**

```typescript
async findPendingSiembraPartidas(
  requesterId: string,
): Promise<SiembraPartidaDto[]> {
  const rows = await this.repo.findPendingSiembraPartidas(requesterId);

  const dtos = await Promise.all(
    rows.map(async (row) => {
      const [legacyData, taskShift] = await Promise.all([
        this.partidasRepo.findByComposite(row.partidaId, row.anio, row.indice),
        this.taskShiftsRepo.findByPartidaComposite(row.partidaId, row.anio, row.indice),
      ]);
      return this.mapToDto(row, legacyData, taskShift);
    }),
  );

  return dtos;
}
```

- [ ] **Step 3: Add `completarSiembraPartida` method**

This method only updates the technical fields on the existing `SiembraPartidas` record. The legacy write, stock tracking, and TaskShift creation happen in `PartidasController` by calling the existing `PartidasService.asignarSiembra()`.

```typescript
async completarSiembraPartida(
  id: string,
  data: AsignarUbiSiembraCompletaDto,
  requesterId: string,
): Promise<SiembraPartidaDto> {
  const existing = await this.repo.findById(id, requesterId);
  if (!existing) {
    throw new NotFoundException('Registro de siembra no encontrado');
  }

  if (existing.profundidadSemilla !== 0) {
    throw new ConflictException('Esta partida ya fue completada');
  }

  await this.repo.update(id, {
    metodoMaquina: data.metodoMaquina,
    presionSemilla: data.presionSemilla,
    profundidadSemilla: data.profundidadSemilla,
    tratamientoSemilla: data.tratamientoSemilla,
    ...(data.mezclaId
      ? { mezcla: { connect: { id: data.mezclaId } } }
      : {}),
  });

  const full = await this.repo.findById(id, requesterId);
  const [legacyData, taskShift] = await Promise.all([
    this.partidasRepo.findByComposite(
      existing.partidaId,
      existing.anio,
      existing.indice,
    ),
    this.taskShiftsRepo.findByPartidaComposite(
      existing.partidaId,
      existing.anio,
      existing.indice,
    ),
  ]);

  return this.mapToDto(full as SiembraPartidasWithRelations, legacyData, taskShift);
}
```

**Important:** The `PartidasController.completarSiembra` endpoint calls this method FIRST to update technical fields, THEN calls `PartidasService.asignarSiembra()` for the legacy write/stock/TaskShift. See Task 3 for the controller orchestration.

- [ ] **Step 4: Add import for `ConflictException` and `PartidaHeader` type**

At top of file, add to existing imports:
```typescript
import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateSiembraPartidaDto, SiembraPartidaDto, PartidaHeader } from '@vivero/shared';
```

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts
git commit -m "feat(backend): add autorizarSiembra, findPending, completarSiembraPartida services"
```

---

### Task 3: Backend — Controller endpoints

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.controller.ts`
- Modify: `apps/backend/src/modules/legacy/partidas/partidas.controller.ts`
- Modify: `apps/backend/src/modules/legacy/partidas/partidas.service.ts`

**Interfaces:**
- Consumes: `SiembraPartidasService.autorizarSiembra()`, `.findPendingSiembraPartidas()`, `.completarSiembraPartida()`
- Produces: 3 HTTP endpoints + 1 new service method

- [ ] **Step 1: Add `completarSiembraLegacy` method to `PartidasService`**

This method does the legacy MySQL write + stock tracking + TaskShift creation, WITHOUT creating a new SiembraPartida record (unlike `asignarSiembra` which creates one). Add to `partidas.service.ts`:

```typescript
async completarSiembraLegacy(
  data: AsignarUbiSiembraCompletaDto,
  requesterId: string,
): Promise<void> {
  if (data.edita === 'N') {
    throw new BadRequestException('La partida no se puede editar');
  }

  if (!data.cg || data.cg === 0) {
    throw new BadRequestException('Debe seleccionar una ubicación válida');
  }

  const legacyData = {
    partida: data.partidaId,
    ano: data.anio,
    indice: data.indice,
    f_siembra: data.f_siembra,
    cg: data.cg,
    cantidaNroCont: data.cantidaNroCont,
    ajuste: data.ajuste,
    cantidadGrs: data.cantidadGrs,
    lote: data.lote,
    anoLote: data.anoLote,
    item: data.item,
    semxgr: data.semxgr,
    detalle: data.detalleExtendido,
  };

  await this.prisma.$transaction(async () => {
    // 1. Read stock BEFORE consumption
    const stockBefore = await this.legacyStockService.stockTotal(
      data.lote,
      data.anio,
      data.item,
    );
    const entradasAntes = Number(stockBefore[0]?.total_entradas ?? 0);
    const salidasAntes = Number(stockBefore[0]?.total_salidas ?? 0);

    // 2. Write consumption to partidas1
    await this.partidasRepository.asignarSiembra(legacyData);

    // 3. Sync stock summary tables
    const stockAfter = await this.legacyStockService.updateStock(
      data.lote,
      data.anio,
      data.item,
    );

    // 4. Audit stock sync
    try {
      this.auditEventEmitter.emitCrud({
        tenantId: 'unknown',
        userId: requesterId,
        action: 'UPDATE',
        entityType: 'STOCK',
        entityId: `lote:${data.lote}|anio:${data.anio}|item:${data.item}`,
        timestamp: new Date(),
        changes: {
          requestId: 'unknown',
          endpoint: '/l-partidas/asignar-siembra/:id',
          method: 'PATCH',
          params: {},
          query: {},
          body: {
            lote: data.lote,
            anio: data.anio,
            item: data.item,
            antes: { entradas: entradasAntes, salidas: salidasAntes },
            despues: {
              entradas: stockAfter.entradas,
              salidas: stockAfter.salidas,
            },
          },
          affected: { count: 1 },
          durationMs: 0,
        },
      });
    } catch (err: unknown) {
      this.logger.error({ err }, 'Failed to emit stock audit event');
    }

    // 5. Create TaskShift
    if (data.startTime && data.endTime) {
      await this.taskShiftsService.createTaskShift(
        {
          entityId: data.entityId,
          partidaId: data.partidaId,
          anio: data.anio,
          indice: data.indice,
          startTime: data.startTime,
          endTime: data.endTime,
          employeeUserIds: data.employeeUserIds ?? [],
        },
        requesterId,
      );
    }
  });
}
```

- [ ] **Step 2: Add GET `pending` to SiembraPartidasController**

```typescript
@Get('pending')
@RequirePermission({ tableName: 'a_sembrar', action: 'read', scope: 'ALL' })
async getPendingSiembraPartidas(
  @CurrentUser() user: AuthUser,
): Promise<SiembraPartidaDto[]> {
  return this.service.findPendingSiembraPartidas(user.id);
}
```

Also add import for `SiembraPartidaDto` if not already present.

- [ ] **Step 2: Add POST `autorizar-siembra` to PartidasController**

```typescript
@Post('autorizar-siembra')
@RequirePermission({
  tableName: 'siembra',
  action: 'create',
  scope: 'ALL',
})
async autorizarSiembra(
  @Body(new ZodValidationPipe(PartidaHeaderSchema))
  data: PartidaHeader,
  @CurrentUser() user: AuthUser,
) {
  const result = await this.siembraPartidasService.autorizarSiembra(data, user.id);
  return {
    success: true,
    message: 'Partida autorizada para siembra',
    data: result,
  };
}
```

This requires injecting `SiembraPartidasService` into `PartidasController`. Update constructor:

```typescript
constructor(
  private readonly service: PartidasService,
  private readonly siembraPartidasService: SiembraPartidasService,
) {}
```

Add imports:
```typescript
import { SiembraPartidasService } from '../../siembraPartidas/siembraPartidas.service';
import { PartidaHeaderSchema, PartidaHeader } from '@vivero/shared';
```

- [ ] **Step 4: Change `asignar-siembra` from POST to PATCH with `:id` param**

Replace the existing `asignarSiembra` method in `PartidasController`:

```typescript
@Patch('asignar-siembra/:id')
@RequirePermission({
  tableName: 'a_sembrar',
  action: 'update',
  scope: 'ALL',
})
async completarSiembra(
  @Param('id') id: string,
  @Body(new ZodValidationPipe(AsignarUbiSiembraCompletaDtoSchema))
  data: AsignarUbiSiembraCompletaDto,
  @CurrentUser() user: AuthUser,
) {
  // 1. Update technical fields on SiembraPartidas
  await this.siembraPartidasService.completarSiembraPartida(id, data, user.id);
  // 2. Write legacy data + stock + TaskShift
  await this.service.completarSiembraLegacy(data, user.id);
  return {
    success: true,
    message: 'Siembra completada correctamente',
  };
}
```

Add `Param` to imports from `@nestjs/common`.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/siembraPartidas/siembraPartidas.controller.ts apps/backend/src/modules/legacy/partidas/partidas.controller.ts
git commit -m "feat(backend): add autorizar-siembra POST, completar PATCH, pending GET endpoints"
```

---

### Task 4: Shared — Field labels

**Files:**
- Modify: `packages/shared/src/schemas/field-labels.ts`

- [ ] **Step 1: Add `ASembrar` section to fieldLabels**

Add after the `SiembraLegacy` section:

```typescript
ASembrar: {
  partidaId: "Partida",
  codigoEspecie: "Código",
  nombreEspecie: "Especie",
  cantidaNroCont: "Cantidad",
  fSiembra: "F. Siembra",
  usuarioNombre: "Autorizado por",
  metodoMaquina: "Método",
  presionSemilla: "Presión",
  profundidadSemilla: "Profundidad",
  tratamientoSemilla: "Tratamiento",
  tratamientoNombre: "Tratamiento",
  mezclaId: "Mezcla",
  mezclaNombre: "Mezcla",
  entityId: "Entidad",
  entityNombre: "Entidad",
  startTime: "Hora Inicio",
  endTime: "Hora Fin",
  employeeUserIds: "Empleados",
  empleados: "Empleados",
},
```

- [ ] **Step 2: Build shared package and commit**

```bash
pnpm --filter @vivero/shared build
git add packages/shared/src/schemas/field-labels.ts
git commit -m "feat(shared): add ASembrar field labels"
```

---

### Task 5: Frontend — Config & Query Keys

**Files:**
- Modify: `apps/frontend/src/constants/routes.ts`
- Modify: `apps/frontend/src/lib/queryKeys.ts`
- Modify: `apps/frontend/src/lib/query-invalidation-map.ts`
- Modify: `apps/frontend/src/lib/config/navigations.ts`
- Modify: `apps/frontend/src/features/permissions/constants/table-meta.ts`

- [ ] **Step 1: Add route constant**

In `routes.ts`, add to `ROUTES`:
```typescript
A_SEMBRAR: "/a-sembrar",
```

- [ ] **Step 2: Add query keys**

In `queryKeys.ts`, add:
```typescript
// A SEMBRAR
export const aSembrarQueryKeys = {
  all: () => ["aSembrar"] as const,
};
```

- [ ] **Step 3: Add invalidation map entry**

In `query-invalidation-map.ts`, add import for `aSembrarQueryKeys` and add entry:
```typescript
aSembrar: {
  queries: () => [aSembrarQueryKeys.all()],
},
```

- [ ] **Step 4: Add navigation entry**

In `navigations.ts`, add inside the `partidas` group items array (after "A Extender"):
```typescript
{
  title: "A Sembrar",
  href: ROUTES.A_SEMBRAR,
  icon: Sprout,
  description: "Partidas autorizadas para siembra",
  dashboard: { statsLabel: "Partidas a sembrar" },
  requiredPermission: { table: "a_sembrar", action: "read" },
},
```

`Sprout` is already imported in navigations.ts.

- [ ] **Step 5: Add table-meta entries**

In `table-meta.ts`, add to `TABLE_META`:
```typescript
siembra: { icon: Sprout },
a_sembrar: { icon: Sprout },
```

Add `Sprout` to the lucide-react import.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/constants/routes.ts apps/frontend/src/lib/queryKeys.ts apps/frontend/src/lib/query-invalidation-map.ts apps/frontend/src/lib/config/navigations.ts apps/frontend/src/features/permissions/constants/table-meta.ts
git commit -m "feat(frontend): add a_sembrar routes, query keys, navigation, and table-meta"
```

---

### Task 6: Frontend — aSembrar Feature

**Files:**
- Create: `apps/frontend/src/features/aSembrar/index.ts`
- Create: `apps/frontend/src/features/aSembrar/api/aSembrarService.ts`
- Create: `apps/frontend/src/features/aSembrar/hooks/useASembrarPartidas.ts`
- Create: `apps/frontend/src/features/aSembrar/hooks/useASembrarMutation.ts`
- Create: `apps/frontend/src/features/aSembrar/components/ASembrarDashboard.tsx`
- Create: `apps/frontend/src/features/aSembrar/components/a-sembrar-view.tsx`
- Create: `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx`
- Create: `apps/frontend/src/features/aSembrar/components/a-sembrar-edit-form.tsx`
- Create: `apps/frontend/src/features/aSembrar/components/columns.tsx`

- [ ] **Step 1: Create API service**

`apps/frontend/src/features/aSembrar/api/aSembrarService.ts`:
```typescript
import { clientFetch } from "@/lib/api/client-fetch";
import {
  SiembraPartidaDto,
  AsignarUbiSiembraCompletaDto,
} from "@vivero/shared";

export const aSembrarService = {
  fetchPending: () =>
    clientFetch<SiembraPartidaDto[]>("siembra-partidas/pending", {
      method: "GET",
    }),

  completarSiembra: (id: string, data: AsignarUbiSiembraCompletaDto) =>
    clientFetch<void>(`l-partidas/asignar-siembra/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
```

- [ ] **Step 2: Create hooks**

`apps/frontend/src/features/aSembrar/hooks/useASembrarPartidas.ts`:
```typescript
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { SiembraPartidaDto } from "@vivero/shared";
import { aSembrarService } from "../api/aSembrarService";
import { aSembrarQueryKeys } from "@/lib/queryKeys";

export function useASembrarPartidas() {
  return useSuspenseQuery<SiembraPartidaDto[]>({
    queryKey: aSembrarQueryKeys.all(),
    queryFn: aSembrarService.fetchPending,
  });
}
```

`apps/frontend/src/features/aSembrar/hooks/useASembrarMutation.ts`:
```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AsignarUbiSiembraCompletaDto } from "@vivero/shared";
import { toast } from "sonner";
import { invalidateQueries } from "@/lib/query-invalidation-map";
import { aSembrarService } from "../api/aSembrarService";

export const useASembrarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: string; data: AsignarUbiSiembraCompletaDto }
  >({
    mutationFn: ({ id, data }) => aSembrarService.completarSiembra(id, data),
    onSuccess: () => {
      invalidateQueries(queryClient, "aSembrar");
      invalidateQueries(queryClient, "siembraPartida");
      toast.success("Siembra completada exitosamente", { duration: 3000 });
    },
  });
};
```

- [ ] **Step 3: Create columns**

`apps/frontend/src/features/aSembrar/components/columns.tsx`:
```typescript
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SiembraPartidaDto, ExportColumn } from "@vivero/shared";
import { Badge } from "@/components/ui/badge";

export const aSembrarColumns: ColumnDef<SiembraPartidaDto>[] = [
  {
    accessorKey: "partidaId",
    header: "Partida",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <span className="font-mono text-xs font-bold">
          #{p.partidaId}
          {p.indice > 0 && (
            <span className="text-muted-foreground"> / {p.indice}</span>
          )}
        </span>
      );
    },
    size: 90,
  },
  {
    accessorKey: "codigoEspecie",
    header: "Código",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-bold uppercase">
        {row.original.codigoEspecie}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "nombreEspecie",
    header: "Especie",
    cell: ({ row }) => (
      <span className="text-xs">{row.original.nombreEspecie}</span>
    ),
    size: 150,
  },
  {
    accessorKey: "cantidaNroCont",
    header: "Cantidad",
    cell: ({ row }) => (
      <span className="text-xs font-medium">
        {row.original.cantidaNroCont ?? "-"}
      </span>
    ),
    size: 80,
  },
  {
    accessorKey: "fSiembra",
    header: "F. Siembra",
    cell: ({ row }) => (
      <span className="text-xs">
        {row.original.fSiembra
          ? new Date(row.original.fSiembra).toLocaleDateString("es-AR")
          : "-"}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "usuarioNombre",
    header: "Autorizado por",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] font-bold">
        {row.original.usuarioNombre}
      </Badge>
    ),
    size: 120,
  },
];

export const aSembrarExportColumns: ExportColumn<SiembraPartidaDto>[] = [
  { key: "partidaId", label: "Partida" },
  { key: "codigoEspecie", label: "Código" },
  { key: "nombreEspecie", label: "Especie" },
  { key: "cantidaNroCont", label: "Cantidad" },
  { key: "fSiembra", label: "F. Siembra" },
  { key: "usuarioNombre", label: "Autorizado por" },
];
```

- [ ] **Step 4: Create edit form**

`apps/frontend/src/features/aSembrar/components/a-sembrar-edit-form.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import {
  Activity,
  Gauge,
  Ruler,
  TestTubes,
  Wrench,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@radix-ui/react-label";
import {
  AsignarUbiSiembraCompletaDto,
  SiembraPartidaDto,
  UserProfileDto,
} from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TaskShift } from "@/features/taskshift/components/taskShift";
import { TratamientoSearch } from "@/features/siembra/components/tratamientoSearch";

interface ASembrarEditFormProps {
  onSubmit: (data: AsignarUbiSiembraCompletaDto) => Promise<void>;
  onCancel: () => void;
  form: UseFormReturn<AsignarUbiSiembraCompletaDto>;
  selectedPartida: SiembraPartidaDto;
}

export function ASembrarEditForm({
  onSubmit,
  form,
  selectedPartida,
}: ASembrarEditFormProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<UserProfileDto[]>(
    [],
  );

  const metodoMaquina = useWatch({
    name: "metodoMaquina",
    control: form.control,
  });

  const tratamientoSemilla = useWatch({
    name: "tratamientoSemilla",
    control: form.control,
  });

  useEffect(() => {
    form.setValue("startTime", startTime, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [startTime, form]);

  useEffect(() => {
    form.setValue("endTime", endTime, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [endTime, form]);

  useEffect(() => {
    form.setValue(
      "employeeUserIds",
      selectedEmployees.map((e) => e.id),
      { shouldValidate: true, shouldDirty: true },
    );
  }, [selectedEmployees, form]);

  return (
    <Form {...form}>
      <form
        id="a-sembrar-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-y-auto no-scrollbar pb-6"
      >
        {/* PRODUCT HEADER */}
        <div className="space-y-3 md:space-y-4 shrink-0">
          <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Activity className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                  {selectedPartida.codigoEspecie}
                </h2>
                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                  {selectedPartida.nombreEspecie}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TECHNICAL FIELDS */}
        <div className="space-y-3 md:space-y-4 shrink-0">
          {/* CANTIDAD DE BANDEJAS */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                  Bandejas Confirmadas
                </p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="cantidaNroCont"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-12 md:h-16 rounded-xl border-border/60 bg-background shadow-sm text-xl md:text-3xl font-black px-4"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* DATOS DE SIEMBRA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* CANTIDAD EN GRAMOS */}
            <FormField
              control={form.control}
              name="cantidadGrs"
              render={({ field }) => (
                <FormItem className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                      Cantidad (gr)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          field.onChange(0);
                          return;
                        }
                        field.onChange(Number(raw));
                      }}
                      className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AJUSTE */}
            <FormField
              control={form.control}
              name="ajuste"
              render={({ field }) => (
                <FormItem className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                      <Gauge className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                      Ajuste
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0"
                      {...field}
                      className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* PRESIÓN DE SEMILLA */}
            <FormField
              control={form.control}
              name="presionSemilla"
              render={({ field }) => (
                <FormItem className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                      <Gauge className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                      Presión de Semilla
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="40"
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          field.onChange(0);
                          return;
                        }
                        if (/^\d+$/.test(raw)) {
                          field.onChange(Number(raw));
                        }
                      }}
                      className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4"
                    />
                  </FormControl>
                  <FormDescription className="text-[9px] md:text-[10px] text-muted-foreground">
                    Solo números enteros - Por ej: 40
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PROFUNDIDAD DE SEMILLA */}
            <FormField
              control={form.control}
              name="profundidadSemilla"
              render={({ field }) => (
                <FormItem className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                      <Ruler className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                      Profundidad de Semilla
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="1.525"
                      {...field}
                      className="h-10 md:h-14 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4"
                    />
                  </FormControl>
                  <FormDescription className="text-[9px] md:text-[10px] text-muted-foreground">
                    Valor en cm - Por ej: 1.3, 1.525, 2
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* TRATAMIENTO */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                <TestTubes className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              </div>
              <Label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                Tratamiento
              </Label>
            </div>
            <TratamientoSearch
              value={tratamientoSemilla ?? ""}
              onChange={(codigo) =>
                form.setValue("tratamientoSemilla", codigo)
              }
            />
          </div>

          {/* MÉTODO */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                  <Wrench className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                  Método
                </p>
                <span
                  className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border transition-colors ${
                    metodoMaquina
                      ? "text-primary border-primary/20 bg-primary/10"
                      : "text-muted-foreground border-border/40 bg-muted/50"
                  }`}
                >
                  {metodoMaquina ? "Máquina" : "Manual"}
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch
                    checked={metodoMaquina}
                    onCheckedChange={(checked) =>
                      form.setValue("metodoMaquina", checked)
                    }
                    className="transition-colors border-primary/80 bg-primary/40"
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="border border-border shadow-md"
                >
                  <p>
                    {metodoMaquina ? "Siembra manual" : "Siembra mecánica"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* TASK SHIFT */}
        <TaskShift
          startTime={startTime}
          endTime={endTime}
          employees={selectedEmployees}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onEmployeesChange={setSelectedEmployees}
        />
      </form>
    </Form>
  );
}
```

- [ ] **Step 5: Create data table**

`apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx`:
```typescript
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useCallback } from "react";
import {
  AsignarUbiSiembraCompletaDto,
  AsignarUbiSiembraCompletaDtoSchema,
  SiembraPartidaDto,
  fieldLabels,
} from "@vivero/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { aSembrarColumns, aSembrarExportColumns } from "./columns";
import { ASembrarEditForm } from "./a-sembrar-edit-form";
import { useASembrarMutation } from "../hooks/useASembrarMutation";
import { useTableByName } from "@/features/permissions";

interface ASembrarDataTableProps {
  partidas: SiembraPartidaDto[];
}

export function ASembrarDataTable({ partidas }: ASembrarDataTableProps) {
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] =
    useState<SiembraPartidaDto | null>(null);

  const { mutateAsync: completarSiembra } = useASembrarMutation();
  const { data: entity } = useTableByName("a_sembrar");

  const formCompletar = useForm<AsignarUbiSiembraCompletaDto>({
    resolver: zodResolver(AsignarUbiSiembraCompletaDtoSchema),
  });

  const handleEdit = useCallback(
    (row: SiembraPartidaDto) => {
      setSelectedPartida(row);
      formCompletar.reset({
        partidaId: row.partidaId,
        anio: row.anio,
        indice: row.indice,
        cantidaNroCont: row.cantidaNroCont ?? 0,
        detalleExtendido: row.detalleExtendido ?? "",
        f_siembra: row.fSiembra ? new Date(row.fSiembra) : new Date(),
        edita: "S",
        lote: row.lote ?? 0,
        anoLote: row.anoLote ?? 0,
        item: row.item ?? 0,
        semxgr: row.semxgr ?? 0,
        ajuste: row.ajuste ?? "",
        cantidadGrs: row.cantidadGrs ?? 0,
        cg: row.cg ?? 0,
        presionSemilla: row.presionSemilla,
        profundidadSemilla: row.profundidadSemilla,
        metodoMaquina: row.metodoMaquina,
        tratamientoSemilla: row.tratamientoSemilla,
        entityId: entity.id,
      });
      setSlideOpen(true);
    },
    [formCompletar, entity],
  );

  const handleCompletar = async (
    formData: AsignarUbiSiembraCompletaDto,
  ) => {
    if (selectedPartida) {
      try {
        await completarSiembra({ id: selectedPartida.id, data: formData });
        setSlideOpen(false);
      } catch {}
    }
  };

  const handleOpenChange = useCallback((open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedPartida(null);
    }
  }, []);

  return (
    <>
      <DataTable
        columns={aSembrarColumns}
        data={partidas}
        title="A Sembrar"
        description="Partidas autorizadas pendientes de completar siembra"
        tableName="a_sembrar"
        totalCount={partidas.length}
        exportColumns={aSembrarExportColumns}
        onEdit={handleEdit}
        canExecuteLabel="Completar Siembra"
        columnLabels={fieldLabels.ASembrar}
      />

      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={`Completar Siembra — Partida Nº ${selectedPartida.partidaId}`}
          formId="a-sembrar-form"
          mode="edit"
          form={formCompletar}
          saveLabel="Completar Siembra"
          fieldLabels={fieldLabels.ASembrar}
          confirm={{
            title: "Confirmar siembra",
            description:
              "¿Deseas confirmar la completación de esta siembra?",
            label: "Completar Siembra",
          }}
        >
          <div className="space-y-2">
            <ASembrarEditForm
              form={formCompletar}
              onSubmit={handleCompletar}
              onCancel={() => setSlideOpen(false)}
              selectedPartida={selectedPartida}
            />
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
```

- [ ] **Step 6: Create view and dashboard**

`apps/frontend/src/features/aSembrar/components/a-sembrar-view.tsx`:
```typescript
"use client";

import { EmptyState } from "@/features/siembra/components/empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { aSembrarColumns } from "./columns";
import { ASembrarDataTable } from "./a-sembrar-data-table";
import { useASembrarPartidas } from "../hooks/useASembrarPartidas";
import { LoadingBoundary } from "@/components/common/loading-boundary";

function ASembrarList() {
  const { data: partidas, isFetching } = useASembrarPartidas();
  const hasData = partidas && partidas.length > 0;

  if (!hasData && !isFetching) {
    return (
      <EmptyState
        title="Sin partidas pendientes"
        description="No hay partidas autorizadas pendientes de completar siembra."
      />
    );
  }

  return <ASembrarDataTable partidas={partidas || []} />;
}

export function ASembrarView() {
  return (
    <div className="space-y-2">
      <LoadingBoundary
        skeleton={
          <DataTableSkeleton columnCount={aSembrarColumns.length} />
        }
      >
        <ASembrarList />
      </LoadingBoundary>
    </div>
  );
}
```

`apps/frontend/src/features/aSembrar/components/ASembrarDashboard.tsx`:
```typescript
import { ASembrarView } from "./a-sembrar-view";

export function ASembrarDashboard() {
  return <ASembrarView />;
}
```

- [ ] **Step 7: Create barrel export**

`apps/frontend/src/features/aSembrar/index.ts`:
```typescript
export { ASembrarDashboard } from "./components/ASembrarDashboard";
```

- [ ] **Step 8: Commit**

```bash
git add apps/frontend/src/features/aSembrar/
git commit -m "feat(frontend): create aSembrar feature with data table, edit form, hooks"
```

---

### Task 7: Frontend — Siembra Feature Refactor

**Files:**
- Modify: `apps/frontend/src/features/siembra/api/siembraService.ts`
- Modify: `apps/frontend/src/features/siembra/hooks/useSiembraPartidaMutation.ts`
- Modify: `apps/frontend/src/features/siembra/components/siembra-data-table.tsx`
- Modify: `apps/frontend/src/features/siembra/components/siembra-edit-form.tsx`

- [ ] **Step 1: Add `autorizarSiembra` to API service**

In `siembraService.ts`, add:
```typescript
autorizarSiembra: (data: { partidaId: number; anio: number; indice: number }) => {
  return clientFetch<SiembraPartidaDto>("l-partidas/autorizar-siembra", {
    method: "POST",
    body: JSON.stringify(data),
  });
},
```

Import `SiembraPartidaDto` from `@vivero/shared`.

- [ ] **Step 2: Add autorizacion mutation hook**

In `useSiembraPartidaMutation.ts`, add a new export:
```typescript
export const useSiembraAutorizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: siembraService.autorizarSiembra,
    onSuccess: () => {
      invalidateQueries(queryClient, "siembraPartida");
      toast.success("Partida autorizada para siembra", { duration: 3000 });
    },
  });
};
```

- [ ] **Step 3: Add "Autorizar" action to data table**

In `siembra-data-table.tsx`, add import for `useSiembraAutorizacion` and add a new action. The "Autorizar" button should be gated by `siembra:create` permission. When clicked, it sends only the partida header `(partidaId, anio, indice)` to create the `SiembraPartidas` record.

The form fields (camera, date, quantity, lot) shown in the authorization slide-over are **display-only context** from the legacy database — they help User A confirm which partida they're authorizing, but the submit payload is just the header.

Add to the `DataTable` component props:
```typescript
onExecute={handleAutorizar}
canExecuteLabel="Autorizar Siembra"
```

The `handleAutorizar` function:
```typescript
const { mutateAsync: autorizarSiembra } = useSiembraAutorizacion();

const handleAutorizar = useCallback(async (row: SiembraDto) => {
  try {
    await autorizarSiembra({
      partidaId: row.partidaId,
      anio: row.anio,
      indice: row.indice,
    });
  } catch {}
}, [autorizarSiembra]);
```

- [ ] **Step 4: Refactor `siembra-edit-form.tsx` to show only preliminary fields**

Remove the technical fields section (presionSemilla, profundidadSemilla, tratamientoSemilla, metodoMaquina, cantidadGrs, ajuste, TaskShift). Keep only:

- Product header (codigoEspecie, nombreEspecie)
- Camera (cg) — Select
- Fecha de Siembra (f_siembra) — date input
- Bandejas Confirmadas (cantidaNroCont) — number input
- Submit button: "Autorizar Siembra"

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/siembra/
git commit -m "feat(frontend): add autorizar action to siembra, refactor edit form to preliminary fields only"
```

---

### Task 8: Wire Up — App Router Page

**Files:**
- Create: `apps/frontend/src/app/(main)/a-sembrar/page.tsx`

- [ ] **Step 1: Create page component**

```typescript
import { ASembrarDashboard } from "@/features/aSembrar";

export default function ASembrarPage() {
  return <ASembrarDashboard />;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/app/\(main\)/a-sembrar/
git commit -m "feat(frontend): add a-sembrar page route"
```

---

### Task 9: Verification

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

- [ ] **Step 2: Run type-check**

```bash
pnpm type-check
```

- [ ] **Step 3: Run tests**

```bash
pnpm test
```

- [ ] **Step 4: Build shared package**

```bash
pnpm --filter @vivero/shared build
```

- [ ] **Step 5: Verify dev server starts**

```bash
pnpm dev
```

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -A && git commit -m "fix: resolve lint and type-check issues for a-sembrar feature"
```
