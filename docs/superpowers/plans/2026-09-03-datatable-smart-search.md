# DataTable Smart Search Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global search bar to the DataTable component that filters rows across all visible columns in real-time, with a clear button and results count badge.

**Architecture:** Modify the existing `DataTable` component to add an `enableSearch` prop (default `true`). When enabled, render a search row between `CardHeader` and toolbar with an `Input` bound to the existing `globalFilter` state, a clear button, and a results count badge. Uses TanStack Table's built-in `includesString` global filter.

**Tech Stack:** React, TanStack Table, shadcn/ui Input, lucide-react icons (Search, X)

## Global Constraints

- All data types must be in `packages/shared/src/schemas/` (not applicable — UI-only change)
- Conventional Commits enforced by commitlint
- TDD: tests before feature code
- Frontend: Next.js 16 App Router + shadcn/ui + Tailwind v4
- Verification: `pnpm lint && pnpm type-check && pnpm test`

---

### Task 1: Add `enableSearch` prop and search bar UI

**Files:**
- Modify: `apps/frontend/src/components/data-display/data-table/data-table.tsx:69-91` (DataTableProps interface)
- Modify: `apps/frontend/src/components/data-display/data-table/data-table.tsx:100-116` (DataTableInner destructuring)
- Modify: `apps/frontend/src/components/data-display/data-table/data-table.tsx:18-29` (lucide imports)
- Modify: `apps/frontend/src/components/data-display/data-table/data-table.tsx:407-430` (JSX between CardHeader and toolbar)

**Interfaces:**
- Consumes: Existing `globalFilter` / `setGlobalFilter` state (line 121), `table.getFilteredRowModel()` (already available)
- Produces: New `enableSearch` prop on `DataTableProps`

- [ ] **Step 1: Add `Search` and `X` to lucide imports**

In `data-table.tsx`, add `Search` and `X` to the lucide-react import:

```typescript
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Play,
  Plus,
  Search,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
```

- [ ] **Step 2: Add `enableSearch` prop to DataTableProps**

In `data-table.tsx`, add the new prop to the interface (after `exportColumns`):

```typescript
interface DataTableProps<TData extends Record<string, unknown>, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title: string;
  tableName: string;
  description?: string;
  onView?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onCreate?: () => void;
  createLabel?: string;
  loading?: boolean;
  totalCount?: number;
  enableSelection?: boolean;
  renderInlineEdit?: (
    row: TData,
    onSave: () => void,
    onCancel: () => void,
  ) => ReactNode;
  toolbarContent?: ReactNode;
  canExecuteLabel?: string;
  exportColumns?: ExportColumn<TData>[];
  enableSearch?: boolean;
}
```

- [ ] **Step 3: Destructure `enableSearch` in DataTableInner**

In the `DataTableInner` function signature, add `enableSearch = true` to the destructuring:

```typescript
function DataTableInner<TData extends Record<string, unknown>, TValue>({
  columns,
  data,
  title,
  description,
  tableName,
  onView,
  onEdit,
  onDelete,
  onCreate,
  createLabel = "Nuevo",
  totalCount = 0,
  enableSelection,
  toolbarContent,
  canExecuteLabel = "Cambiar",
  exportColumns,
  enableSearch = true,
}: DataTableProps<TData, TValue>) {
```

- [ ] **Step 4: Add search row JSX between CardHeader and toolbar**

After the `</CardHeader>` closing tag (line 430) and before the `<CardContent>` opening (line 431), insert the search row inside `CardContent`, before the existing toolbar `<div>`:

In the JSX, inside `CardContent`, before the toolbar div (line 433), add:

```tsx
<CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
  {enableSearch && (
    <div className="flex items-center gap-2 px-4 py-2 shrink-0 border-b">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder={breakpoint === "sm" ? "Buscar..." : "Buscar en la tabla..."}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-8 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {globalFilter && (
          <button
            onClick={() => setGlobalFilter("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Badge variant="secondary" className="text-[11px] shrink-0 hidden md:inline-flex">
        {`${table.getFilteredRowModel().rows.length} de ${data.length}`}
      </Badge>
    </div>
  )}
  {/* existing toolbar div */}
```

- [ ] **Step 5: Run lint and type-check**

Run: `pnpm lint && pnpm type-check`
Expected: PASS (no errors)

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/components/data-display/data-table/data-table.tsx
git commit -m "feat(data-table): add enableSearch prop and search bar UI"
```

---

### Task 2: Add tests for search bar

**Files:**
- Modify: `apps/frontend/src/components/data-display/data-table/__tests__/data-table.test.tsx`

**Interfaces:**
- Consumes: `DataTable` component from Task 1
- Produces: Test coverage for search bar rendering, filtering, clear button, count badge

- [ ] **Step 1: Update mock to support globalFilter state**

The existing mock of `@tanstack/react-table` needs to support dynamic `globalFilter` state for testing. Update the mock to track filter state:

Replace the mock at the top of `data-table.test.tsx` with a version that supports `getFilteredRowModel` returning rows based on globalFilter:

```typescript
let mockGlobalFilter = "";
const mockSetGlobalFilter = jest.fn((value: string) => { mockGlobalFilter = value; });

jest.mock("@tanstack/react-table", () => ({
  useReactTable: () => ({
    getHeaderGroups: () => [],
    getRowModel: () => ({ rows: [] }),
    getFilteredRowModel: () => {
      // Simulate filtering: return empty if filter is set (for test simplicity)
      if (mockGlobalFilter) return { rows: [] };
      return { rows: [] };
    },
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    getPaginationRowModel: () => ({ rows: [] }),
    getColumnCanHide: () => false,
    getSelectedRowModel: () => ({ rows: [] }),
    setColumnVisibility: jest.fn(),
    setGlobalFilter: mockSetGlobalFilter,
    setSorting: jest.fn(),
    setPageSize: jest.fn(),
    setPageIndex: jest.fn(),
    previousPage: jest.fn(),
    nextPage: jest.fn(),
    getCanNextPage: () => false,
    getCanPreviousPage: () => false,
    getPageCount: () => 1,
    getState: () => ({
      sorting: [],
      columnVisibility: {},
      pagination: { pageIndex: 0, pageSize: 10 },
      rowSelection: {},
      globalFilter: mockGlobalFilter,
    }),
    getColumn: () => ({ getCanSort: () => false, getIsSorted: () => false, toggleSorting: jest.fn(), getToggleVisibilityHandler: jest.fn() }),
    getIsAllPageRowsSelected: () => false,
    getIsSomePageRowsSelected: () => false,
    toggleAllPageRowsSelected: jest.fn(),
    getAllColumns: () => [],
  }),
  createColumnHelper: () => ({
    accessor: () => ({}),
    display: () => ({}),
  }),
  flexRender: () => null,
  getCoreRowModel: () => () => ({ rows: [] }),
  getSortedRowModel: () => () => ({ rows: [] }),
  getFilteredRowModel: () => () => ({ rows: [] }),
  getPaginationRowModel: () => () => ({ rows: [] }),
}));
```

- [ ] **Step 2: Add test — search bar renders by default**

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "../data-table";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<Record<string, unknown>, unknown>[] = [
  { accessorKey: "name", header: "Name" },
];

const data = [
  { name: "Pino" },
  { name: "Eucalipto" },
];

describe("DataTable - Search Bar", () => {
  beforeEach(() => {
    mockGlobalFilter = "";
    jest.clearAllMocks();
  });

  it("renders search bar by default", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
      />
    );

    expect(screen.getByPlaceholderText("Buscar en la tabla...")).toBeInTheDocument();
  });
```

- [ ] **Step 3: Add test — search bar hidden when enableSearch={false}**

```typescript
  it("hides search bar when enableSearch={false}", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
        enableSearch={false}
      />
    );

    expect(screen.queryByPlaceholderText("Buscar en la tabla...")).not.toBeInTheDocument();
  });
```

- [ ] **Step 4: Add test — typing in search calls setGlobalFilter**

```typescript
  it("calls setGlobalFilter when user types", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
      />
    );

    const input = screen.getByPlaceholderText("Buscar en la tabla...");
    await user.type(input, "pino");

    expect(mockSetGlobalFilter).toHaveBeenCalled();
  });
```

- [ ] **Step 5: Add test — clear button resets filter**

```typescript
  it("shows clear button when filter is set and resets on click", async () => {
    mockGlobalFilter = "test";
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
      />
    );

    const clearButton = screen.getByRole("button", { name: /limpiar búsqueda/i });
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);
    expect(mockSetGlobalFilter).toHaveBeenCalledWith("");
  });
```

- [ ] **Step 6: Add test — count badge renders**

```typescript
  it("renders results count badge", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
      />
    );

    expect(screen.getByText(/de 2/)).toBeInTheDocument();
  });
```

- [ ] **Step 7: Add test — empty state shows when no results**

```typescript
  it("shows empty state when no results match", () => {
    mockGlobalFilter = "zzz";
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
      />
    );

    expect(screen.getByText("No se encontraron resultados")).toBeInTheDocument();
  });
```

- [ ] **Step 8: Run tests**

Run: `pnpm --filter frontend test -- --testPathPattern="data-table.test"`
Expected: All tests PASS

- [ ] **Step 9: Commit**

```bash
git add apps/frontend/src/components/data-display/data-table/__tests__/data-table.test.tsx
git commit -m "test(data-table): add search bar rendering and filtering tests"
```

---

### Task 3: Final verification and commit

**Files:** None (verification only)

- [ ] **Step 1: Run full verification**

Run: `pnpm lint && pnpm type-check && pnpm test`
Expected: All PASS

- [ ] **Step 2: Commit any remaining changes**

```bash
git add .
git commit -m "feat(data-table): complete smart search bar with tests"
```
