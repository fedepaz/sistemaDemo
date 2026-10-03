# Producto/Formula Estado (inactive UI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let dev users see which productos/fórmulas are soft-deleted (dimmed rows, view-form badge, warning marks on formula cells referencing deleted productos) without ever showing "Activo" to anyone.

**Architecture:** Approach A (frontend cross-reference): `ProductoDto` gains `isActive`; the formulas table computes a set of "bad" producto ids (inactive or absent from the caller's productos list) and passes it to a `createFormulaColumns(inactiveProductoIds)` factory; lists dim inactive rows via the existing `getRowClassName` DataTable prop; view forms show a conditional `Inactivo` badge (the hardcoded `Activo` badge is removed).

**Tech Stack:** Zod (shared), NestJS/Jest (backend), Next.js/React/TanStack Table/Radix Select/shadcn (frontend), pnpm + Turborepo.

## Global Constraints

- **NO COMMITS.** The user explicitly forbade committing. Do not run `git add`, `git commit`, or any git-mutating command. Leave all changes in the working tree; review is done with `git diff` / `git write-tree`. (This overrides the skill's default "Commit" steps.)
- **No "Activo" anywhere in productos/fórmulas UI.** Negative-only marking: inactive rows are dimmed; view forms show `Inactivo` only when `isActive === false`; active state renders no badge at all.
- **No new Estado column; no export-column changes** (formulas/productos exports keep their current columns).
- **Design tokens / standard Tailwind utilities only** — no arbitrary values (`text-[9px]`-style). Dim treatment: `opacity-60 text-muted-foreground`.
- **Spanish UI copy**, verbatim: `Inactivo`, `Producto eliminado`, `Eliminado`.
- **queryKeys/invalidation: ZERO changes** (verified wired: `deleteProducto → productoQueryKeys.all()` already exists).
- **Never run `prisma migrate*`.** No Prisma schema changes needed (`isActive` already exists on the DB row).
- Shared schema change requires `pnpm --filter @vivero/shared build` before backend/frontend type-check.
- Verification order: `pnpm lint && pnpm type-check && pnpm test`.
- Out of scope: approach B (`FormulaDto` per-slot flags), programación selectors, recover endpoints, audit `entityType`.

---

### Task 1: Shared `ProductoSchema` gains `isActive` + backend mapping

**Files:**
- Modify: `packages/shared/src/schemas/productos.schema.ts`
- Test: `packages/shared/src/schemas/__tests__/productos.schema.spec.ts`
- Modify: `apps/backend/src/modules/productos/productos.service.ts:20-40`
- Test: `apps/backend/src/modules/productos/__tests__/productos.service.spec.ts`
- Test: `apps/backend/test/integration/fixtures/fixtures.ts:207-211`, `apps/backend/test/integration/productos.integration.spec.ts`

**Interfaces:**
- Consumes: existing `ProductoSchema`, `ProductosService.getAllProductos/getProductoById`, `mockProductoDto` fixture.
- Produces: `ProductoDto` now includes `isActive: boolean` (consumed by Tasks 2–4). Backend `GET /productos` and `GET /productos/:id` responses include `isActive`.

- [ ] **Step 1: Write failing shared-schema tests**

In `packages/shared/src/schemas/__tests__/productos.schema.spec.ts`, update the `valid` literal and add two tests inside `describe("ProductoSchema")`:

```ts
const valid = {
  id: "clx1234567890abcdef123456",
  nombre: "Turba",
  isActive: true,
  createdAt: new Date("2026-01-15"),
};
```

```ts
it("rejects missing isActive", () => {
  const withoutIsActive = {
    id: valid.id,
    nombre: valid.nombre,
    createdAt: valid.createdAt,
  };
  expect(() => ProductoSchema.parse(withoutIsActive)).toThrow();
});

it("accepts isActive false", () => {
  const result = ProductoSchema.parse({ ...valid, isActive: false });
  expect(result.isActive).toBe(false);
});
```

- [ ] **Step 2: Run shared tests to verify they fail**

Run: `pnpm --filter @vivero/shared test -- productos.schema.spec`
Expected: FAIL — "rejects missing isActive" (parse succeeds, no throw) and "accepts isActive false" (`undefined` vs `false`).

- [ ] **Step 3: Add `isActive` to the schema**

In `packages/shared/src/schemas/productos.schema.ts`:

```ts
export const ProductoSchema = z.object({
  id: requiredCuid("El producto"),
  nombre: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
});
```

- [ ] **Step 4: Run shared tests to verify they pass**

Run: `pnpm --filter @vivero/shared test -- productos.schema.spec`
Expected: PASS (all tests in file).

- [ ] **Step 5: Build shared so consumers see the new type**

Run: `pnpm --filter @vivero/shared build`
Expected: exit 0.

- [ ] **Step 6: Write the failing backend unit test**

In `apps/backend/src/modules/productos/__tests__/productos.service.spec.ts`, update `mockDto` (line ~28):

```ts
const mockDto = {
  id: 'sust-1',
  nombre: 'Turba',
  isActive: true,
  createdAt: new Date('2026-01-15'),
};
```

The existing `toEqual([mockDto])` / `toEqual(mockDto)` assertions now fail because the service strips `isActive`.

- [ ] **Step 7: Run backend unit test to verify it fails**

Run: `pnpm --filter backend test -- productos.service`
Expected: FAIL — `getAllProductos` and `getProductoById` `toEqual` mismatch (missing `isActive`).

- [ ] **Step 8: Implement the mapping**

In `apps/backend/src/modules/productos/productos.service.ts`:

```ts
async getAllProductos(requesterId: string): Promise<ProductoDto[]> {
  const rows = await this.repo.findAll(requesterId);
  return rows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    isActive: r.isActive,
    createdAt: r.createdAt,
  }));
}
```

```ts
async getProductoById(
  requesterId: string,
  id: string,
): Promise<ProductoDto | null> {
  const row = await this.repo.findById(id, requesterId);
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    isActive: row.isActive,
    createdAt: row.createdAt,
  };
}
```

(`createProducto`/`updateProducto` already return the full repository row — includes `isActive`; no change.)

- [ ] **Step 9: Run backend unit test to verify it passes**

Run: `pnpm --filter backend test -- productos.service`
Expected: PASS.

- [ ] **Step 10: Write failing integration assertions**

In `apps/backend/test/integration/productos.integration.spec.ts`, inside `GET /productos` "returns 200 + list" test add:

```ts
expect(body[0]).toHaveProperty('isActive', true);
```

Inside `GET /productos/:id` "returns 200 + producto when found" test add:

```ts
expect(body).toHaveProperty('isActive', true);
```

Run: `pnpm --filter backend test:integration -- productos.integration`
Expected: FAIL — fixture has no `isActive`.

- [ ] **Step 11: Update the fixture**

In `apps/backend/test/integration/fixtures/fixtures.ts`:

```ts
export const mockProductoDto = () => ({
  id: 'clsusmoc0000000000000000',
  nombre: 'Perlita',
  isActive: true,
  createdAt: new Date('2026-01-01'),
});
```

- [ ] **Step 12: Run integration tests to verify they pass**

Run: `pnpm --filter backend test:integration -- productos.integration`
Expected: PASS.

- [ ] **Step 13: Type-check**

Run: `pnpm --filter backend type-check`
Expected: exit 0.

---

### Task 2: Productos list dim + view-form `Inactivo` badge

**Files:**
- Modify: `apps/frontend/src/features/productos/components/producto-data-table.tsx:105-119`
- Modify: `apps/frontend/src/features/productos/components/producto-view-form.tsx`
- Test: `apps/frontend/src/features/productos/components/__tests__/producto-data-table.test.tsx`
- Test: `apps/frontend/src/features/productos/components/__tests__/producto-view-form.test.tsx`

**Interfaces:**
- Consumes: `ProductoDto.isActive` (Task 1); existing `getRowClassName?: (row: TData) => string` DataTable prop (data-table.tsx:96).
- Produces: none beyond UI behavior (no other task consumes these files).

- [ ] **Step 1: Write failing data-table test (getRowClassName captured)**

In `producto-data-table.test.tsx`:

Add `let capturedTableProps: any = null;` next to `capturedProps`. Replace the `DataTable` mock entry with:

```tsx
let capturedTableProps: any = null;

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: (props: any) => {
    capturedTableProps = props;
    const { title, onView, onEdit, onDelete } = props;
    return (
      <div data-testid="data-table">
        <h1>{title}</h1>
        <button onClick={() => onView(mockProductos[0])}>View Row</button>
        <button onClick={() => onEdit(mockProductos[0])}>Edit Row</button>
        <button onClick={() => onDelete(mockProductos[0])}>Delete Row</button>
      </div>
    );
  },
  SlideOverForm: (props: any) => {
    capturedProps = props;
    return props.open ? (
      <div data-testid="slide-over-form">{props.children}</div>
    ) : null;
  },
}));
```

Update the fixture (line ~94) and add tests:

```tsx
const mockProductos: ProductoDto[] = [
  {
    id: "1",
    nombre: "Producto Test",
    isActive: true,
    createdAt: "2024-03-15T00:00:00.000Z",
  },
];
```

```tsx
it("dims inactive rows and leaves active rows untouched", () => {
  render(<ProductoDataTable />);
  expect(capturedTableProps.getRowClassName).toBeDefined();
  const inactiveRow = { ...mockProductos[0], isActive: false };
  expect(capturedTableProps.getRowClassName(inactiveRow)).toContain("opacity-60");
  expect(capturedTableProps.getRowClassName(mockProductos[0])).toBe("");
});
```

(Also reset `capturedTableProps = null;` in `beforeEach` alongside `capturedProps = null`.)

- [ ] **Step 2: Write failing view-form tests**

In `producto-view-form.test.tsx`: add `isActive: true` to `mockProducto`, replace the `should display active badge` test with:

```tsx
it("should not display any status badge when active", () => {
  render(<ProductoViewForm selectedProducto={mockProducto} />);
  expect(screen.queryByText("Activo")).toBeNull();
  expect(screen.queryByText("Inactivo")).toBeNull();
});

it("should display Inactivo badge when inactive", () => {
  render(
    <ProductoViewForm
      selectedProducto={{ ...mockProducto, isActive: false }}
    />,
  );
  expect(screen.getByText("Inactivo")).toBeInTheDocument();
  expect(screen.queryByText("Activo")).toBeNull();
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter frontend test -- producto`
Expected: FAIL — `capturedTableProps.getRowClassName` undefined; `Activo` badge still rendered (active case fails).

- [ ] **Step 4: Implement dim + badge**

In `producto-data-table.tsx`, add to the `<DataTable>` element (after `columnLabels`):

```tsx
        getRowClassName={(row) =>
          !row.isActive ? "opacity-60 text-muted-foreground" : ""
        }
```

In `producto-view-form.tsx`:
- Change the lucide import to `import { Package, Calendar, AlertTriangle } from "lucide-react";` (drop `CheckCircle` — it is only used by the removed badge).
- Replace the whole hardcoded `<Badge …>Activo</Badge>` block in the header with:

```tsx
          {!selectedProducto.isActive && (
            <Badge
              variant="outline"
              className="text-destructive border-destructive/20 bg-destructive/10 font-bold px-2 py-0.5 h-5 text-xs"
            >
              <AlertTriangle className="h-2.5 w-2.5 mr-1" />
              Inactivo
            </Badge>
          )}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter frontend test -- producto`
Expected: PASS (all productos tests).

- [ ] **Step 6: Lint + type-check**

Run: `pnpm --filter frontend lint && pnpm --filter frontend type-check`
Expected: exit 0.

---

### Task 3: Formulas — column factory with cell marks + row dim + view badge

**Files:**
- Modify: `apps/frontend/src/features/formulas/components/columns.tsx`
- Modify: `apps/frontend/src/features/formulas/components/formula-data-table.tsx`
- Modify: `apps/frontend/src/features/formulas/components/formula-view-form.tsx`
- Test (create): `apps/frontend/src/features/formulas/components/__tests__/columns.test.tsx`
- Test: `apps/frontend/src/features/formulas/components/__tests__/formula-view-form.test.tsx`
- Test: `apps/frontend/src/features/formulas/components/__tests__/formula-data-table.test.tsx`

**Interfaces:**
- Consumes: `ProductoDto.isActive` (Task 1); existing `useProductos()` hook already used in `formula-data-table.tsx`.
- Produces: `createFormulaColumns(inactiveProductoIds: Set<string>): ColumnDef<FormulaDto>[]` exported from `columns.tsx` (keeps `formulaColumns = createFormulaColumns(new Set())` export for `FormulasDashboard`'s column count).

- [ ] **Step 1: Write failing columns test (new file)**

Create `apps/frontend/src/features/formulas/components/__tests__/columns.test.tsx`:

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/frontend/src/features/formulas/components/__tests__/columns.test.tsx
import { render, screen } from "@testing-library/react";
import { createFormulaColumns } from "../columns";
import type { FormulaDto } from "@vivero/shared";

const baseFormula: FormulaDto = {
  id: "1",
  producto1Id: "s1",
  producto1Nombre: "Turba",
  porcentaje1: 60,
  producto2Id: "s2",
  producto2Nombre: "Perlita",
  porcentaje2: 40,
  producto3Id: null,
  producto3Nombre: null,
  porcentaje3: null,
  producto4Id: null,
  producto4Nombre: null,
  porcentaje4: null,
  isActive: true,
  createdAt: new Date("2024-03-14"),
};

function renderCell(
  accessorKey: string,
  formula: FormulaDto,
  inactiveIds: Set<string>,
) {
  const columns = createFormulaColumns(inactiveIds);
  const column = columns.find((c) => c.accessorKey === accessorKey) as any;
  return render(column.cell({ row: { original: formula } }));
}

describe("formulaColumns cell marking", () => {
  it("marks the slot when its producto is in the inactive set", () => {
    renderCell("producto2Nombre", baseFormula, new Set(["s2"]));
    expect(screen.getByTitle("Producto eliminado")).toBeInTheDocument();
  });

  it("does not mark a slot whose producto is active", () => {
    renderCell("producto2Nombre", baseFormula, new Set(["s1"]));
    expect(screen.queryByTitle("Producto eliminado")).toBeNull();
  });

  it("does not mark an empty slot", () => {
    renderCell("producto3Nombre", baseFormula, new Set(["s3"]));
    expect(screen.queryByTitle("Producto eliminado")).toBeNull();
  });
});
```

- [ ] **Step 2: Write failing view-form tests**

In `formula-view-form.test.tsx`, replace `should display active badge` with:

```tsx
it("should not display any status badge when active", () => {
  render(<FormulaViewForm selectedFormula={mockFormula} />);
  expect(screen.queryByText("Activo")).toBeNull();
  expect(screen.queryByText("Inactivo")).toBeNull();
});

it("should display Inactivo badge when inactive", () => {
  render(
    <FormulaViewForm
      selectedFormula={{ ...mockFormula, isActive: false }}
    />,
  );
  expect(screen.getByText("Inactivo")).toBeInTheDocument();
  expect(screen.queryByText("Activo")).toBeNull();
});
```

- [ ] **Step 3: Write failing data-table test (getRowClassName)**

In `formula-data-table.test.tsx`: add `let capturedTableProps: any = null;` at top level and change the `DataTable` mock to capture props, same pattern as Task 2 Step 1:

```tsx
let capturedTableProps: any = null;

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: (props: any) => {
    capturedTableProps = props;
    const { title, onView, onDelete } = props;
    return (
      <div data-testid="data-table">
        <h1>{title}</h1>
        <button onClick={() => onView(mockFormulas[0])}>View Row</button>
        <button onClick={() => onDelete(mockFormulas[0])}>Delete Row</button>
      </div>
    );
  },
  SlideOverForm: ({ open, children }: any) =>
    open ? <div data-testid="slide-over-form">{children}</div> : null,
}));
```

Add:

```tsx
it("dims inactive formulas and leaves active rows untouched", () => {
  render(<FormulaDataTable />);
  expect(capturedTableProps.getRowClassName).toBeDefined();
  expect(capturedTableProps.getRowClassName(mockFormulas[0])).toBe("");
  expect(
    capturedTableProps.getRowClassName({ ...mockFormulas[0], isActive: false }),
  ).toContain("opacity-60");
});
```

(Also reset `capturedTableProps = null;` in `beforeEach`.)

- [ ] **Step 4: Run tests to verify they fail**

Run: `pnpm --filter frontend test -- formulas`
Expected: FAIL — `createFormulaColumns` not exported; `Activo` badge still rendered; `getRowClassName` undefined.

- [ ] **Step 5: Implement columns.tsx factory**

Rewrite `apps/frontend/src/features/formulas/components/columns.tsx`:

```tsx
// apps/frontend/src/features/formulas/components/columns.tsx
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { FormulaDto } from "@vivero/shared";
import { SortableHeader } from "@/components/data-display/data-table";
import { formatShortDate } from "@/lib/date-utils";
import { ExportColumn } from "@/lib/export";
import { AlertTriangle } from "lucide-react";

interface CellProps {
  row?: Row<FormulaDto>;
  table?: Table<FormulaDto>;
}

function ProductoCell({
  row,
  field,
  inactiveIds,
}: CellProps & { field: string; inactiveIds: Set<string> }) {
  if (!row) return null;
  const value = row.original[field as keyof FormulaDto];
  const idField = field.replace("Nombre", "Id") as keyof FormulaDto;
  const productoId = row.original[idField];
  const marked = typeof productoId === "string" && inactiveIds.has(productoId);
  return (
    <span className="font-black text-sm text-foreground tracking-tight uppercase truncate">
      {value ? (
        <span className="inline-flex items-center gap-1">
          {String(value)}
          {marked && (
            <span title="Producto eliminado">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            </span>
          )}
        </span>
      ) : (
        <span className="text-muted-foreground/40">-</span>
      )}
    </span>
  );
}

function PorcentajeCell({ row, field }: CellProps & { field: string }) {
  if (!row) return null;
  const value = row.original[field as keyof FormulaDto];
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

export function createFormulaColumns(
  inactiveProductoIds: Set<string>,
): ColumnDef<FormulaDto>[] {
  return [
    {
      accessorKey: "producto1Nombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Producto 1</SortableHeader>
      ),
      cell: ({ row }) => (
        <ProductoCell
          row={row}
          field="producto1Nombre"
          inactiveIds={inactiveProductoIds}
        />
      ),
    },
    {
      accessorKey: "porcentaje1",
      header: ({ column }) => (
        <SortableHeader column={column}>%1</SortableHeader>
      ),
      cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje1" />,
    },
    {
      accessorKey: "producto2Nombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Producto 2</SortableHeader>
      ),
      cell: ({ row }) => (
        <ProductoCell
          row={row}
          field="producto2Nombre"
          inactiveIds={inactiveProductoIds}
        />
      ),
    },
    {
      accessorKey: "porcentaje2",
      header: ({ column }) => (
        <SortableHeader column={column}>%2</SortableHeader>
      ),
      cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje2" />,
    },
    {
      accessorKey: "producto3Nombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Producto 3</SortableHeader>
      ),
      cell: ({ row }) => (
        <ProductoCell
          row={row}
          field="producto3Nombre"
          inactiveIds={inactiveProductoIds}
        />
      ),
    },
    {
      accessorKey: "porcentaje3",
      header: ({ column }) => (
        <SortableHeader column={column}>%3</SortableHeader>
      ),
      cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje3" />,
    },
    {
      accessorKey: "producto4Nombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Producto 4</SortableHeader>
      ),
      cell: ({ row }) => (
        <ProductoCell
          row={row}
          field="producto4Nombre"
          inactiveIds={inactiveProductoIds}
        />
      ),
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
}

// Static export kept for FormulasDashboard's columnCount (skeleton only).
export const formulaColumns = createFormulaColumns(new Set<string>());

export const formulaExportColumns: ExportColumn<FormulaDto>[] = [
  {
    accessorKey: "producto1Nombre",
    exportHeader: "Producto 1",
    exportValue: (_, row) => row.producto1Nombre || "",
    pdfWidth: "16%",
  },
  {
    accessorKey: "porcentaje1",
    exportHeader: "%1",
    exportValue: (value) => `${value}%`,
    pdfWidth: "6%",
  },
  {
    accessorKey: "producto2Nombre",
    exportHeader: "Producto 2",
    exportValue: (_, row) => row.producto2Nombre || "",
    pdfWidth: "16%",
  },
  {
    accessorKey: "porcentaje2",
    exportHeader: "%2",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "6%",
  },
  {
    accessorKey: "producto3Nombre",
    exportHeader: "Producto 3",
    exportValue: (_, row) => row.producto3Nombre || "",
    pdfWidth: "16%",
  },
  {
    accessorKey: "porcentaje3",
    exportHeader: "%3",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "6%",
  },
  {
    accessorKey: "producto4Nombre",
    exportHeader: "Producto 4",
    exportValue: (_, row) => row.producto4Nombre || "",
    pdfWidth: "16%",
  },
  {
    accessorKey: "porcentaje4",
    exportHeader: "%4",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "6%",
  },
  {
    accessorKey: "createdAt",
    exportHeader: "Creado",
    exportValue: (value) => new Date(value as Date).toLocaleDateString("es-AR"),
    pdfWidth: "12%",
  },
];
```

- [ ] **Step 6: Implement formula-data-table.tsx**

Change the import to `import { createFormulaColumns, formulaExportColumns } from "./columns";`, and inside `FormulaDataTable` (after the `totalPorcentaje` memo) add:

```tsx
const inactiveProductoIds = useMemo(() => {
  const byId = new Map(productos.map((p) => [p.id, p] as const));
  const ids = new Set<string>();
  for (const f of formulas) {
    for (const n of [1, 2, 3, 4] as const) {
      const id = f[`producto${n}Id`];
      if (!id) continue;
      const producto = byId.get(id);
      if (!producto || !producto.isActive) ids.add(id);
    }
  }
  return ids;
}, [productos, formulas]);

const columns = useMemo(
  () => createFormulaColumns(inactiveProductoIds),
  [inactiveProductoIds],
);
```

In the `<DataTable>` element: replace `columns={formulaColumns}` with `columns={columns}` and add:

```tsx
        getRowClassName={(row) =>
          !row.isActive ? "opacity-60 text-muted-foreground" : ""
        }
```

- [ ] **Step 7: Implement formula-view-form.tsx badge**

Change the lucide import to `import { Blend, Calendar, AlertTriangle } from "lucide-react";` (drop `CheckCircle`). Replace the hardcoded `Activo` Badge block with:

```tsx
          {!selectedFormula.isActive && (
            <Badge
              variant="outline"
              className="text-destructive border-destructive/20 bg-destructive/10 font-bold px-2 py-0.5 h-5 text-xs"
            >
              <AlertTriangle className="h-2.5 w-2.5 mr-1" />
              Inactivo
            </Badge>
          )}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `pnpm --filter frontend test -- formulas`
Expected: PASS (existing + new tests).

- [ ] **Step 9: Lint + type-check**

Run: `pnpm --filter frontend lint && pnpm --filter frontend type-check`
Expected: exit 0.

---

### Task 4: Formula create form — inactive producto options disabled

**Files:**
- Modify: `apps/frontend/src/features/formulas/components/formula-create-form.tsx:68-70`
- Test (create): `apps/frontend/src/features/formulas/components/__tests__/formula-create-form.test.tsx`

**Interfaces:**
- Consumes: `ProductoDto.isActive` (Task 1).
- Produces: none (leaf UI change).

- [ ] **Step 1: Write failing test (new file)**

Create `apps/frontend/src/features/formulas/components/__tests__/formula-create-form.test.tsx`:

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/frontend/src/features/formulas/components/__tests__/formula-create-form.test.tsx
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { FormulaCreateForm } from "../formula-create-form";
import type { CreateFormulaDto, ProductoDto } from "@vivero/shared";

const mockCapturedSelectItems: Array<{
  value?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}> = [];

jest.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: (props: any) => {
    mockCapturedSelectItems.push(props);
    return <div>{props.children}</div>;
  },
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => null,
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render: renderProp }: any) =>
    renderProp({
      field: { value: "", onChange: jest.fn(), onBlur: jest.fn(), ref: jest.fn() },
    }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: () => null,
  FormDescription: ({ children }: any) => <p>{children}</p>,
}));

const activeProducto: ProductoDto = {
  id: "s1",
  nombre: "Turba",
  isActive: true,
  createdAt: new Date("2024-01-01"),
};
const inactiveProducto: ProductoDto = {
  id: "s2",
  nombre: "Perlita",
  isActive: false,
  createdAt: new Date("2024-01-01"),
};

function Harness() {
  const form = useForm<CreateFormulaDto>({
    defaultValues: {
      producto1Id: "",
      porcentaje1: 0,
      producto2Id: null,
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    },
  });
  return (
    <FormulaCreateForm
      form={form}
      onSubmit={jest.fn()}
      onCancel={jest.fn()}
      formId="create"
      productos={[activeProducto, inactiveProducto]}
      totalPorcentaje={100}
    />
  );
}

describe("FormulaCreateForm producto options", () => {
  beforeEach(() => {
    mockCapturedSelectItems.length = 0;
  });

  it("disables the inactive producto option and labels it Eliminado", () => {
    render(<Harness />);
    const inactive = mockCapturedSelectItems.find((i) => i.value === "s2");
    expect(inactive).toBeDefined();
    expect(inactive!.disabled).toBe(true);
    const text = render(<>{inactive!.children}</>);
    expect(text.getByText("Eliminado")).toBeInTheDocument();
  });

  it("keeps the active producto option enabled", () => {
    render(<Harness />);
    const active = mockCapturedSelectItems.find((i) => i.value === "s1");
    expect(active).toBeDefined();
    expect(active!.disabled).toBeFalsy();
    const text = render(<>{active!.children}</>);
    expect(screen.queryByText("Eliminado")).toBeNull();
    expect(text.getByText("Turba")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test -- formula-create-form`
Expected: FAIL — `disabled` not true (undefined) and no `Eliminado` text.

- [ ] **Step 3: Implement disabled option**

In `formula-create-form.tsx`, replace the options map:

```tsx
{productos.map((s) => (
  <SelectItem key={s.id} value={s.id} disabled={!s.isActive}>
    {s.isActive ? (
      s.nombre
    ) : (
      <>
        <span className="text-muted-foreground line-through">{s.nombre}</span>
        <span className="ml-2 font-bold uppercase text-muted-foreground/70">
          Eliminado
        </span>
      </>
    )}
  </SelectItem>
))}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test -- formula-create-form`
Expected: PASS.

- [ ] **Step 5: Lint + type-check**

Run: `pnpm --filter frontend lint && pnpm --filter frontend type-check`
Expected: exit 0.

---

### Task 5: Full verification (no commits)

**Files:** none (verification only).

**Interfaces:**
- Consumes: all prior tasks.
- Produces: green gates; working tree left dirty for user-reviewed commits.

- [ ] **Step 1: Rebuild shared**

Run: `pnpm --filter @vivero/shared build`
Expected: exit 0.

- [ ] **Step 2: Run the full gate order**

Run: `pnpm lint && pnpm type-check && pnpm test`
Expected: exit 0; all suites green (frontend suite count grows by ≥5: 3 columns + 2 create-form, plus replaced badge tests).

- [ ] **Step 3: Run backend integration suite**

Run: `pnpm --filter backend test:integration`
Expected: PASS (all specs).

- [ ] **Step 4: Report — do NOT commit**

Present `git status --short` and `git diff --stat` to the user and stop. Commits happen only with the user's explicit approval (commit-workflow).

---

## Self-Review

1. **Spec coverage:** schema+backend map → Task 1; productos dim + view badge + Activo removal → Task 2; formulas dim/factory/cell marks/view badge → Task 3; disabled selector → Task 4; queryKeys verified-no-change → Global Constraints; tests → each task; exports unchanged → Task 3 keeps `formulaExportColumns` verbatim; out-of-scope respected → no `FormulaDto` change, no programación edits. ✓
2. **Placeholder scan:** all steps contain exact code/commands; no TBD/"similar to". ✓
3. **Type consistency:** `createFormulaColumns(inactiveProductoIds: Set<string>)` used identically in Tasks 3 tests/impl; `getRowClassName` prop matches data-table.tsx:96 signature; `ProductoDto.isActive: boolean` matches Task 1 schema; copy strings `Inactivo`/`Producto eliminado`/`Eliminado` consistent across spec, tests, impl. ✓
