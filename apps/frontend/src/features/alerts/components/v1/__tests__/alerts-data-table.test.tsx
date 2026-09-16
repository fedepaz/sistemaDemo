/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act, fireEvent } from '@testing-library/react';
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

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => { e.preventDefault(); fn({}); },
    formState: { isValid: true, isSubmitting: false },
    reset: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn().mockReturnValue({}),
    watch: jest.fn(),
    register: jest.fn().mockReturnValue({ name: "", ref: jest.fn(), onChange: jest.fn(), onBlur: jest.fn() }),
  }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/features/alerts/hooks/useAlertCommentsMutation', () => ({
  useAlertCommentsMutation: () => ({
    mutate: jest.fn(),
  }),
}));

jest.mock('@/features/alerts/components/v1/alerts-view-form', () => ({
  AlertsViewForm: () => <div data-testid="alerts-view-form" />,
}));

jest.mock('@/features/alerts/components/v1/alert-edit-form', () => ({
  AlertEditForm: () => <div data-testid="alert-edit-form" />,
}));

jest.mock('@/features/alerts/components/shared/alert-solved-button', () => ({
  AlertSolvedButton: () => <div data-testid="alert-solved-button" />,
}));

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

let capturedProps: any = null;

jest.mock('@/components/data-display/data-table', () => ({
  DataTable: ({ title, data, columns, onEdit }: any) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      {columns?.map((col: any) => (
        <span key={col.accessorKey}>{col.header}</span>
      ))}
      {data?.length === 0 && <span>No se encontraron resultados</span>}
      {data?.map((row: any, i: number) => (
        <div key={i}>
          {Object.values(row).map((val: any, j: number) => (
            <span key={j}>{String(val)}</span>
          ))}
          <button onClick={() => onEdit?.(row)}>Comment</button>
        </div>
      ))}
    </div>
  ),
  SlideOverForm: (props: any) => {
    capturedProps = props;
    return props.open ? <div data-testid="slide-over">{props.children}</div> : null;
  },
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
  beforeEach(() => {
    capturedProps = null;
  });

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

  it('passes correct summaryFields to SlideOverForm', () => {
    const mockAlertData = [
      { id: 1, name: 'Test Alert', partidaId: 1, anio: 2024, indice: 1 },
    ];

    const { container } = render(
      <AlertsDataTable
        columns={mockColumns}
        data={mockAlertData}
        title="Alerts Table"
        description="Alerts description"
        alertType="siembra-retrasada"
      />,
      { wrapper: createWrapper() }
    );

    const commentButtons = screen.getAllByText('Comment');
    act(() => {
      fireEvent.click(commentButtons[0]);
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.confirm.summaryFields).toEqual(["content"]);
  });
});
