# Mezclas Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the frontend for the mezcla (mixture) module — list, create, and view detail.

**Architecture:** Follow the existing sustratos feature pattern: feature folder with `api/`, `hooks/`, `components/`, `index.ts`. Uses `clientFetch` for API calls, `@tanstack/react-query` for state management, shadcn/ui for components, and `react-hook-form` + Zod for form validation. Backend extended to include sustrato names in the response.

**Tech Stack:** Next.js 16 (App Router), React, TypeScript, shadcn/ui, Tailwind CSS v4, react-hook-form, @tanstack/react-query, Zod, lucide-react

## Global Constraints

- Spanish UI copy throughout (labels, descriptions, toasts)
- shadcn/ui components from `@/components/ui/`
- Form validation via `zodResolver` with shared Zod schemas from `@vivero/shared`
- Query keys in `src/lib/queryKeys.ts`, invalidation in `src/lib/query-invalidation-map.ts`
- `"use client"` directive on interactive components
- Follow existing code style: `// filepath comment` at top of files
- Percentage validation: `.refine()` on `CreateMezclaSchema` ensuring sum = 100%

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Modify | `packages/shared/src/schemas/mezcla.schema.ts` | Extend MezclaDto, add validation |
| Modify | `apps/backend/src/modules/mezcla/repositories/mezcla.repository.ts` | Add include for sustrato relations |
| Modify | `apps/backend/src/modules/mezcla/mezcla.service.ts` | Map relation names to DTO |
| Modify | `apps/frontend/src/constants/routes.ts` | Add MEZCLAS route |
| Modify | `apps/frontend/src/lib/queryKeys.ts` | Add mezclaQueryKeys |
| Modify | `apps/frontend/src/lib/query-invalidation-map.ts` | Add createMezcla |
| Create | `apps/frontend/src/features/mezclas/api/mezclaService.ts` | API calls (fetchAll, create) |
| Create | `apps/frontend/src/features/mezclas/hooks/useMezclas.ts` | React Query hooks |
| Create | `apps/frontend/src/features/mezclas/components/columns.tsx` | DataTable column definitions |
| Create | `apps/frontend/src/features/mezclas/components/mezcla-create-form.tsx` | Create form (4 slots + calculator) |
| Create | `apps/frontend/src/features/mezclas/components/mezcla-view-form.tsx` | View detail form |
| Create | `apps/frontend/src/features/mezclas/components/mezcla-data-table.tsx` | DataTable + SlideOverForm orchestrator |
| Create | `apps/frontend/src/features/mezclas/components/MezclasDashboard.tsx` | Dashboard wrapper with Suspense |
| Create | `apps/frontend/src/features/mezclas/index.ts` | Public exports |
| Create | `apps/frontend/src/app/(dashboard)/mezclas/page.tsx` | Route page |
| Modify | `apps/frontend/src/lib/config/navigations.ts` | Add Mezclas sub-item under Sustratos |
| Create | `apps/frontend/src/features/mezclas/__tests__/mezclaService.test.ts` | Service tests |
| Create | `apps/frontend/src/features/mezclas/components/__tests__/mezcla-view-form.test.tsx` | View form tests |
| Create | `apps/frontend/src/features/mezclas/components/__tests__/mezcla-data-table.test.tsx` | Data table tests |

---

### Task 1: Extend shared schema with sustrato names and validation

**Files:**
- Modify: `packages/shared/src/schemas/mezcla.schema.ts`

**Interfaces:**
- Produces: Extended `MezclaDto` with `sustratoXNombre`, `isActive`, `createdAt`; refined `CreateMezclaSchema`

- [ ] **Step 1: Extend MezclaSchema**

```ts
// packages/shared/src/schemas/mezcla.schema.ts
import { z } from "zod";

export const MezclaSchema = z.object({
  id: z.string(),
  sustrato1Id: z.string(),
  sustrato1Nombre: z.string(),
  porcentaje1: z.number(),
  sustrato2Id: z.string().nullable(),
  sustrato2Nombre: z.string().nullable(),
  porcentaje2: z.number().nullable(),
  sustrato3Id: z.string().nullable(),
  sustrato3Nombre: z.string().nullable(),
  porcentaje3: z.number().nullable(),
  sustrato4Id: z.string().nullable(),
  sustrato4Nombre: z.string().nullable(),
  porcentaje4: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type MezclaDto = z.infer<typeof MezclaSchema>;

export const CreateMezclaSchema = z
  .object({
    sustrato1Id: z.string(),
    porcentaje1: z.number(),
    sustrato2Id: z.string().nullable(),
    porcentaje2: z.number().nullable(),
    sustrato3Id: z.string().nullable(),
    porcentaje3: z.number().nullable(),
    sustrato4Id: z.string().nullable(),
    porcentaje4: z.number().nullable(),
  })
  .refine(
    (data) => {
      const total =
        data.porcentaje1 +
        (data.porcentaje2 ?? 0) +
        (data.porcentaje3 ?? 0) +
        (data.porcentaje4 ?? 0);
      return total === 100;
    },
    { message: "Los porcentajes deben sumar 100%" },
  );

export type CreateMezclaDto = z.infer<typeof CreateMezclaSchema>;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter @vivero/shared build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/schemas/mezcla.schema.ts
git commit -m "feat(mezcla): extend schema with sustrato names, isActive, createdAt, and 100% validation"
```

---

### Task 2: Update backend repository and service

**Files:**
- Modify: `apps/backend/src/modules/mezcla/repositories/mezcla.repository.ts`
- Modify: `apps/backend/src/modules/mezcla/mezcla.service.ts`

**Interfaces:**
- Consumes: Extended `MezclaDto` from shared schema
- Produces: Repository with sustrato includes, service with name mapping

- [ ] **Step 1: Update repository with includes**

```ts
// apps/backend/src/modules/mezcla/repositories/mezcla.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { Mezcla } from '../../../generated/prisma/client';
import { MezclaDto } from '@vivero/shared';

@Injectable()
export class MezclaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(requesterId: string): Promise<MezclaDto[]> {
    const rows = await this.prisma.mezcla.findMany({
      where: { deletedAt: null },
      include: {
        sustrato1: { select: { nombre: true } },
        sustrato2: { select: { nombre: true } },
        sustrato3: { select: { nombre: true } },
        sustrato4: { select: { nombre: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      sustrato1Id: r.sustrato1Id,
      sustrato1Nombre: r.sustrato1.nombre,
      porcentaje1: r.porcentaje1,
      sustrato2Id: r.sustrato2Id,
      sustrato2Nombre: r.sustrato2?.nombre ?? null,
      porcentaje2: r.porcentaje2,
      sustrato3Id: r.sustrato3Id,
      sustrato3Nombre: r.sustrato3?.nombre ?? null,
      porcentaje3: r.porcentaje3,
      sustrato4Id: r.sustrato4Id,
      sustrato4Nombre: r.sustrato4?.nombre ?? null,
      porcentaje4: r.porcentaje4,
      isActive: r.isActive,
      createdAt: r.createdAt,
    }));
  }

  async findById(id: string, requesterId: string): Promise<MezclaDto | null> {
    const row = await this.prisma.mezcla.findUnique({
      where: { id },
      include: {
        sustrato1: { select: { nombre: true } },
        sustrato2: { select: { nombre: true } },
        sustrato3: { select: { nombre: true } },
        sustrato4: { select: { nombre: true } },
      },
    });

    if (!row || row.deletedAt) return null;

    return {
      id: row.id,
      sustrato1Id: row.sustrato1Id,
      sustrato1Nombre: row.sustrato1.nombre,
      porcentaje1: row.porcentaje1,
      sustrato2Id: row.sustrato2Id,
      sustrato2Nombre: row.sustrato2?.nombre ?? null,
      porcentaje2: row.porcentaje2,
      sustrato3Id: row.sustrato3Id,
      sustrato3Nombre: row.sustrato3?.nombre ?? null,
      porcentaje3: row.porcentaje3,
      sustrato4Id: row.sustrato4Id,
      sustrato4Nombre: row.sustrato4?.nombre ?? null,
      porcentaje4: row.porcentaje4,
      isActive: row.isActive,
      createdAt: row.createdAt,
    };
  }

  async create(data: CreateMezclaDto) {
    return this.prisma.mezcla.create({ data });
  }
}
```

- [ ] **Step 2: Update service**

```ts
// apps/backend/src/modules/mezcla/mezcla.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { MezclaRepository } from './repositories/mezcla.repository';
import { CreateMezclaDto, MezclaDto } from '@vivero/shared';

@Injectable()
export class MezclaService {
  constructor(private readonly repo: MezclaRepository) {}

  async getAllMezcla(requesterId: string): Promise<MezclaDto[]> {
    return this.repo.findAll(requesterId);
  }

  async getMezclaById(id: string, requesterId: string): Promise<MezclaDto> {
    const mezcla = await this.repo.findById(id, requesterId);
    if (!mezcla) throw new NotFoundException('Mezcla not found');
    return mezcla;
  }

  async createMezcla(data: CreateMezclaDto) {
    return this.repo.create(data);
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm --filter backend type-check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/mezcla/repositories/mezcla.repository.ts apps/backend/src/modules/mezcla/mezcla.service.ts
git commit -m "feat(mezcla): update repository with sustrato includes and name mapping"
```

---

### Task 3: Add route constant and query keys

**Files:**
- Modify: `apps/frontend/src/constants/routes.ts:1-15`
- Modify: `apps/frontend/src/lib/queryKeys.ts:1-175`
- Modify: `apps/frontend/src/lib/query-invalidation-map.ts:1-152`

**Interfaces:**
- Produces: `ROUTES.MEZCLAS`, `mezclaQueryKeys.all()`, `mutationInvalidationMap.createMezcla`

- [ ] **Step 1: Add MEZCLAS route**

```ts
// apps/frontend/src/constants/routes.ts
// Add after SUSTRATOS line
MEZCLAS: "/mezclas",
```

- [ ] **Step 2: Add mezclaQueryKeys**

```ts
// apps/frontend/src/lib/queryKeys.ts
// Add after sustratoQueryKeys section

// ============================================================================
// MEZCLAS
// ============================================================================

export const mezclaQueryKeys = {
  all: () => ["mezclas"] as const,
};
```

- [ ] **Step 3: Add mezclaQueryKeys import and invalidation entry**

```ts
// apps/frontend/src/lib/query-invalidation-map.ts
// Add import at top (after sustratoQueryKeys import)
import {
  // ... existing imports
  mezclaQueryKeys,
} from "./queryKeys";

// Add entry in mutationInvalidationMap (after createSustrato entry)
createMezcla: {
  queries: () => [mezclaQueryKeys.all()],
},
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/constants/routes.ts apps/frontend/src/lib/queryKeys.ts apps/frontend/src/lib/query-invalidation-map.ts
git commit -m "feat(mezclas): add route, query keys, and invalidation map"
```

---

### Task 4: Create API service

**Files:**
- Create: `apps/frontend/src/features/mezclas/api/mezclaService.ts`
- Create: `apps/frontend/src/features/mezclas/__tests__/mezclaService.test.ts`

**Interfaces:**
- Produces: `mezclaService.fetchAll()`, `mezclaService.create(data)`

- [ ] **Step 1: Write the failing test**

```ts
// apps/frontend/src/features/mezclas/__tests__/mezclaService.test.ts
import { mezclaService } from "../api/mezclaService";

jest.mock("@/lib/api/client-fetch", () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from "@/lib/api/client-fetch";
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe("mezclaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAll calls GET /mezcla", async () => {
    mockClientFetch.mockResolvedValue([]);
    await mezclaService.fetchAll();
    expect(mockClientFetch).toHaveBeenCalledWith("mezcla", { method: "GET" });
  });

  it("create calls POST /mezcla with body", async () => {
    const data = {
      sustrato1Id: "s1",
      porcentaje1: 60,
      sustrato2Id: null,
      porcentaje2: null,
      sustrato3Id: null,
      porcentaje3: null,
      sustrato4Id: null,
      porcentaje4: null,
    };
    mockClientFetch.mockResolvedValue({ id: "1", ...data, isActive: true, createdAt: new Date() });
    await mezclaService.create(data);
    expect(mockClientFetch).toHaveBeenCalledWith("mezcla", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test -- --testPathPattern="mezclaService"`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the service**

```ts
// apps/frontend/src/features/mezclas/api/mezclaService.ts
import { clientFetch } from "@/lib/api/client-fetch";
import { CreateMezclaDto, MezclaDto } from "@vivero/shared";

export const mezclaService = {
  fetchAll: () => {
    return clientFetch<MezclaDto[]>("mezcla", { method: "GET" });
  },

  create: (data: CreateMezclaDto) => {
    return clientFetch<MezclaDto>("mezcla", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test -- --testPathPattern="mezclaService"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/mezclas/api/mezclaService.ts apps/frontend/src/features/mezclas/__tests__/mezclaService.test.ts
git commit -m "feat(mezclas): add API service with fetchAll and create"
```

---

### Task 5: Create hooks

**Files:**
- Create: `apps/frontend/src/features/mezclas/hooks/useMezclas.ts`

**Interfaces:**
- Consumes: `mezclaService.fetchAll`, `mezclaService.create`, `mezclaQueryKeys.all()`
- Produces: `useMezclas()`, `useCreateMezcla()`

- [ ] **Step 1: Write the hooks**

```ts
// apps/frontend/src/features/mezclas/hooks/useMezclas.ts
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CreateMezclaDto, MezclaDto } from "@vivero/shared";
import { toast } from "sonner";
import { mezclaService } from "../api/mezclaService";
import { mezclaQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useMezclas = () => {
  return useSuspenseQuery<MezclaDto[]>({
    queryKey: mezclaQueryKeys.all(),
    queryFn: mezclaService.fetchAll,
    retry: 1,
  });
};

export const useCreateMezcla = () => {
  const queryClient = useQueryClient();

  return useMutation<MezclaDto, Error, CreateMezclaDto>({
    mutationFn: mezclaService.create,
    onSuccess: (data) => {
      toast.success("Mezcla creada exitosamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "createMezcla");
    },
  });
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/mezclas/hooks/useMezclas.ts
git commit -m "feat(mezclas): add React Query hooks"
```

---

### Task 6: Create columns with export

**Files:**
- Create: `apps/frontend/src/features/mezclas/components/columns.tsx`

**Interfaces:**
- Consumes: `MezclaDto` from `@vivero/shared`
- Produces: `mezclaColumns` for DataTable, `mezclaExportColumns` for PDF/CSV

- [ ] **Step 1: Write the columns**

```tsx
// apps/frontend/src/features/mezclas/components/columns.tsx
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { MezclaDto } from "@vivero/shared";
import { SortableHeader } from "@/components/data-display/data-table";
import { formatShortDate } from "@/lib/date-utils";
import { ExportColumn } from "@/lib/export";

interface CellProps {
  row?: Row<MezclaDto>;
  table?: Table<MezclaDto>;
}

function SustratoCell({ row, field }: CellProps & { field: string }) {
  if (!row) return null;
  const value = row.original[field as keyof MezclaDto];
  return (
    <span className="font-black text-sm text-foreground tracking-tight uppercase truncate">
      {value ? String(value) : <span className="text-muted-foreground/40">-</span>}
    </span>
  );
}

function PorcentajeCell({ row, field }: CellProps & { field: string }) {
  if (!row) return null;
  const value = row.original[field as keyof MezclaDto];
  return (
    <span className="text-xs font-bold font-mono tracking-tighter text-muted-foreground">
      {value != null ? `${value}%` : <span className="text-muted-foreground/40">-</span>}
    </span>
  );
}

function CreatedAtCell({ row }: CellProps) {
  if (!row) return null;
  return (
    <span className="text-xs font-bold font-mono tracking-tighter text-muted-foreground">
      {formatShortDate(row.original.createdAt)}
    </span>
  );
}

export const mezclaColumns: ColumnDef<MezclaDto>[] = [
  {
    accessorKey: "sustrato1Nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Sustrato 1</SortableHeader>
    ),
    cell: ({ row }) => <SustratoCell row={row} field="sustrato1Nombre" />,
  },
  {
    accessorKey: "porcentaje1",
    header: ({ column }) => (
      <SortableHeader column={column}>%1</SortableHeader>
    ),
    cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje1" />,
  },
  {
    accessorKey: "sustrato2Nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Sustrato 2</SortableHeader>
    ),
    cell: ({ row }) => <SustratoCell row={row} field="sustrato2Nombre" />,
  },
  {
    accessorKey: "porcentaje2",
    header: ({ column }) => (
      <SortableHeader column={column}>%2</SortableHeader>
    ),
    cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje2" />,
  },
  {
    accessorKey: "sustrato3Nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Sustrato 3</SortableHeader>
    ),
    cell: ({ row }) => <SustratoCell row={row} field="sustrato3Nombre" />,
  },
  {
    accessorKey: "porcentaje3",
    header: ({ column }) => (
      <SortableHeader column={column}>%3</SortableHeader>
    ),
    cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje3" />,
  },
  {
    accessorKey: "sustrato4Nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Sustrato 4</SortableHeader>
    ),
    cell: ({ row }) => <SustratoCell row={row} field="sustrato4Nombre" />,
  },
  {
    accessorKey: "porcentaje4",
    header: ({ column }) => (
      <SortableHeader column={column}>%4</SortableHeader>
    ),
    cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje4" />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader column={column}>Creado</SortableHeader>
    ),
    cell: ({ row }) => <CreatedAtCell row={row} />,
  },
];

export const mezclaExportColumns: ExportColumn<MezclaDto>[] = [
  {
    accessorKey: "sustrato1Nombre",
    exportHeader: "Sustrato 1",
    exportValue: (_, row) => row.sustrato1Nombre || "",
    pdfWidth: "15%",
  },
  {
    accessorKey: "porcentaje1",
    exportHeader: "% 1",
    exportValue: (value) => `${value}%`,
    pdfWidth: "8%",
  },
  {
    accessorKey: "sustrato2Nombre",
    exportHeader: "Sustrato 2",
    exportValue: (_, row) => row.sustrato2Nombre || "",
    pdfWidth: "15%",
  },
  {
    accessorKey: "porcentaje2",
    exportHeader: "% 2",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "8%",
  },
  {
    accessorKey: "sustrato3Nombre",
    exportHeader: "Sustrato 3",
    exportValue: (_, row) => row.sustrato3Nombre || "",
    pdfWidth: "15%",
  },
  {
    accessorKey: "porcentaje3",
    exportHeader: "% 3",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "8%",
  },
  {
    accessorKey: "sustrato4Nombre",
    exportHeader: "Sustrato 4",
    exportValue: (_, row) => row.sustrato4Nombre || "",
    pdfWidth: "15%",
  },
  {
    accessorKey: "porcentaje4",
    exportHeader: "% 4",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "8%",
  },
  {
    accessorKey: "createdAt",
    exportHeader: "Creado",
    exportValue: (value) => new Date(value as Date).toLocaleDateString("es-AR"),
    pdfWidth: "12%",
  },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/mezclas/components/columns.tsx
git commit -m "feat(mezclas): add DataTable column definitions with export"
```

---

### Task 7: Create form components

**Files:**
- Create: `apps/frontend/src/features/mezclas/components/mezcla-create-form.tsx`
- Create: `apps/frontend/src/features/mezclas/components/mezcla-view-form.tsx`

**Interfaces:**
- Consumes: `CreateMezclaDto`, `MezclaDto` from `@vivero/shared`, `useSustratos` from sustratos feature
- Produces: `MezclaCreateForm`, `MezclaViewForm`

- [ ] **Step 1: Write the create form**

```tsx
// apps/frontend/src/features/mezclas/components/mezcla-create-form.tsx
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreateMezclaDto, SustratoDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface FormProps {
  onSubmit: (data: CreateMezclaDto) => Promise<void>;
  onCancel: () => void;
  formId: string;
  form: UseFormReturn<CreateMezclaDto>;
  sustratos: SustratoDto[];
  totalPorcentaje: number;
}

function SustratoSlot({
  form,
  index,
  sustratos,
  label,
}: {
  form: UseFormReturn<CreateMezclaDto>;
  index: 1 | 2 | 3 | 4;
  sustratos: SustratoDto[];
  label: string;
}) {
  const sustratoField = `sustrato${index}Id` as const;
  const porcentajeField = `porcentaje${index}` as const;
  const isRequired = index === 1;

  return (
    <div className="grid grid-cols-[1fr_80px] gap-2 items-end">
      <FormField
        control={form.control}
        name={sustratoField}
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">
              {label} {isRequired && "*"}
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? ""}
            >
              <FormControl>
                <SelectTrigger className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4">
                  <SelectValue placeholder="Seleccionar sustrato" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sustratos.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={porcentajeField}
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">
              %
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={100}
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === "" ? null : Number(val));
                }}
                disabled={!form.watch(sustratoField)}
                placeholder="0"
                className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-mono font-bold px-4 text-center"
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  );
}

export function MezclaCreateForm({
  form,
  onSubmit,
  formId,
  sustratos,
  totalPorcentaje,
}: FormProps) {
  const isValid = totalPorcentaje === 100;

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4 md:pb-6"
      >
        <div className="space-y-3">
          <SustratoSlot form={form} index={1} sustratos={sustratos} label="Sustrato 1" />
          <SustratoSlot form={form} index={2} sustratos={sustratos} label="Sustrato 2" />
          <SustratoSlot form={form} index={3} sustratos={sustratos} label="Sustrato 3" />
          <SustratoSlot form={form} index={4} sustratos={sustratos} label="Sustrato 4" />
        </div>

        {/* Real-time calculator */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/40 pt-3 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-muted-foreground">
              Total
            </span>
            <Badge
              variant="outline"
              className={
                isValid
                  ? "text-success border-success/20 bg-success/10 font-bold px-2 md:px-3 py-0.5 h-5 md:h-6 text-[10px] md:text-xs"
                  : "text-destructive border-destructive/20 bg-destructive/10 font-bold px-2 md:px-3 py-0.5 h-5 md:h-6 text-[10px] md:text-xs"
              }
            >
              {isValid ? (
                <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
              )}
              {totalPorcentaje}%
            </Badge>
          </div>
          <FormDescription className="text-[9px] md:text-[10px] font-medium leading-tight mt-1">
            Los porcentajes deben sumar 100% para poder crear la mezcla.
          </FormDescription>
        </div>
      </form>
    </Form>
  );
}
```

- [ ] **Step 2: Write the view form**

```tsx
// apps/frontend/src/features/mezclas/components/mezcla-view-form.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MezclaDto } from "@vivero/shared";
import { Blend, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MezclaViewFormProps {
  selectedMezcla: MezclaDto;
}

const CompositionRow = ({
  label,
  nombre,
  porcentaje,
  isRequired,
}: {
  label: string;
  nombre: string | null;
  porcentaje: number | null;
  isRequired: boolean;
}) => (
  <div className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
    <div className="w-20 shrink-0">
      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
        {label} {isRequired && "*"}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs md:text-sm font-bold truncate text-foreground">
        {nombre ?? <span className="text-muted-foreground/40">-</span>}
      </p>
    </div>
    <div className="w-16 text-right shrink-0">
      <span className="text-xs font-mono font-bold text-muted-foreground">
        {porcentaje != null ? `${porcentaje}%` : <span className="text-muted-foreground/40">-</span>}
      </span>
    </div>
    {porcentaje != null && (
      <div className="w-24 shrink-0">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>
    )}
  </div>
);

export function MezclaViewForm({ selectedMezcla }: MezclaViewFormProps) {
  const compositionSummary = [
    selectedMezcla.sustrato1Nombre && `${selectedMezcla.sustrato1Nombre} ${selectedMezcla.porcentaje1}%`,
    selectedMezcla.sustrato2Nombre && `${selectedMezcla.sustrato2Nombre} ${selectedMezcla.porcentaje2}%`,
    selectedMezcla.sustrato3Nombre && `${selectedMezcla.sustrato3Nombre} ${selectedMezcla.porcentaje3}%`,
    selectedMezcla.sustrato4Nombre && `${selectedMezcla.sustrato4Nombre} ${selectedMezcla.porcentaje4}%`,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden">
      {/* Header */}
      <div className="space-y-3 md:space-y-4 shrink-0">
        <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Blend className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                Mezcla
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5 truncate max-w-[200px] md:max-w-none">
                {compositionSummary}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-success border-success/20 bg-success/10 font-bold px-2 md:px-3 py-0.5 h-5 md:h-6 text-[9px] md:text-[10px]"
          >
            <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
            Activo
          </Badge>
        </div>
      </div>

      {/* Details Card */}
      <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50 flex-1 min-h-0">
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto no-scrollbar">
          <div className="space-y-0.5">
            <CompositionRow
              label="Sustrato 1"
              nombre={selectedMezcla.sustrato1Nombre}
              porcentaje={selectedMezcla.porcentaje1}
              isRequired
            />
            <CompositionRow
              label="Sustrato 2"
              nombre={selectedMezcla.sustrato2Nombre}
              porcentaje={selectedMezcla.porcentaje2}
              isRequired={false}
            />
            <CompositionRow
              label="Sustrato 3"
              nombre={selectedMezcla.sustrato3Nombre}
              porcentaje={selectedMezcla.porcentaje3}
              isRequired={false}
            />
            <CompositionRow
              label="Sustrato 4"
              nombre={selectedMezcla.sustrato4Nombre}
              porcentaje={selectedMezcla.porcentaje4}
              isRequired={false}
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border/40">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Creado:
            </span>
            <span className="text-xs md:text-sm font-bold text-foreground">
              {new Date(selectedMezcla.createdAt).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/mezclas/components/mezcla-create-form.tsx apps/frontend/src/features/mezclas/components/mezcla-view-form.tsx
git commit -m "feat(mezclas): add create form with calculator and view form with composition display"
```

---

### Task 8: Create data table

**Files:**
- Create: `apps/frontend/src/features/mezclas/components/mezcla-data-table.tsx`
- Create: `apps/frontend/src/features/mezclas/components/__tests__/mezcla-data-table.test.tsx`

**Interfaces:**
- Consumes: `useMezclas`, `useCreateMezcla` from hooks, `mezclaColumns`, `MezclaCreateForm`, `MezclaViewForm`
- Produces: `MezclaDataTable`

- [ ] **Step 1: Write the failing test**

```tsx
// apps/frontend/src/features/mezclas/components/__tests__/mezcla-data-table.test.tsx
import { render, screen, act } from "@testing-library/react";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
import { MezclaDataTable } from "../mezcla-data-table";
import type { MezclaDto } from "@vivero/shared";

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
  }: {
    title: string;
    onView: (row: MezclaDto) => void;
    onCreate: () => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockMezclas[0])}>View Row</button>
    </div>
  ),
  SlideOverForm: ({
    open,
    children,
  }: {
    open: boolean;
    children: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="slide-over-form">{children}</div>
    ) : null,
}));

jest.mock("@/features/mezclas/hooks/useMezclas", () => ({
  useMezclas: () => ({
    data: mockMezclas,
  }),
  useCreateMezcla: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

jest.mock("@/features/sustratos/hooks/useSustratos", () => ({
  useSustratos: () => ({
    data: [{ id: "s1", nombre: "Turba", createdAt: new Date() }],
  }),
}));

const mockMezclas: MezclaDto[] = [
  {
    id: "1",
    sustrato1Id: "s1",
    sustrato1Nombre: "Turba",
    porcentaje1: 60,
    sustrato2Id: "s2",
    sustrato2Nombre: "Perlita",
    porcentaje2: 40,
    sustrato3Id: null,
    sustrato3Nombre: null,
    porcentaje3: null,
    sustrato4Id: null,
    sustrato4Nombre: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date("2024-03-14"),
  },
];

describe("MezclaDataTable", () => {
  it("renders DataTable with correct title", () => {
    render(<MezclaDataTable />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Mezclas")).toBeInTheDocument();
  });

  it("opens slide-over in view mode when view is triggered", () => {
    render(<MezclaDataTable />);
    act(() => {
      screen.getByText("View Row").click();
    });
    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test -- --testPathPattern="mezcla-data-table"`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the data table component**

```tsx
// apps/frontend/src/features/mezclas/components/mezcla-data-table.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { useCreateMezcla, useMezclas } from "../hooks/useMezclas";
import { useSustratos } from "@/features/sustratos/hooks/useSustratos";
import {
  CreateMezclaDto,
  CreateMezclaSchema,
  MezclaDto,
} from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { mezclaColumns, mezclaExportColumns } from "./columns";
import { MezclaCreateForm } from "./mezcla-create-form";
import { MezclaViewForm } from "./mezcla-view-form";

export function MezclaDataTable() {
  const { data: mezclas = [] } = useMezclas();
  const { data: sustratos = [] } = useSustratos();
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedMezcla, setSelectedMezcla] = useState<MezclaDto | null>(null);
  const [mode, setMode] = useState<"view" | "create">("create");

  const { mutateAsync: createMezcla, isPending: isCreatingMezcla } =
    useCreateMezcla();

  const formCreateMezcla = useForm<CreateMezclaDto>({
    resolver: zodResolver(CreateMezclaSchema),
    defaultValues: {
      sustrato1Id: "",
      porcentaje1: 0,
      sustrato2Id: null,
      porcentaje2: null,
      sustrato3Id: null,
      porcentaje3: null,
      sustrato4Id: null,
      porcentaje4: null,
    },
  });

  const watchedValues = formCreateMezcla.watch();
  const totalPorcentaje = useMemo(() => {
    return (
      (watchedValues.porcentaje1 ?? 0) +
      (watchedValues.porcentaje2 ?? 0) +
      (watchedValues.porcentaje3 ?? 0) +
      (watchedValues.porcentaje4 ?? 0)
    );
  }, [watchedValues]);

  const handleNewMezcla = useCallback(() => {
    setSelectedMezcla(null);
    setMode("create");
    formCreateMezcla.reset();
    setSlideOverOpen(true);
  }, [formCreateMezcla]);

  const handleView = useCallback((row: MezclaDto) => {
    setSelectedMezcla(row);
    setMode("view");
    setSlideOverOpen(true);
  }, []);

  const handleCreate = async (formData: CreateMezclaDto) => {
    try {
      await createMezcla(formData);
    } catch {}

    if (!isCreatingMezcla) setSlideOverOpen(false);
  };

  return (
    <>
      <DataTable
        columns={mezclaColumns}
        exportColumns={mezclaExportColumns}
        data={mezclas}
        title="Mezclas"
        description="Gestión de mezclas del sistema"
        tableName="mezclas"
        totalCount={mezclas.length}
        onCreate={handleNewMezcla}
        createLabel="Nueva Mezcla"
        onView={handleView}
      />
      {slideOverOpen && (
        <SlideOverForm
          formId={mode === "create" ? "create" : "view"}
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title={
            mode === "create"
              ? "Crear mezcla"
              : `Mezcla: ${selectedMezcla?.sustrato1Nombre}`
          }
          description={
            mode === "create"
              ? "Rellena los campos para crear una nueva mezcla."
              : undefined
          }
          onCancel={() => setSlideOverOpen(false)}
          saveLabel="Crear Mezcla"
          form={mode === "create" ? formCreateMezcla : undefined}
          mode={mode === "create" ? "create" : "view"}
          confirm={
            mode === "create"
              ? {
                  title: "Crear mezcla",
                  description: "¿Deseas crear esta nueva mezcla?",
                  label: "Crear",
                }
              : undefined
          }
        >
          <div className="space-y-2">
            {mode === "create" ? (
              <MezclaCreateForm
                form={formCreateMezcla}
                onSubmit={handleCreate}
                onCancel={() => setSlideOverOpen(false)}
                formId="create"
                sustratos={sustratos}
                totalPorcentaje={totalPorcentaje}
              />
            ) : selectedMezcla ? (
              <MezclaViewForm selectedMezcla={selectedMezcla} />
            ) : null}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test -- --testPathPattern="mezcla-data-table"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/mezclas/components/mezcla-data-table.tsx apps/frontend/src/features/mezclas/components/__tests__/mezcla-data-table.test.tsx
git commit -m "feat(mezclas): add DataTable with create and view modes"
```

---

### Task 9: Create dashboard, index, and route page

**Files:**
- Create: `apps/frontend/src/features/mezclas/components/MezclasDashboard.tsx`
- Create: `apps/frontend/src/features/mezclas/index.ts`
- Create: `apps/frontend/src/app/(dashboard)/mezclas/page.tsx`
- Create: `apps/frontend/src/features/mezclas/components/__tests__/mezcla-view-form.test.tsx`

**Interfaces:**
- Consumes: `MezclaDataTable`
- Produces: `MezclasDashboard`, public exports

- [ ] **Step 1: Write the view form test**

```tsx
// apps/frontend/src/features/mezclas/components/__tests__/mezcla-view-form.test.tsx
import { render, screen } from "@testing-library/react";
import { MezclaViewForm } from "../mezcla-view-form";
import type { MezclaDto } from "@vivero/shared";

const mockMezcla: MezclaDto = {
  id: "1",
  sustrato1Id: "s1",
  sustrato1Nombre: "Turba",
  porcentaje1: 60,
  sustrato2Id: "s2",
  sustrato2Nombre: "Perlita",
  porcentaje2: 40,
  sustrato3Id: null,
  sustrato3Nombre: null,
  porcentaje3: null,
  sustrato4Id: null,
  sustrato4Nombre: null,
  porcentaje4: null,
  isActive: true,
  createdAt: new Date("2024-03-14"),
};

describe("MezclaViewForm", () => {
  it("should display sustrato names and percentages", () => {
    render(<MezclaViewForm selectedMezcla={mockMezcla} />);
    expect(screen.getByText("Turba")).toBeInTheDocument();
    expect(screen.getByText("Perlita")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("should display active badge", () => {
    render(<MezclaViewForm selectedMezcla={mockMezcla} />);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("should display formatted creation date", () => {
    render(<MezclaViewForm selectedMezcla={mockMezcla} />);
    expect(screen.getByText(/de marzo de 2024/i)).toBeInTheDocument();
  });

  it("should show dash for empty slots", () => {
    render(<MezclaViewForm selectedMezcla={mockMezcla} />);
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm --filter frontend test -- --testPathPattern="mezcla-view-form"`
Expected: PASS

- [ ] **Step 3: Write the dashboard**

```tsx
// apps/frontend/src/features/mezclas/components/MezclasDashboard.tsx
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Suspense } from "react";
import { MezclaDataTable } from "./mezcla-data-table";
import { mezclaColumns } from "./columns";

export function MezclasDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <Suspense
        fallback={<DataTableSkeleton columnCount={mezclaColumns.length} />}
      >
        <MezclaDataTable />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 4: Write the index**

```ts
// apps/frontend/src/features/mezclas/index.ts

// Components
export { MezclasDashboard } from "./components/MezclasDashboard";

// Hooks
export { useMezclas, useCreateMezcla } from "./hooks/useMezclas";

// Services
export { mezclaService } from "./api/mezclaService";
```

- [ ] **Step 5: Write the page**

```tsx
// apps/frontend/src/app/(dashboard)/mezclas/page.tsx

import { MezclasDashboard } from "@/features/mezclas";

export const dynamic = "force-dynamic";

export default function MezclasPage() {
  return <MezclasDashboard />;
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/features/mezclas/components/MezclasDashboard.tsx apps/frontend/src/features/mezclas/index.ts "apps/frontend/src/app/(dashboard)/mezclas/page.tsx" apps/frontend/src/features/mezclas/components/__tests__/mezcla-view-form.test.tsx
git commit -m "feat(mezclas): add dashboard, index, and route page"
```

---

### Task 10: Add navigation entry

**Files:**
- Modify: `apps/frontend/src/lib/config/navigations.ts:1-119`

**Interfaces:**
- Consumes: `ROUTES.MEZCLAS`
- Produces: Mezclas sub-item inside Sustratos sub-group

- [ ] **Step 1: Add Mezclas to Sustratos sub-group**

```ts
// apps/frontend/src/lib/config/navigations.ts
// Add Blend to imports from lucide-react
import { /* existing icons */, Blend } from "lucide-react";

// Inside the sustratos subGroup items array, add after the "Lista" item:
{
  title: "Mezclas",
  href: ROUTES.MEZCLAS,
  icon: Blend,
  description: "Gestión de mezclas de sustratos",
  dashboard: { statsLabel: "Mezclas" },
  requiredPermission: { table: "mezcla", action: "read" },
},
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/lib/config/navigations.ts
git commit -m "feat(mezclas): add navigation entry under Sustratos sub-group"
```

---

### Task 11: Final verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run full type check**

Run: `pnpm type-check`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 3: Run mezclas tests**

Run: `pnpm --filter frontend test -- --testPathPattern="mezcla"`
Expected: All tests pass

- [ ] **Step 4: Run full test suite**

Run: `pnpm test`
Expected: No regressions
