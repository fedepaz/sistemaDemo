import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useLogout } from '../../hooks/useLogout';

const mockLogout = jest.fn();

jest.mock('../../api/authService', () => ({
  authService: {
    logout: (...args: unknown[]) => mockLogout(...args),
  },
}));

const mockSignOut = jest.fn();

jest.mock('../../providers/AuthProvider', () => ({
  useAuthContext: () => ({
    signOut: mockSignOut,
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

import { toast } from 'sonner';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('calls authService.logout on mutate', async () => {
    mockLogout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.logoutAsync();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('removes refreshToken from localStorage on success', async () => {
    localStorage.setItem('refreshToken', 'refresh123');
    mockLogout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.logoutAsync();
    });

    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('calls signOut on success', async () => {
    mockLogout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.logoutAsync();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('shows toast.success', async () => {
    mockLogout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.logoutAsync();
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Sesión cerrada exitosamente',
      { duration: 3000 },
    );
  });
});