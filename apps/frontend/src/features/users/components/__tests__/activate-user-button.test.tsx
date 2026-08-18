import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivateUserButton } from '../activate-user-button';
import { UserProfileDto } from '@vivero/shared';

const mockMutateAsync = jest.fn();

jest.mock('@/features/users/hooks/usersHooks', () => ({
  useActivateUser: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockSelectedUser: UserProfileDto = {
  id: 'user-123',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  isActive: false,
  tenantId: 'tenant-1',
  tenantName: 'Test Tenant',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
  deletedByUserId: null,
  lastLogin: null,
};

describe('ActivateUserButton', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with correct text', () => {
    render(
      <ActivateUserButton
        selectedUser={mockSelectedUser}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(
      screen.getByRole('button', { name: /activar usuario/i }),
    ).toBeInTheDocument();
  });

  it('opens dialog when clicked', async () => {
    const user = userEvent.setup();

    render(
      <ActivateUserButton
        selectedUser={mockSelectedUser}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /activar usuario/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  it('calls mutateAsync with correct data on confirm', async () => {
    mockMutateAsync.mockResolvedValue({
      success: true,
      message: 'Usuario activado exitosamente',
    });
    const user = userEvent.setup();

    render(
      <ActivateUserButton
        selectedUser={mockSelectedUser}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /activar usuario/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /activar$/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith({ userId: 'user-123' });
  });

  it('calls onSuccess after successful activation', async () => {
    mockMutateAsync.mockResolvedValue({
      success: true,
      message: 'Usuario activado exitosamente',
    });
    const user = userEvent.setup();

    render(
      <ActivateUserButton
        selectedUser={mockSelectedUser}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /activar usuario/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /activar$/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('does not call onSuccess on error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(
      <ActivateUserButton
        selectedUser={mockSelectedUser}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /activar usuario/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /activar$/i }));

    await waitFor(() => {
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('closes dialog on cancel without calling mutateAsync', async () => {
    const user = userEvent.setup();

    render(
      <ActivateUserButton
        selectedUser={mockSelectedUser}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /activar usuario/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
