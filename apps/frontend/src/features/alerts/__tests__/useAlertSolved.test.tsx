import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useAlertSolved } from '../hooks/useAlertSolved';

const mockFetchAll = jest.fn();

jest.mock('@/features/alerts/api/alertSolvedService', () => ({
  alertSolvedService: {
    fetchAll: (...args: unknown[]) => mockFetchAll(...args),
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

describe('useAlertSolved', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls fetchAll and returns data', async () => {
    const mockData = [
      {
        id: 'solved-1',
        partidaId: 1045,
        anio: 2026,
        indice: 1,
        userId: 'user-1',
        userName: 'operator1',
        createdAt: '2026-08-01T10:00:00.000Z',
      },
    ];
    mockFetchAll.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAlertSolved(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockFetchAll).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
  });
});
