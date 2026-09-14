# Siembra Partidas Registradas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only DataTable view at `/siembra/partidas-registradas` that displays all `siembra_partidas` records with resolved mezcla composition and usernames.

**Architecture:** Extend the backend `SiembraPartidaDto` with resolved names (`mezclaNombre`, `usuarioNombre`), update the Prisma query to include relations, and create a new frontend feature following the existing `siembra` pattern.

**Tech Stack:** NestJS, Prisma, MariaDB, Next.js 16, React, TanStack Table, react-hook-form, Zod, Tailwind CSS, shadcn/ui

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `packages/shared/src/schemas/siembraPartida.schema.ts` | Add `mezclaNombre`, `usuarioNombre` to DTO |
| Modify | `apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts` | Override `findAll` with `include` for relations |
| Modify | `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts` | Update `mapToDto` to use resolved names |
| Create | `apps/frontend/src/features/siembraPartidas/index.ts` | Public API exports |
| Create | `apps/frontend/src/features/siembraPartidas/api/siembraPartidasRegistradasService.ts` | API service |
| Create | `apps/frontend/src/features/siembraPartidas/hooks/useSiembraPartidasRegistradas.ts` | Data fetching hook |
| Create | `apps/frontend/src/features/siembraPartidas/components/SiembraPartidasRegistradasDashboard.tsx` | Dashboard wrapper |
| Create | `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-dashboard-skeleton.tsx` | Loading skeleton |
| Create | `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view.tsx` | Main view with Suspense |
| Create | `apps/frontend/src/features/siembraPartidas/components/columns.tsx` | Column definitions |
| Create | `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-data-table.tsx` | DataTable + SlideOverForm |
| Create | `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx` | Read-only detail panel |
| Create | `apps/frontend/src/app/(dashboard)/siembra/partidas-registradas/page.tsx` | Route page |
| Create | `apps/frontend/src/app/(dashboard)/siembra/partidas-registradas/loading.tsx` | Route loading |
| Modify | `apps/frontend/src/lib/queryKeys.ts` | Add query key for siembra partidas registradas |
| Modify | `apps/frontend/src/lib/config/navigations.ts` | Add sidebar entry |
| Modify | `apps/frontend/src/constants/routes.ts` | Add route constant |

---

### Task 1: Extend Shared DTO Schema

**Files:**
- Modify: `packages/shared/src/schemas/siembraPartida.schema.ts`

**Interfaces:**
- Produces: `SiembraPartidaDto` with `mezclaNombre: string` and `usuarioNombre: string`

- [ ] **Step 1: Add resolved fields to `SiembraPartidaSchema`**

In `packages/shared/src/schemas/siembraPartida.schema.ts`, add two fields to `SiembraPartidaSchema`:

```ts
export const SiembraPartidaSchema = PartidaHeaderSchema.extend({
  id: requiredCuid("El registro de siembra"),
  metodoMaquina: z.boolean({ message: "El método/máquina es requerido" }),
  presionSemilla: z
    .number({ message: "La presión de semilla es requerida" })
    .int({ message: "La presión de semilla debe ser un número entero" }),
  profundidadSemilla: ProfundidadSemillaSchema,
  tratamientoSemilla: z.string({
    message: "El tratamiento de semilla es requerido",
  }).min(1, { message: "El tratamiento de semilla es requerido" }),
  mezclaId: requiredCuid("La mezcla"),
  userId: requiredCuid("El usuario"),
  mezclaNombre: z.string(),
  usuarioNombre: z.string(),
});
```

- [ ] **Step 2: Build shared package and verify**

Run: `pnpm --filter @vivero/shared build`
Expected: Builds without errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/schemas/siembraPartida.schema.ts
git commit -m "feat(shared): add resolved name fields to SiembraPartidaDto"
```

---

### Task 2: Update Backend Repository to Include Relations

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts`

**Interfaces:**
- Consumes: `SiembraPartidas` Prisma model with `mezcla` (sustrato1-4) and `user` relations
- Produces: `findAll` returns `SiembraPartidas` with included relations

- [ ] **Step 1: Override `findAll` with `include` for relations**

The `BaseRepository.findAll` uses `this.model.findMany()` without includes. Override it in `SiembraPartidasRepository`:

```ts
// src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { Prisma, SiembraPartidas } from '../../../generated/prisma/client';

export type SiembraPartidasWithRelations = SiembraPartidas & {
  mezcla: {
    sustrato1: { nombre: string } | null;
    porcentaje1: number | null;
    sustrato2: { nombre: string } | null;
    porcentaje2: number | null;
    sustrato3: { nombre: string } | null;
    porcentaje3: number | null;
    sustrato4: { nombre: string } | null;
    porcentaje4: number | null;
  };
  user: { username: string };
};

@Injectable()
export class SiembraPartidasRepository extends BaseRepository<SiembraPartidas> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.siembraPartidas);
  }

  async createSiembraPartida(data: Prisma.SiembraPartidasCreateInput) {
    return this.model.create({
      data: {
        ...data,
      },
    });
  }

  override async findAll(
    requesterId: string,
  ): Promise<SiembraPartidasWithRelations[]> {
    const devIds = await this.getDevAccounts();

    return this.prisma.siembraPartidas.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...(devIds.includes(requesterId)
          ? {}
          : { id: { notIn: devIds } }),
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
    });
  }
}
```

- [ ] **Step 2: Run type-check to verify**

Run: `pnpm --filter backend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts
git commit -m "feat(backend): include mezcla and user relations in siembraPartidas query"
```

---

### Task 3: Update Backend Service to Map Resolved Names

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`

**Interfaces:**
- Consumes: `SiembraPartidasWithRelations` from repository
- Produces: `SiembraPartidaDto` with `mezclaNombre` and `usuarioNombre`

- [ ] **Step 1: Add `buildMezclaNombre` helper and update `mapToDto`**

```ts
// src/modules/siembraPartidas/siembraPartidas.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { SiembraPartidasRepository, SiembraPartidasWithRelations } from './repositories/siembraPartidas.repository';
import { CreateSiembraPartidaDto, SiembraPartidaDto } from '@vivero/shared';
import { PrismaService } from '../../infra/prisma/prisma.service';

const GENERIC_SUSTRATO_NAME = 'Sustrato Genérico';
const GENERIC_MEZCLA_SUSTRATO1_ID = 'c00000000000000000000001';

@Injectable()
export class SiembraPartidasService {
  constructor(
    private readonly repo: SiembraPartidasRepository,
    private readonly prisma: PrismaService,
  ) {}

  private async getOrCreateGenericMezcla(): Promise<string> {
    const sustrato = await this.prisma.sustratos.upsert({
      where: { nombre: GENERIC_SUSTRATO_NAME },
      update: {},
      create: {
        id: GENERIC_MEZCLA_SUSTRATO1_ID,
        nombre: GENERIC_SUSTRATO_NAME,
      },
    });

    const mezcla = await this.prisma.mezcla.upsert({
      where: { id: 'c00000000000000000000002' },
      update: {},
      create: {
        id: 'c00000000000000000000002',
        sustrato1Id: sustrato.id,
        porcentaje1: 100,
      },
    });

    return mezcla.id;
  }

  private buildMezclaNombre(
    mezcla: SiembraPartidasWithRelations['mezcla'],
  ): string {
    const parts: string[] = [];
    if (mezcla.sustrato1 && mezcla.porcentaje1 != null) {
      parts.push(`${mezcla.sustrato1.nombre} (${mezcla.porcentaje1}%)`);
    }
    if (mezcla.sustrato2 && mezcla.porcentaje2 != null) {
      parts.push(`${mezcla.sustrato2.nombre} (${mezcla.porcentaje2}%)`);
    }
    if (mezcla.sustrato3 && mezcla.porcentaje3 != null) {
      parts.push(`${mezcla.sustrato3.nombre} (${mezcla.porcentaje3}%)`);
    }
    if (mezcla.sustrato4 && mezcla.porcentaje4 != null) {
      parts.push(`${mezcla.sustrato4.nombre} (${mezcla.porcentaje4}%)`);
    }
    return parts.length > 0 ? parts.join(' + ') : 'Sin mezcla';
  }

  private mapToDto(row: SiembraPartidasWithRelations): SiembraPartidaDto {
    return {
      id: row.id,
      partidaId: row.partidaId,
      anio: row.anio,
      indice: row.indice,
      metodoMaquina: row.metodoMaquina,
      presionSemilla: row.presionSemilla,
      profundidadSemilla: row.profundidadSemilla.toString(),
      tratamientoSemilla: row.tratamientoSemilla,
      mezclaId: row.mezclaId,
      userId: row.userId,
      mezclaNombre: this.buildMezclaNombre(row.mezcla),
      usuarioNombre: row.user.username,
    };
  }

  async getAllSiembraPartidas(
    requesterId: string,
  ): Promise<SiembraPartidaDto[]> {
    const rows = await this.repo.findAll(requesterId);
    return rows.map((row) => this.mapToDto(row));
  }

  async getSiembraPartidaById(
    id: string,
    requesterId: string,
  ): Promise<SiembraPartidaDto> {
    const siembraPartida = await this.repo.findById(id, requesterId);
    if (!siembraPartida)
      throw new NotFoundException('SiembraPartida not found');
    return this.mapToDto(siembraPartida as SiembraPartidasWithRelations);
  }

  async createSiembraPartida(
    data: CreateSiembraPartidaDto,
    requesterId: string,
  ): Promise<SiembraPartidaDto> {
    const mezclaId = data.mezclaId ?? (await this.getOrCreateGenericMezcla());

    const row = await this.repo.createSiembraPartida({
      partidaId: data.partidaId,
      anio: data.anio,
      indice: data.indice,
      metodoMaquina: data.metodoMaquina,
      presionSemilla: data.presionSemilla,
      profundidadSemilla: data.profundidadSemilla,
      tratamientoSemilla: data.tratamientoSemilla,
      mezcla: {
        connect: {
          id: mezclaId,
        },
      },
      user: {
        connect: {
          id: requesterId,
        },
      },
    });

    // Re-fetch with relations for DTO mapping
    const full = await this.repo.findById(row.id, requesterId);
    return this.mapToDto(full as SiembraPartidasWithRelations);
  }
}
```

- [ ] **Step 2: Run type-check to verify**

Run: `pnpm --filter backend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts
git commit -m "feat(backend): map resolved mezcla and user names in siembraPartidas service"
```

---

### Task 4: Add Query Key and Route Constant

**Files:**
- Modify: `apps/frontend/src/lib/queryKeys.ts`
- Modify: `apps/frontend/src/constants/routes.ts`

**Interfaces:**
- Produces: `siembraPartidasRegistradasQueryKeys.all()` and `ROUTES.SIEMBRA_PARTIDAS_REGISTRADAS`

- [ ] **Step 1: Add query key**

In `apps/frontend/src/lib/queryKeys.ts`, add after `siembraQueryKeys`:

```ts
export const siembraPartidasRegistradasQueryKeys = {
  all: () => ["siembraPartidasRegistradas"] as const,
};
```

- [ ] **Step 2: Add route constant**

In `apps/frontend/src/constants/routes.ts`, add:

```ts
SIEMBRA_PARTIDAS_REGISTRADAS: "/siembra/partidas-registradas",
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/lib/queryKeys.ts apps/frontend/src/constants/routes.ts
git commit -m "feat(frontend): add query key and route for siembra partidas registradas"
```

---

### Task 5: Create Frontend API Service and Hook

**Files:**
- Create: `apps/frontend/src/features/siembraPartidas/api/siembraPartidasRegistradasService.ts`
- Create: `apps/frontend/src/features/siembraPartidas/hooks/useSiembraPartidasRegistradas.ts`
- Create: `apps/frontend/src/features/siembraPartidas/index.ts`

**Interfaces:**
- Consumes: `SiembraPartidaDto` from `@vivero/shared`
- Produces: `siembraPartidasRegistradasService.fetchAll()` and `useSiembraPartidasRegistradas()`

- [ ] **Step 1: Create API service**

```ts
// src/features/siembraPartidas/api/siembraPartidasRegistradasService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { SiembraPartidaDto } from "@vivero/shared";

export const siembraPartidasRegistradasService = {
  fetchAll: () =>
    clientFetch<SiembraPartidaDto[]>("siembra-partidas", { method: "GET" }),
};
```

- [ ] **Step 2: Create hook**

```ts
// src/features/siembraPartidas/hooks/useSiembraPartidasRegistradas.ts
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { SiembraPartidaDto } from "@vivero/shared";
import { siembraPartidasRegistradasService } from "../api/siembraPartidasRegistradasService";
import { siembraPartidasRegistradasQueryKeys } from "@/lib/queryKeys";

export function useSiembraPartidasRegistradas() {
  return useSuspenseQuery<SiembraPartidaDto[]>({
    queryKey: siembraPartidasRegistradasQueryKeys.all(),
    queryFn: siembraPartidasRegistradasService.fetchAll,
  });
}
```

- [ ] **Step 3: Create index file**

```ts
// src/features/siembraPartidas/index.ts

export { SiembraPartidasRegistradasDashboard } from "./components/SiembraPartidasRegistradasDashboard";
export { SiembraPartidasRegistradasDashboardSkeleton } from "./components/siembra-partidas-registradas-dashboard-skeleton";
```

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/siembraPartidas/
git commit -m "feat(frontend): add siembraPartidas API service, hook, and index"
```

---

### Task 6: Create Frontend Column Definitions

**Files:**
- Create: `apps/frontend/src/features/siembraPartidas/components/columns.tsx`

**Interfaces:**
- Consumes: `SiembraPartidaDto` from `@vivero/shared`
- Produces: `siembraPartidasRegistradasColumns` for DataTable

- [ ] **Step 1: Create columns**

```ts
// src/features/siembraPartidas/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { SiembraPartidaDto } from "@vivero/shared";

export const siembraPartidasRegistradasColumns: ColumnDef<SiembraPartidaDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => (
      <SortableHeader column={column}>Partida</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-black text-sm text-foreground/80 tracking-tight">
        #{row.original.partidaId}
        {row.original.indice !== 0 && `/ ${row.original.indice}`}
      </div>
    ),
    size: 70,
  },
  {
    accessorKey: "anio",
    header: ({ column }) => (
      <SortableHeader column={column}>Año</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">{row.original.anio}</span>
    ),
    size: 60,
  },
  {
    accessorKey: "metodoMaquina",
    header: ({ column }) => (
      <SortableHeader column={column}>Método</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {row.original.metodoMaquina ? "Máquina" : "Manual"}
      </span>
    ),
    size: 80,
  },
  {
    accessorKey: "presionSemilla",
    header: ({ column }) => (
      <SortableHeader column={column}>Presión (PSI)</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm tabular-nums">
        {row.original.presionSemilla}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "profundidadSemilla",
    header: ({ column }) => (
      <SortableHeader column={column}>Profundidad (cm)</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm tabular-nums">
        {row.original.profundidadSemilla}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "tratamientoSemilla",
    header: ({ column }) => (
      <SortableHeader column={column}>Tratamiento</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {row.original.tratamientoSemilla || "-"}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "mezclaNombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Mezcla</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {row.original.mezclaNombre}
      </span>
    ),
  },
  {
    accessorKey: "usuarioNombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Usuario</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {row.original.usuarioNombre}
      </span>
    ),
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/siembraPartidas/components/columns.tsx
git commit -m "feat(frontend): add DataTable columns for siembra partidas registradas"
```

---

### Task 7: Create ViewForm (Read-Only Detail Panel)

**Files:**
- Create: `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx`

**Interfaces:**
- Consumes: `SiembraPartidaDto`
- Produces: `SiembraPartidasRegistradasViewForm` component

- [ ] **Step 1: Create view form**

```ts
// src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx

import { Card, CardContent } from "@/components/ui/card";
import { SiembraPartidaDto } from "@vivero/shared";
import {
  Package,
  Hash,
  Activity,
  Cog,
  User,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SiembraPartidasRegistradasViewFormProps {
  selectedPartida: SiembraPartidaDto;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  value?: string | number | null;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 md:gap-4 py-2 md:py-3 border-b border-border/40 last:border-0",
      className,
    )}
  >
    <div className="p-1.5 md:p-2 bg-primary/5 rounded-lg border border-primary/10">
      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1 md:mb-1.5">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-xs md:text-base font-bold truncate text-foreground">
          {value ?? "-"}
        </p>
      </div>
    </div>
  </div>
);

export function SiembraPartidasRegistradasViewForm({
  selectedPartida,
}: SiembraPartidasRegistradasViewFormProps) {
  return (
    <div className="flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden">
      {/* HEADER */}
      <div className="space-y-3 md:space-y-4 shrink-0">
        <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                Partida #{selectedPartida.partidaId}
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                {selectedPartida.mezclaNombre}
              </p>
            </div>
          </div>
        </div>

        {/* SPECS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Año", value: selectedPartida.anio, icon: Hash },
            { label: "Índice", value: selectedPartida.indice, icon: Hash },
            {
              label: "Método",
              value: selectedPartida.metodoMaquina ? "Máquina" : "Manual",
              icon: Cog,
            },
            {
              label: "Presión",
              value: `${selectedPartida.presionSemilla} PSI`,
              icon: Activity,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-background border border-border/60 p-1.5 md:p-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2.5 shadow-sm overflow-hidden"
            >
              <div className="p-1 md:p-1.5 bg-muted rounded-md shrink-0">
                <item.icon className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[7px] md:text-[8px] font-bold uppercase leading-none mb-0.5">
                  {item.label}
                </p>
                <p className="text-[10px] md:text-xs truncate uppercase font-bold">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DATA CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
        <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
            <InfoRow
              icon={FlaskConical}
              label="Mezcla"
              value={selectedPartida.mezclaNombre}
              className="border-primary/5"
            />
            <InfoRow
              icon={Activity}
              label="Profundidad"
              value={`${selectedPartida.profundidadSemilla} cm`}
            />
            <InfoRow
              icon={Package}
              label="Tratamiento"
              value={selectedPartida.tratamientoSemilla || "-"}
            />
            <InfoRow
              icon={User}
              label="Usuario"
              value={selectedPartida.usuarioNombre}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx
git commit -m "feat(frontend): add read-only view form for siembra partidas registradas"
```

---

### Task 8: Create DataTable, View, Dashboard, and Skeleton

**Files:**
- Create: `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-data-table.tsx`
- Create: `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view.tsx`
- Create: `apps/frontend/src/features/siembraPartidas/components/SiembraPartidasRegistradasDashboard.tsx`
- Create: `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-dashboard-skeleton.tsx`

**Interfaces:**
- Consumes: `SiembraPartidaDto[]`, `siembraPartidasRegistradasColumns`
- Produces: Full component tree

- [ ] **Step 1: Create DataTable component**

```ts
// src/features/siembraPartidas/components/siembra-partidas-registradas-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useCallback } from "react";
import { SiembraPartidaDto, fieldLabels } from "@vivero/shared";
import { siembraPartidasRegistradasColumns } from "./columns";
import { SiembraPartidasRegistradasViewForm } from "./siembra-partidas-registradas-view-form";

interface SiembraPartidasRegistradasDataTableProps {
  partidas: SiembraPartidaDto[];
}

export function SiembraPartidasRegistradasDataTable({
  partidas,
}: SiembraPartidasRegistradasDataTableProps) {
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] =
    useState<SiembraPartidaDto | null>(null);

  const handleView = useCallback((row: SiembraPartidaDto) => {
    setSelectedPartida(row);
    setSlideOpen(true);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedPartida(null);
    }
  }, []);

  return (
    <>
      <DataTable
        columns={siembraPartidasRegistradasColumns}
        data={partidas}
        title="Partidas Registradas"
        description="Partidas con datos de siembra registrados en el sistema"
        tableName="siembra"
        totalCount={partidas.length}
        onView={handleView}
      />

      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={`Partida Nº ${selectedPartida.partidaId}`}
          formId="siembra-partidas-registradas-form"
          mode="view"
          fieldLabels={fieldLabels.SiembraPartida}
        >
          <SiembraPartidasRegistradasViewForm
            selectedPartida={selectedPartida}
          />
        </SlideOverForm>
      )}
    </>
  );
}
```

- [ ] **Step 2: Create View component**

```ts
// src/features/siembraPartidas/components/siembra-partidas-registradas-view.tsx
"use client";

import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { siembraPartidasRegistradasColumns } from "./columns";
import { SiembraPartidasRegistradasDataTable } from "./siembra-partidas-registradas-data-table";
import { useSiembraPartidasRegistradas } from "../hooks/useSiembraPartidasRegistradas";

function SiembraPartidasRegistradasList() {
  const { data: partidas } = useSiembraPartidasRegistradas();
  return <SiembraPartidasRegistradasDataTable partidas={partidas || []} />;
}

export function SiembraPartidasRegistradasView() {
  return (
    <div className="space-y-2">
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={siembraPartidasRegistradasColumns.length}
          />
        }
      >
        <SiembraPartidasRegistradasList />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 3: Create Dashboard component**

```ts
// src/features/siembraPartidas/components/SiembraPartidasRegistradasDashboard.tsx

import { SiembraPartidasRegistradasView } from "./siembra-partidas-registradas-view";

export function SiembraPartidasRegistradasDashboard() {
  return <SiembraPartidasRegistradasView />;
}
```

- [ ] **Step 4: Create Skeleton component**

```ts
// src/features/siembraPartidas/components/siembra-partidas-registradas-dashboard-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { siembraPartidasRegistradasColumns } from "./columns";

export function SiembraPartidasRegistradasDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <DataTableSkeleton
        columnCount={siembraPartidasRegistradasColumns.length}
      />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/siembraPartidas/components/
git commit -m "feat(frontend): add DataTable, View, Dashboard, and Skeleton components"
```

---

### Task 9: Create Route Pages

**Files:**
- Create: `apps/frontend/src/app/(dashboard)/siembra/partidas-registradas/page.tsx`
- Create: `apps/frontend/src/app/(dashboard)/siembra/partidas-registradas/loading.tsx`

**Interfaces:**
- Consumes: `SiembraPartidasRegistradasDashboard`, `SiembraPartidasRegistradasDashboardSkeleton`

- [ ] **Step 1: Create page**

```tsx
// src/app/(dashboard)/siembra/partidas-registradas/page.tsx

import { SiembraPartidasRegistradasDashboard } from "@/features/siembraPartidas";

export const dynamic = "force-dynamic";

export default function SiembraPartidasRegistradasPage() {
  return <SiembraPartidasRegistradasDashboard />;
}
```

- [ ] **Step 2: Create loading**

```tsx
// src/app/(dashboard)/siembra/partidas-registradas/loading.tsx

import { SiembraPartidasRegistradasDashboardSkeleton } from "@/features/siembraPartidas";

export default function Loading() {
  return <SiembraPartidasRegistradasDashboardSkeleton />;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/\(dashboard\)/siembra/partidas-registradas/
git commit -m "feat(frontend): add route pages for siembra partidas registradas"
```

---

### Task 10: Add Sidebar Navigation Entry

**Files:**
- Modify: `apps/frontend/src/lib/config/navigations.ts`

**Interfaces:**
- Consumes: `ROUTES.SIEMBRA_PARTIDAS_REGISTRADAS`

- [ ] **Step 1: Add navigation item under the Siembra section**

In `apps/frontend/src/lib/config/navigations.ts`, inside the `partidas` group, add a new item after the `Siembra` entry:

```ts
{
  title: "Partidas Registradas",
  href: ROUTES.SIEMBRA_PARTIDAS_REGISTRADAS,
  icon: ClipboardList,
  description: "Partidas con siembra registrada en el sistema",
  dashboard: { statsLabel: "Partidas registradas" },
  requiredPermission: { table: "siembra", action: "read" },
},
```

Also add `ClipboardList` to the import from `lucide-react` if not already present.

- [ ] **Step 2: Run lint and type-check**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/lib/config/navigations.ts
git commit -m "feat(frontend): add sidebar entry for siembra partidas registradas"
```

---

### Task 11: Final Verification

- [ ] **Step 1: Run full verification**

Run: `pnpm lint && pnpm type-check && pnpm test`
Expected: All pass

- [ ] **Step 2: Manual test**

1. Start dev server: `pnpm dev`
2. Navigate to `/siembra/partidas-registradas`
3. Verify DataTable renders with columns
4. Click a row to open detail panel
5. Verify resolved mezcla and user names display

- [ ] **Step 3: Final commit if needed**

```bash
git add .
git commit -m "chore: final cleanup for siembra partidas registradas feature"
```
