import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertsDataTable } from '../alerts-data-table';

jest.mock('@/hooks/usePermission', () => ({
  usePermission: () => ({
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    scope: 'ALL',
    permissionType: 'FULL_ACCESS',
  }),
}));

jest.mock('@/features/permissions', () => ({
  useTableByName: () => ({ entity: { permissionType: 'CRUD' } }),
}));

jest.mock('@/hooks/useExportData', () => ({
  useExportData: () => ({
    handleExport: jest.fn(),
    isExporting: false,
  }),
}));

jest.mock('@/hooks/useDataTable', () => ({
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

jest.mock('@/hooks/useMediaQuery', () => ({
  useBreakpoint: () => 'lg',
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
Wrapper.displayName = 'Wrapper';

const createWrapper = () => Wrapper;

const mockColumns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
];

const mockData = [
  { id: 1, name: 'Test Item 1' },
  { id: 2, name: 'Test Item 2' },
];

describe('AlertsDataTable', () => {
  it('renders table with data', () => {
    render(
      <AlertsDataTable
        columns={mockColumns}
        data={mockData}
        title="Test Table"
        description="Test description"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Test Table')).toBeInTheDocument();
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(
      <AlertsDataTable
        columns={mockColumns}
        data={[]}
        title="Empty Table"
        description="Empty description"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Empty Table')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(
      <AlertsDataTable
        columns={mockColumns}
        data={mockData}
        title="Headers Table"
        description="Headers description"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
