import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useDashboardKPIs,
  useForecastKPIs,
  useDashboardAlerts,
} from '../../hooks/hooks';

const mockFetchKPIs = jest.fn();
const mockFetchForecastKPIs = jest.fn();
const mockFetchAlerts = jest.fn();

jest.mock('@/features/dashboard/api/dashboardService', () => ({
  dashboardService: {
    fetchKPIs: (...args: unknown[]) => mockFetchKPIs(...args),
    fetchForecastKPIs: (...args: unknown[]) => mockFetchForecastKPIs(...args),
    fetchAlerts: (...args: unknown[]) => mockFetchAlerts(...args),
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

describe('dashboard hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useDashboardKPIs', () => {
    it('calls fetchKPIs and returns data', async () => {
      const mockData = [
        { label: 'Temperatura', value: '25.3', unit: '°C', trend: 'stable' },
      ];
      mockFetchKPIs.mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardKPIs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockFetchKPIs).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useForecastKPIs', () => {
    it('calls fetchForecastKPIs and returns data', async () => {
      const mockData = [{ date: new Date(), maxTemp: 28, minTemp: 15 }];
      mockFetchForecastKPIs.mockResolvedValue(mockData);

      const { result } = renderHook(() => useForecastKPIs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockFetchForecastKPIs).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useDashboardAlerts', () => {
    it('calls fetchAlerts and returns data', async () => {
      const mockData = [
        { name: 'Dólar Oficial', code: 'USD', buyRate: 1000, sellRate: 1050 },
      ];
      mockFetchAlerts.mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockFetchAlerts).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockData);
    });
  });
});
