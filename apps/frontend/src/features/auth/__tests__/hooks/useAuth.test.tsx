import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

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

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('returns initial state with no localStorage', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.accessToken).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isSignedIn).toBe(false);
  });

  it('reads token from localStorage', () => {
    localStorage.setItem('accessToken', 'token123');
    localStorage.setItem(
      'userProfile',
      JSON.stringify({ id: '1', username: 'admin' }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.accessToken).toBe('token123');
    expect(result.current.user).toEqual({ id: '1', username: 'admin' });
    expect(result.current.isSignedIn).toBe(true);
  });

  it('signIn stores token and user in localStorage', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.signIn('token123', { id: '1', username: 'admin' });
    });

    expect(localStorage.getItem('accessToken')).toBe('token123');
    expect(JSON.parse(localStorage.getItem('userProfile')!)).toEqual({
      id: '1',
      username: 'admin',
    });
    expect(result.current.isSignedIn).toBe(true);
  });

  it('signOut clears localStorage and resets state', () => {
    localStorage.setItem('accessToken', 'token123');
    localStorage.setItem(
      'userProfile',
      JSON.stringify({ id: '1', username: 'admin' }),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.signOut();
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('userProfile')).toBeNull();
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.accessToken).toBeNull();
    expect(result.current.user).toBeNull();
  });
});