import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { LoginForm } from '../../components/login-form';
import { expectNoA11yViolations } from '@/lib/testing/accessibility-utils';

jest.mock('../../hooks/useLogin', () => ({
  useLogin: () => ({
    loginAsync: jest.fn(),
    isLoading: false,
  }),
}));

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

describe('LoginForm Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <LoginForm onDefaultPassword={jest.fn()} />,
      { wrapper: createWrapper() },
    );

    await expectNoA11yViolations(container);
  });
});
