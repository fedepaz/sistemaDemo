import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useLogin } from '../../hooks/useLogin';

const mockLogin = jest.fn();

jest.mock('../../api/authService', () => ({
  authService: {
    login: (...args: unknown[]) => mockLogin(...args),
  },
}));

const mockSignIn = jest.fn();

jest.mock('../../providers/AuthProvider', () => ({
  useAuthContext: () => ({
    signIn: mockSignIn,
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
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

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('calls authService.login on mutate', async () => {
    const mockResponse = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      user: { id: '1', username: 'admin' },
      isDefaultPassword: false,
    };
    mockLogin.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.loginAsync({ username: 'admin', password: 'pass' });
    });

    expect(mockLogin).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'admin', password: 'pass' }),
      expect.anything(),
    );
  });

  it('stores refreshToken in localStorage on success', async () => {
    const mockResponse = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      user: { id: '1', username: 'admin' },
      isDefaultPassword: false,
    };
    mockLogin.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.loginAsync({ username: 'admin', password: 'pass' });
    });

    expect(localStorage.getItem('refreshToken')).toBe('refresh123');
  });

  it('calls signIn on success', async () => {
    const mockResponse = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      user: { id: '1', username: 'admin' },
      isDefaultPassword: false,
    };
    mockLogin.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.loginAsync({ username: 'admin', password: 'pass' });
    });

    expect(mockSignIn).toHaveBeenCalledWith('token123', {
      id: '1',
      username: 'admin',
    });
  });

  it('shows toast.success on normal login', async () => {
    const mockResponse = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      user: { id: '1', username: 'admin' },
      isDefaultPassword: false,
    };
    mockLogin.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.loginAsync({ username: 'admin', password: 'pass' });
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Inicio de sesión exitoso como admin',
      { duration: 3000 },
    );
  });

  it('shows toast.info on default password login', async () => {
    const mockResponse = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      user: { id: '1', username: 'admin' },
      isDefaultPassword: true,
    };
    mockLogin.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.loginAsync({ username: 'admin', password: 'pass' });
    });

    expect(toast.info).toHaveBeenCalledWith(
      'Contraseña por defecto, se abrirá un formulario para cambiar la contraseña',
      { duration: 3000 },
    );
  });
});