import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertSolvedButton } from '../alert-solved-button';
import { AlertBaseDto } from '@vivero/shared';

const mockMutate = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock('@/features/alerts/hooks/useAlertSolvedMutation', () => ({
  useAlertSolvedMutation: () => ({
    mutate: mockMutate,
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockSelectedAlert: AlertBaseDto = {
  partidaId: 1045,
  anio: 2026,
  indice: 1,
};

describe('AlertSolvedButton', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with correct text', () => {
    render(
      <AlertSolvedButton
        selectedAlert={mockSelectedAlert }
        onSuccess={mockOnSuccess}
      />,
    );

    expect(
      screen.getByRole('button', { name: /marcar alerta como resuelta/i }),
    ).toBeInTheDocument();
  });

  it('opens dialog when clicked', async () => {
    const user = userEvent.setup();

    render(
      <AlertSolvedButton
        selectedAlert={mockSelectedAlert }
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /marcar alerta como resuelta/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('alertdialog'),
      ).toBeInTheDocument();
    });
  });

  it('calls mutate with correct data on confirm', async () => {
    const user = userEvent.setup();

    render(
      <AlertSolvedButton
        selectedAlert={mockSelectedAlert }
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /marcar alerta como resuelta/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /marcar como resuelta/i }),
    );

    expect(mockMutate).toHaveBeenCalledWith({
      partidaId: 1045,
      anio: 2026,
      indice: 1,
    });
  });

  it('calls onSuccess after confirm', async () => {
    const user = userEvent.setup();

    render(
      <AlertSolvedButton
        selectedAlert={mockSelectedAlert }
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /marcar alerta como resuelta/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /marcar como resuelta/i }),
    );

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('closes dialog on cancel without calling mutate', async () => {
    const user = userEvent.setup();

    render(
      <AlertSolvedButton
        selectedAlert={mockSelectedAlert }
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /marcar alerta como resuelta/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
