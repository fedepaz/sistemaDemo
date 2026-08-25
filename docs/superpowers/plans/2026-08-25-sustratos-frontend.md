# Sustratos Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the frontend for the sustratos (substrates) module — list, create, and view detail.

**Architecture:** Follow the existing `entities` feature pattern: feature folder with `api/`, `hooks/`, `components/`, `index.ts`. Uses `clientFetch` for API calls, `@tanstack/react-query` for state management, shadcn/ui for components, and `react-hook-form` + Zod for form validation.

**Tech Stack:** Next.js 16 (App Router), React, TypeScript, shadcn/ui, Tailwind CSS v4, react-hook-form, @tanstack/react-query, Zod, lucide-react

## Global Constraints

- Spanish UI copy throughout (labels, descriptions, toasts)
- shadcn/ui components from `@/components/ui/`
- Form validation via `zodResolver` with shared Zod schemas from `@vivero/shared`
- Query keys in `src/lib/queryKeys.ts`, invalidation in `src/lib/query-invalidation-map.ts`
- `"use client"` directive on interactive components
- Follow existing code style: `// filepath comment` at top of files

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Create | `apps/frontend/src/features/sustratos/api/sustratoService.ts` | API calls (fetchAll, create) |
| Create | `apps/frontend/src/features/sustratos/hooks/useSustratos.ts` | React Query hooks |
| Create | `apps/frontend/src/features/sustratos/components/columns.tsx` | DataTable column definitions |
| Create | `apps/frontend/src/features/sustratos/components/sustrato-create-form.tsx` | Create form (nombre field) |
| Create | `apps/frontend/src/features/sustratos/components/sustrato-view-form.tsx` | View detail form |
| Create | `apps/frontend/src/features/sustratos/components/sustrato-data-table.tsx` | DataTable + SlideOverForm orchestrator |
| Create | `apps/frontend/src/features/sustratos/components/SustratosDashboard.tsx` | Dashboard wrapper with Suspense |
| Create | `apps/frontend/src/features/sustratos/index.ts` | Public exports |
| Create | `apps/frontend/src/app/(dashboard)/sustratos/page.tsx` | Route page |
| Modify | `apps/frontend/src/constants/routes.ts` | Add SUSTRATOS route |
| Modify | `apps/frontend/src/lib/config/navigations.ts` | Add sustratos sub-group |
| Modify | `apps/frontend/src/lib/queryKeys.ts` | Add sustratoQueryKeys |
| Modify | `apps/frontend/src/lib/query-invalidation-map.ts` | Add createSustrato |
| Create | `apps/frontend/src/features/sustratos/__tests__/sustratoService.test.ts` | Service tests |
| Create | `apps/frontend/src/features/sustratos/components/__tests__/sustrato-view-form.test.tsx` | View form tests |
| Create | `apps/frontend/src/features/sustratos/components/__tests__/sustrato-data-table.test.tsx` | Data table tests |

---

### Task 1: Add route constant and query keys

**Files:**
- Modify: `apps/frontend/src/constants/routes.ts:1-14`
- Modify: `apps/frontend/src/lib/queryKeys.ts:1-167`
- Modify: `apps/frontend/src/lib/query-invalidation-map.ts:1-146`

**Interfaces:**
- Produces: `ROUTES.SUSTRATOS`, `sustratoQueryKeys.all()`, `mutationInvalidationMap.createSustrato`

- [ ] **Step 1: Add SUSTRATOS route**

```ts
// apps/frontend/src/constants/routes.ts
// Add after SIEMBRA line
SUSTRATOS: "/sustratos",
```

- [ ] **Step 2: Add sustratoQueryKeys**

```ts
// apps/frontend/src/lib/queryKeys.ts
// Add after siembraQueryKeys section

// ============================================================================
// SUSTRATOS
// ============================================================================

export const sustratoQueryKeys = {
  all: () => ["sustratos"] as const,
};
```

- [ ] **Step 3: Add sustratoQueryKeys import and invalidation entry**

```ts
// apps/frontend/src/lib/query-invalidation-map.ts
// Add import at top (after siembraQueryKeys import)
import {
  // ... existing imports
  sustratoQueryKeys,
} from "./queryKeys";

// Add entry in mutationInvalidationMap (after siembraPartida entry)
createSustrato: {
  queries: () => [sustratoQueryKeys.all()],
},
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/constants/routes.ts apps/frontend/src/lib/queryKeys.ts apps/frontend/src/lib/query-invalidation-map.ts
git commit -m "feat(sustratos): add route, query keys, and invalidation map"
```

---

### Task 2: Create API service

**Files:**
- Create: `apps/frontend/src/features/sustratos/api/sustratoService.ts`
- Create: `apps/frontend/src/features/sustratos/__tests__/sustratoService.test.ts`

**Interfaces:**
- Produces: `sustratoService.fetchAll()`, `sustratoService.create(data)`

- [ ] **Step 1: Write the failing test**

```ts
// apps/frontend/src/features/sustratos/__tests__/sustratoService.test.ts
import { sustratoService } from "../api/sustratoService";

// Mock clientFetch
jest.mock("@/lib/api/client-fetch", () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from "@/lib/api/client-fetch";
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe("sustratoService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAll calls GET /sustratos", async () => {
    mockClientFetch.mockResolvedValue([]);
    await sustratoService.fetchAll();
    expect(mockClientFetch).toHaveBeenCalledWith("sustratos", { method: "GET" });
  });

  it("create calls POST /sustratos with body", async () => {
    const data = { nombre: "Sustrato Test" };
    mockClientFetch.mockResolvedValue({ id: "1", ...data, createdAt: "" });
    await sustratoService.create(data);
    expect(mockClientFetch).toHaveBeenCalledWith("sustratos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test -- --testPathPattern="sustratoService"`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the service**

```ts
// apps/frontend/src/features/sustratos/api/sustratoService.ts
import { clientFetch } from "@/lib/api/client-fetch";
import { CreateSustratoDto, SustratoDto } from "@vivero/shared";

export const sustratoService = {
  fetchAll: () => {
    return clientFetch<SustratoDto[]>("sustratos", { method: "GET" });
  },

  create: (data: CreateSustratoDto) => {
    return clientFetch<SustratoDto>("sustratos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test -- --testPathPattern="sustratoService"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/sustratos/api/sustratoService.ts apps/frontend/src/features/sustratos/__tests__/sustratoService.test.ts
git commit -m "feat(sustratos): add API service with fetchAll and create"
```

---

### Task 3: Create hooks

**Files:**
- Create: `apps/frontend/src/features/sustratos/hooks/useSustratos.ts`

**Interfaces:**
- Consumes: `sustratoService.fetchAll`, `sustratoService.create`, `sustratoQueryKeys.all()`
- Produces: `useSustratos()`, `useCreateSustrato()`

- [ ] **Step 1: Write the hooks**

```ts
// apps/frontend/src/features/sustratos/hooks/useSustratos.ts
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CreateSustratoDto, SustratoDto } from "@vivero/shared";
import { toast } from "sonner";
import { sustratoService } from "../api/sustratoService";
import { sustratoQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useSustratos = () => {
  return useSuspenseQuery<SustratoDto[]>({
    queryKey: sustratoQueryKeys.all(),
    queryFn: sustratoService.fetchAll,
    retry: 1,
  });
};

export const useCreateSustrato = () => {
  const queryClient = useQueryClient();

  return useMutation<SustratoDto, Error, CreateSustratoDto>({
    mutationFn: sustratoService.create,
    onSuccess: (data) => {
      toast.success(`Sustrato ${data.nombre} creado exitosamente`, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "createSustrato");
    },
  });
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/sustratos/hooks/useSustratos.ts
git commit -m "feat(sustratos): add React Query hooks"
```

---

### Task 4: Create columns

**Files:**
- Create: `apps/frontend/src/features/sustratos/components/columns.tsx`

**Interfaces:**
- Consumes: `SustratoDto` from `@vivero/shared`
- Produces: `sustratoColumns` for DataTable

- [ ] **Step 1: Write the columns**

```tsx
// apps/frontend/src/features/sustratos/components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { SustratoDto } from "@vivero/shared";
import { SortableHeader } from "@/components/data-display/data-table";

export const sustratoColumns: ColumnDef<SustratoDto>[] = [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Nombre</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("nombre")}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader column={column}>Creado</SortableHeader>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("es-AR");
    },
  },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/sustratos/components/columns.tsx
git commit -m "feat(sustratos): add DataTable column definitions"
```

---

### Task 5: Create form components

**Files:**
- Create: `apps/frontend/src/features/sustratos/components/sustrato-create-form.tsx`
- Create: `apps/frontend/src/features/sustratos/components/sustrato-view-form.tsx`

**Interfaces:**
- Consumes: `CreateSustratoDto`, `SustratoDto` from `@vivero/shared`
- Produces: `SustratoCreateForm`, `SustratoViewForm`

- [ ] **Step 1: Write the create form**

```tsx
// apps/frontend/src/features/sustratos/components/sustrato-create-form.tsx
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
import { CreateSustratoDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  onSubmit: (data: CreateSustratoDto) => Promise<void>;
  onCancel: () => void;
  formId: string;
  form: UseFormReturn<CreateSustratoDto>;
}

export function SustratoCreateForm({ onSubmit, formId, form }: FormProps) {
  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4 md:pb-6"
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem className="space-y-1.5 md:space-y-2">
              <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">
                Nombre
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ej: Sustrato Premium"
                  className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold px-4"
                  autoFocus
                  required
                />
              </FormControl>
              <FormDescription className="text-[9px] md:text-[10px] font-medium leading-tight">
                Nombre del sustrato.
              </FormDescription>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

- [ ] **Step 2: Write the view form**

```tsx
// apps/frontend/src/features/sustratos/components/sustrato-view-form.tsx
import { Card, CardContent } from "@/components/ui/card";
import { SustratoDto } from "@vivero/shared";
import { Package, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SustratoViewFormProps {
  selectedSustrato: SustratoDto;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
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
      <p className="text-xs md:text-base font-bold truncate text-foreground">
        {value ?? "-"}
      </p>
    </div>
  </div>
);

export function SustratoViewForm({ selectedSustrato }: SustratoViewFormProps) {
  return (
    <div className="flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500">
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                {selectedSustrato.nombre}
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                Sustrato
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 gap-0.5 md:gap-1">
            <InfoRow
              icon={Package}
              label="Nombre"
              value={selectedSustrato.nombre}
            />
            <InfoRow
              icon={Calendar}
              label="Fecha de Creación"
              value={new Date(selectedSustrato.createdAt).toLocaleDateString("es-AR")}
            />
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
git add apps/frontend/src/features/sustratos/components/sustrato-create-form.tsx apps/frontend/src/features/sustratos/components/sustrato-view-form.tsx
git commit -m "feat(sustratos): add create and view form components"
```

---

### Task 6: Create data table

**Files:**
- Create: `apps/frontend/src/features/sustratos/components/sustrato-data-table.tsx`
- Create: `apps/frontend/src/features/sustratos/components/__tests__/sustrato-data-table.test.tsx`

**Interfaces:**
- Consumes: `useSustratos`, `useCreateSustrato` from hooks, `sustratoColumns`, `SustratoCreateForm`, `SustratoViewForm`
- Produces: `SustratoDataTable`

- [ ] **Step 1: Write the failing test**

```tsx
// apps/frontend/src/features/sustratos/components/__tests__/sustrato-data-table.test.tsx
import { render, screen, act } from "@testing-library/react";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
import { SustratoDataTable } from "../sustrato-data-table";
import type { SustratoDto } from "@vivero/shared";

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
  }: {
    title: string;
    onView: (row: SustratoDto) => void;
    onCreate: () => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockSustratos[0])}>View Row</button>
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

jest.mock("@/features/sustratos/hooks/useSustratos", () => ({
  useSustratos: () => ({
    data: mockSustratos,
  }),
  useCreateSustrato: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormField: ({
    render: renderProp,
  }: {
    render: (props: { field: Record<string, unknown> }) => React.ReactNode;
  }) =>
    renderProp({
      field: {
        value: "",
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      },
    }),
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormMessage: () => null,
  FormDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));

const mockSustratos: SustratoDto[] = [
  {
    id: "1",
    nombre: "Sustrato Test",
    createdAt: "2024-03-15T00:00:00.000Z",
  },
];

describe("SustratoDataTable", () => {
  it("renders DataTable with correct title", () => {
    render(<SustratoDataTable />);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Sustratos")).toBeInTheDocument();
  });

  it("opens slide-over in view mode when view is triggered", () => {
    render(<SustratoDataTable />);

    act(() => {
      screen.getByText("View Row").click();
    });

    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test -- --testPathPattern="sustrato-data-table"`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the data table component**

```tsx
// apps/frontend/src/features/sustratos/components/sustrato-data-table.tsx
"use client";

import { useState, useCallback } from "react";
import { useCreateSustrato } from "../hooks/useSustratos";
import { CreateSustratoDto, CreateSustratoSchema, SustratoDto } from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { sustratoColumns } from "./columns";
import { SustratoCreateForm } from "./sustrato-create-form";
import { SustratoViewForm } from "./sustrato-view-form";

export function SustratoDataTable() {
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedSustrato, setSelectedSustrato] = useState<SustratoDto | null>(null);
  const [mode, setMode] = useState<"view" | "create">("create");

  const { mutateAsync: createSustrato, isPending: isCreatingSustrato } =
    useCreateSustrato();

  const formCreateSustrato = useForm<CreateSustratoDto>({
    resolver: zodResolver(CreateSustratoSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const handleNewSustrato = useCallback(() => {
    setSelectedSustrato(null);
    setMode("create");
    setSlideOverOpen(true);
  }, []);

  const handleView = useCallback((row: SustratoDto) => {
    setSelectedSustrato(row);
    setMode("view");
    setSlideOverOpen(true);
  }, []);

  const handleCreate = async (formData: CreateSustratoDto) => {
    try {
      await createSustrato(formData);
    } catch {}

    if (!isCreatingSustrato) setSlideOverOpen(false);
  };

  return (
    <>
      <DataTable
        columns={sustratoColumns}
        data={[]}
        title="Sustratos"
        description="Gestión de sustratos del sistema"
        tableName="sustratos"
        totalCount={0}
        onCreate={handleNewSustrato}
        createLabel="Nuevo Sustrato"
        onView={handleView}
      />
      {slideOverOpen && (
        <SlideOverForm
          formId={mode === "create" ? "create" : "view"}
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title={mode === "create" ? "Crear sustrato" : `Sustrato: ${selectedSustrato?.nombre}`}
          description={mode === "create" ? "Rellena los campos para crear un nuevo sustrato." : undefined}
          onCancel={() => setSlideOverOpen(false)}
          saveLabel="Crear Sustrato"
          form={mode === "create" ? formCreateSustrato : undefined}
          mode={mode === "create" ? "create" : "view"}
          confirm={mode === "create" ? {
            title: "Crear sustrato",
            description: "¿Deseas crear este nuevo sustrato?",
            label: "Crear",
          } : undefined}
        >
          <div className="space-y-2">
            {mode === "create" ? (
              <SustratoCreateForm
                form={formCreateSustrato}
                onSubmit={handleCreate}
                onCancel={() => setSlideOverOpen(false)}
                formId="create"
              />
            ) : selectedSustrato ? (
              <SustratoViewForm selectedSustrato={selectedSustrato} />
            ) : null}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test -- --testPathPattern="sustrato-data-table"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/sustratos/components/sustrato-data-table.tsx apps/frontend/src/features/sustratos/components/__tests__/sustrato-data-table.test.tsx
git commit -m "feat(sustratos): add DataTable with create and view modes"
```

---

### Task 7: Create dashboard and index

**Files:**
- Create: `apps/frontend/src/features/sustratos/components/SustratosDashboard.tsx`
- Create: `apps/frontend/src/features/sustratos/index.ts`
- Create: `apps/frontend/src/app/(dashboard)/sustratos/page.tsx`
- Create: `apps/frontend/src/features/sustratos/components/__tests__/sustrato-view-form.test.tsx`

**Interfaces:**
- Consumes: `SustratoDataTable`
- Produces: `SustratosDashboard`, public exports

- [ ] **Step 1: Write the view form test**

```tsx
// apps/frontend/src/features/sustratos/components/__tests__/sustrato-view-form.test.tsx
import { render, screen } from "@testing-library/react";
import { SustratoViewForm } from "../sustrato-view-form";
import type { SustratoDto } from "@vivero/shared";

describe("SustratoViewForm", () => {
  const mockSustrato: SustratoDto = {
    id: "1",
    nombre: "Sustrato Test",
    createdAt: "2024-03-15T00:00:00.000Z",
  };

  it("should display sustrato nombre", () => {
    render(<SustratoViewForm selectedSustrato={mockSustrato} />);
    expect(screen.getByText("Sustrato Test")).toBeInTheDocument();
  });

  it("should display formatted creation date", () => {
    render(<SustratoViewForm selectedSustrato={mockSustrato} />);
    expect(screen.getByText("15/3/2024")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm --filter frontend test -- --testPathPattern="sustrato-view-form"`
Expected: PASS

- [ ] **Step 3: Write the dashboard**

```tsx
// apps/frontend/src/features/sustratos/components/SustratosDashboard.tsx
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Suspense } from "react";
import { SustratoDataTable } from "./sustrato-data-table";
import { sustratoColumns } from "./columns";

export function SustratosDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <Suspense
        fallback={<DataTableSkeleton columnCount={sustratoColumns.length} />}
      >
        <SustratoDataTable />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 4: Write the index**

```ts
// apps/frontend/src/features/sustratos/index.ts

// Components
export { SustratosDashboard } from "./components/SustratosDashboard";

// Hooks
export { useSustratos, useCreateSustrato } from "./hooks/useSustratos";

// Services
export { sustratoService } from "./api/sustratoService";
```

- [ ] **Step 5: Write the page**

```tsx
// apps/frontend/src/app/(dashboard)/sustratos/page.tsx

import { SustratosDashboard } from "@/features/sustratos";

export const dynamic = "force-dynamic";

export default function SustratosPage() {
  return <SustratosDashboard />;
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/features/sustratos/components/SustratosDashboard.tsx apps/frontend/src/features/sustratos/index.ts apps/frontend/src/app/\(dashboard\)/sustratos/page.tsx apps/frontend/src/features/sustratos/components/__tests__/sustrato-view-form.test.tsx
git commit -m "feat(sustratos): add dashboard, index, and route page"
```

---

### Task 8: Add navigation entry

**Files:**
- Modify: `apps/frontend/src/lib/config/navigations.ts:1-102`

**Interfaces:**
- Consumes: `ROUTES.SUSTRATOS`
- Produces: Navigation entry in Partidas sub-group

- [ ] **Step 1: Add sustratos sub-group to navigations**

```ts
// apps/frontend/src/lib/config/navigations.ts
// Add import for Layers icon (already imported)
// Add sustratos subGroup inside the "partidas" nestedGroup items array, after the "A Extender" item:

import { /* existing icons */, Layers } from "lucide-react";

// Inside the partidas nestedGroup items array:
{
  kind: "subGroup",
  id: "sustratos",
  title: "Sustratos",
  icon: Layers,
  items: [
    {
      title: "Lista",
      href: ROUTES.SUSTRATOS,
      icon: Layers,
      description: "Gestión de sustratos",
      dashboard: { statsLabel: "Sustratos" },
      requiredPermission: { table: "sustratos", action: "read" },
    },
  ],
},
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/lib/config/navigations.ts
git commit -m "feat(sustratos): add navigation entry under Partidas"
```

---

### Task 9: Final verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run full type check**

Run: `pnpm type-check`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 3: Run tests**

Run: `pnpm --filter frontend test -- --testPathPattern="sustrato"`
Expected: All tests pass

- [ ] **Step 4: Run full test suite**

Run: `pnpm test`
Expected: No regressions
