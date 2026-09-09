let mockGlobalFilter = "";
const mockSetGlobalFilter = jest.fn((value: string) => { mockGlobalFilter = value; });

const mockTable = {
  getHeaderGroups: () => [],
  getRowModel: () => ({ rows: [] }),
  getFilteredRowModel: () => {
    if (mockGlobalFilter === "no-match") return { rows: [] };
    return { rows: [{ id: "1" }, { id: "2" }] };
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
  getColumn: () => ({
    getCanSort: () => false,
    getIsSorted: () => false,
    toggleSorting: jest.fn(),
    getToggleVisibilityHandler: jest.fn(),
  }),
  getIsAllPageRowsSelected: () => false,
  getIsSomePageRowsSelected: () => false,
  toggleAllPageRowsSelected: jest.fn(),
  getAllColumns: () => [],
  resetRowSelection: jest.fn(),
};

jest.mock("@tanstack/react-table", () => ({
  useReactTable: () => mockTable,
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

jest.mock("@/hooks/usePermission", () => ({
  usePermission: () => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
  }),
}));

jest.mock("@/features/permissions", () => ({
  useTableByName: () => ({ entity: { permissionType: "CRUD" } }),
}));

jest.mock("@/hooks/useDataTable", () => ({
  useDataTableActions: () => ({
    isCreateModalOpen: false,
    isEditModalOpen: false,
    selectedEntity: null,
    handleAdd: jest.fn(),
    handleEdit: jest.fn(),
    handleDelete: jest.fn(),
    closeCreateModal: jest.fn(),
    closeEditModal: jest.fn(),
  }),
}));

jest.mock("@/hooks/useExportData", () => ({
  useExportData: () => ({
    handleExport: jest.fn(),
    isExporting: false,
  }),
}));

jest.mock("@/hooks/useMediaQuery", () => ({
  useBreakpoint: () => "lg",
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuCheckboxItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/data-display/data-table/export-dropdown", () => ({
  ExportDropdown: () => null,
}));

jest.mock("@/components/data-display/data-table/delete-dialog-button", () => ({
  DeleteDialog: () => null,
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DataTable } from "../data-table";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<Record<string, unknown>, unknown>[] = [
  { accessorKey: "name", header: "Name" },
];

const data = [
  { name: "Pino" },
  { name: "Eucalipto" },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

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
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByPlaceholderText("Buscar en la tabla...")).toBeInTheDocument();
  });

  it("hides search bar when enableSearch={false}", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
        enableSearch={false}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.queryByPlaceholderText("Buscar en la tabla...")).not.toBeInTheDocument();
  });

  it("accepts text input in search bar", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
      />,
      { wrapper: Wrapper }
    );

    const input = screen.getByPlaceholderText("Buscar en la tabla...");
    await user.type(input, "pino");

    expect(input).toHaveValue("pino");
  });

  it("shows clear button after typing and resets on click", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
      />,
      { wrapper: Wrapper }
    );

    const input = screen.getByPlaceholderText("Buscar en la tabla...");
    expect(screen.queryByRole("button", { name: /limpiar búsqueda/i })).not.toBeInTheDocument();

    await user.type(input, "pino");
    expect(input).toHaveValue("pino");

    const clearButton = screen.getByRole("button", { name: /limpiar búsqueda/i });
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);
    expect(input).toHaveValue("");
    expect(screen.queryByRole("button", { name: /limpiar búsqueda/i })).not.toBeInTheDocument();
  });

  it("renders results count badge", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText("2 de 2")).toBeInTheDocument();
  });

  it("shows empty state when no results match", () => {
    mockGlobalFilter = "no-match";
    render(
      <DataTable
        columns={columns}
        data={data}
        title="Test"
        tableName="test"
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText("No se encontraron resultados")).toBeInTheDocument();
  });
});
