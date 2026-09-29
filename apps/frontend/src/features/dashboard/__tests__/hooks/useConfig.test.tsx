import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useConfig, useCompanyData } from '../../hooks/useConfig';

const mockFetchAll = jest.fn();

jest.mock('@/features/dashboard/api/configService', () => ({
  configService: {
    fetchAll: (...args: unknown[]) => mockFetchAll(...args),
  },
}));

const createWrapper = (config?: { initialData?: unknown[] }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        ...(config?.initialData !== undefined && {
          gcTime: 0,
        }),
      },
    },
  });

  if (config?.initialData !== undefined) {
    queryClient.setQueryData(['l-config'], config.initialData);
  }

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};

describe('useConfig hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useConfig', () => {
    it('calls configService.fetchAll and returns data', async () => {
      const mockData = [
        { codigo: 'Nombre', nombre: 'Vivero Demo' },
        { codigo: 'Direccion', nombre: 'Av. Principal 123' },
      ];
      mockFetchAll.mockResolvedValue(mockData);

      const { result } = renderHook(() => useConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockFetchAll).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useCompanyData', () => {
    it('returns company name and initials from config', async () => {
      const mockData = [
        { codigo: 'Nombre', nombre: 'Vivero Los Andes' },
      ];
      mockFetchAll.mockResolvedValue(mockData);

      const { result } = renderHook(() => useCompanyData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.name).toBe('Vivero Los Andes');
      });

      expect(result.current.initials).toBe('VL');
    });

    it('returns default "Demo" with initials "VD" when no Nombre config exists', async () => {
      const mockData = [
        { codigo: 'Direccion', nombre: 'Av. Principal' },
      ];
      mockFetchAll.mockResolvedValue(mockData);

      const { result } = renderHook(() => useCompanyData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.name).toBe('Demo');
      });

      expect(result.current.initials).toBe('VD');
    });

    it('handles single word company name', async () => {
      const mockData = [
        { codigo: 'Nombre', nombre: 'Sol' },
      ];
      mockFetchAll.mockResolvedValue(mockData);

      const { result } = renderHook(() => useCompanyData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.name).toBe('Sol');
      });

      expect(result.current.initials).toBe('S');
    });
  });
});
