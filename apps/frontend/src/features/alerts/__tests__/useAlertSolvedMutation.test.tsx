import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useAlertSolvedMutation } from '../hooks/useAlertSolvedMutation';

const mockCreate = jest.fn();

jest.mock('@/features/alerts/api/alertSolvedService', () => ({
  alertSolvedService: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock('@/lib/query-invalidation-map', () => ({
  invalidateQueries: jest.fn(),
}));

import { toast } from 'sonner';
import { invalidateQueries } from '@/lib/query-invalidation-map';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return { Wrapper, queryClient };
};

describe('useAlertSolvedMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls create and shows success toast on success', async () => {
    const mockResponse = {
      id: 'new-id',
      partidaId: 1045,
      anio: 2026,
      indice: 1,
      userId: 'user-1',
      userName: 'operator1',
      createdAt: '2026-08-01T10:00:00.000Z',
    };
    mockCreate.mockResolvedValue(mockResponse);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useAlertSolvedMutation(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        partidaId: 1045,
        anio: 2026,
        indice: 1,
      });
    });

    expect(mockCreate.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        partidaId: 1045,
        anio: 2026,
        indice: 1,
      }),
    );
    expect(toast.success).toHaveBeenCalledWith('Alerta resuelta', {
      duration: 3000,
    });
    expect(invalidateQueries).toHaveBeenCalled();
  });

  it('does not show toast on error', async () => {
    mockCreate.mockRejectedValue(new Error('Network error'));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useAlertSolvedMutation(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          partidaId: 1045,
          anio: 2026,
          indice: 1,
        });
      } catch {}
    });

    expect(toast.success).not.toHaveBeenCalled();
  });
});
