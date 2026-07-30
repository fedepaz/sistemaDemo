import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertsDashboardV1 } from '../AlertsDashboardV1';

jest.mock('@/features/alerts/hooks/useAlerts', () => ({
  useSiembraRetrasada: () => ({
    data: [
      {
        partidaId: 1045,
        anio: 2026,
        indice: 1,
        codigoEspecie: 'EUC01',
        nombreEspecie: 'Eucalipto Grandis',
        injerto: 'I001',
        nrocont: '48',
        contenedor: 'Ban Plastico',
        semSiembra: '24-2026',
        fechaSugeridaSiembra: '2026-06-01',
        fSiembra: 0,
        semEntrega: '28-2026 1',
        fEnt: '2026-07-15',
        estado: 'PENDIENTE',
      },
    ],
    isLoading: false,
  }),
  useFaltaGerminacion: () => ({ data: [], isLoading: false }),
  useFaltantePlantas: () => ({ data: [], isLoading: false }),
  useFaltaPreExpedicion: () => ({ data: [], isLoading: false }),
}));

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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};

describe('AlertsDashboardV1', () => {
  it('renders without crashing', () => {
    render(<AlertsDashboardV1 />, { wrapper: createWrapper() });
    expect(screen.getAllByText('Siembra Retrasada').length).toBeGreaterThanOrEqual(1);
  });

  it('displays siembra retrasada count', () => {
    render(<AlertsDashboardV1 />, { wrapper: createWrapper() });
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all four alert summary cards', () => {
    render(<AlertsDashboardV1 />, { wrapper: createWrapper() });
    expect(screen.getAllByText('Siembra Retrasada').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Falta Recuento Germinación')).toBeInTheDocument();
    expect(screen.getByText('Faltante Estimado de Plantas')).toBeInTheDocument();
    expect(screen.getByText('Falta Pre-Expedición')).toBeInTheDocument();
  });
});
