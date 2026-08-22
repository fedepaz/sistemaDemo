import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useRestorePassword } from '../hooks/usersHooks';

const mockRestorePassword = jest.fn();

jest.mock('@/features/users/api/userService', () => ({
  userService: {
    restorePassword: (...args: unknown[]) => mockRestorePassword(...args),
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

describe('useRestorePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls restorePassword and shows success toast on success', async () => {
    const mockResponse = {
      success: true,
      message: 'Contraseña restaurada correctamente',
    };
    mockRestorePassword.mockResolvedValue(mockResponse);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useRestorePassword(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ userId: 'user-123' });
    });

    expect(mockRestorePassword).toHaveBeenCalledWith({ userId: 'user-123' });
    expect(toast.success).toHaveBeenCalledWith(
      'Contraseña restaurada correctamente',
      { duration: 3000 },
    );
    expect(invalidateQueries).toHaveBeenCalled();
  });

  it('does not show toast on error', async () => {
    mockRestorePassword.mockRejectedValue(new Error('Network error'));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useRestorePassword(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ userId: 'user-123' });
      } catch {}
    });

    expect(toast.success).not.toHaveBeenCalled();
  });
});
