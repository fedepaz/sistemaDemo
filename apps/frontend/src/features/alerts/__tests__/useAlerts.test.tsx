import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useSiembraRetrasada,
  useFaltaGerminacion,
  useFaltantePlantas,
  useFaltaPreExpedicion,
} from '../hooks/useAlerts';

const mockFetchSiembraRetrasada = jest.fn();
const mockFetchFaltaGerminacion = jest.fn();
const mockFetchFaltantePlantas = jest.fn();
const mockFetchFaltaPreExpedicion = jest.fn();

jest.mock('@/features/alerts/api/alertService', () => ({
  alertService: {
    fetchSiembraRetrasada: (...args: unknown[]) => mockFetchSiembraRetrasada(...args),
    fetchFaltaGerminacion: (...args: unknown[]) => mockFetchFaltaGerminacion(...args),
    fetchFaltantePlantas: (...args: unknown[]) => mockFetchFaltantePlantas(...args),
    fetchFaltaPreExpedicion: (...args: unknown[]) => mockFetchFaltaPreExpedicion(...args),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};

describe('useAlerts hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useSiembraRetrasada', () => {
    it('calls fetchSiembraRetrasada and returns data', async () => {
      const mockData = [{ partidaId: 1045, anio: 2026 }];
      mockFetchSiembraRetrasada.mockResolvedValue(mockData);

      const { result } = renderHook(() => useSiembraRetrasada(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockFetchSiembraRetrasada).toHaveBeenCalledTimes(1);
    });
  });

  describe('useFaltaGerminacion', () => {
    it('calls fetchFaltaGerminacion and returns data', async () => {
      const mockData = [{ partidaId: 1050, anio: 2026 }];
      mockFetchFaltaGerminacion.mockResolvedValue(mockData);

      const { result } = renderHook(() => useFaltaGerminacion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockFetchFaltaGerminacion).toHaveBeenCalledTimes(1);
    });
  });

  describe('useFaltantePlantas', () => {
    it('calls fetchFaltantePlantas and returns data', async () => {
      const mockData = [{ partidaId: 1048, anio: 2026 }];
      mockFetchFaltantePlantas.mockResolvedValue(mockData);

      const { result } = renderHook(() => useFaltantePlantas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockFetchFaltantePlantas).toHaveBeenCalledTimes(1);
    });
  });

  describe('useFaltaPreExpedicion', () => {
    it('calls fetchFaltaPreExpedicion and returns data', async () => {
      const mockData = [{ partidaId: 1052, anio: 2026 }];
      mockFetchFaltaPreExpedicion.mockResolvedValue(mockData);

      const { result } = renderHook(() => useFaltaPreExpedicion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockFetchFaltaPreExpedicion).toHaveBeenCalledTimes(1);
    });
  });
});
