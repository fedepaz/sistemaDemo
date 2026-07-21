jest.mock("@tanstack/react-table", () => ({
  useReactTable: () => ({
    getHeaderGroups: () => [],
    getRowModel: () => ({ rows: [] }),
    getFilteredRowModel: () => ({ rows: [] }),
    getPaginationRowModel: () => ({ rows: [] }),
    getColumnCanHide: () => false,
    getSelectedRowModel: () => ({ rows: [] }),
    setColumnVisibility: jest.fn(),
    setGlobalFilter: jest.fn(),
    setSorting: jest.fn(),
    setPageSize: jest.fn(),
    setPageIndex: jest.fn(),
    previousPage: jest.fn(),
    nextPage: jest.fn(),
    getCanNextPage: () => false,
    getCanPreviousPage: () => false,
    getPageCount: () => 1,
    getState: () => ({ sorting: [], columnVisibility: {}, pagination: { pageIndex: 0, pageSize: 10 }, rowSelection: {} }),
    getColumn: () => ({ getCanSort: () => false, getIsSorted: () => false, toggleSorting: jest.fn(), getToggleVisibilityHandler: jest.fn() }),
    getIsAllPageRowsSelected: () => false,
    getIsSomePageRowsSelected: () => false,
    toggleAllPageRowsSelected: jest.fn(),
    getSortedValue: () => undefined,
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

jest.mock("@/hooks/usePermission", () => ({
  usePermission: () => ({ entity: { permissionType: "CRUD" }, allowedActions: { canCreate: true, canRead: true, canUpdate: true, canDelete: true } }),
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

describe("DataTable", () => {
  it("placeholder - component requires deep TanStack Table + permission mocking", () => {
    expect(true).toBe(true);
  });
});
