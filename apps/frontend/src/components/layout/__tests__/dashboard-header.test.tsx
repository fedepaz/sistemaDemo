import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
}));

jest.mock("@/features/auth/providers/AuthProvider", () => ({
  useAuthContext: () => ({
    userProfile: { id: "1", username: "test" },
    permissions: {},
  }),
}));

jest.mock("@/features/auth", () => ({
  useLogout: () => ({ logout: jest.fn(), isLoading: false }),
}));

jest.mock("@/lib/date-utils", () => ({
  getISOWeek: () => 28,
  getTotalWeeks: () => 52,
  formatSpanishDate: () => "20 de julio de 2026",
}));

jest.mock("../mobile-navigation", () => ({
  MobileNavigation: () => <div data-testid="mobile-nav" />,
}));

jest.mock("@/components/common/logo", () => ({
  Logo: () => <div data-testid="logo" />,
}));

jest.mock("@/components/common/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const mockUsePermission = jest.fn();
jest.mock("@/hooks/usePermission", () => ({
  usePermission: (table: string) => mockUsePermission(table),
}));

const mockUseHasAlerts = jest.fn();
jest.mock("@/features/alerts", () => ({
  useHasAlerts: (canRead: boolean) => mockUseHasAlerts(canRead),
}));

jest.mock("@/providers/alert-modal-provider", () => ({
  useAlertModal: () => ({ openAlert: jest.fn(), closeAlert: jest.fn(), state: { isOpen: false } }),
}));

jest.mock("@/components/modals/alert-modal-dialog", () => ({
  AlertModalDialog: () => <div data-testid="alert-modal-dialog" />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, ...props }: { children: ReactNode; disabled?: boolean; [key: string]: unknown }) => (
    <button disabled={disabled} {...props}>{children}</button>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
};

// Import after mocks
import { DashboardHeader } from "../dashboard-header";

describe("DashboardHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePermission.mockReturnValue({ canRead: false });
    mockUseHasAlerts.mockReturnValue({ hasAlerts: false, isLoading: false });
  });

  it("renders bell button when user has alerts permission", () => {
    mockUsePermission.mockReturnValue({ canRead: true });
    mockUseHasAlerts.mockReturnValue({ hasAlerts: true, isLoading: false });

    render(<DashboardHeader />, { wrapper: createWrapper() });

    expect(screen.getByLabelText("Alertas")).toBeInTheDocument();
  });

  it("hides bell button when user lacks alerts permission", () => {
    mockUsePermission.mockReturnValue({ canRead: false });

    render(<DashboardHeader />, { wrapper: createWrapper() });

    expect(screen.queryByLabelText("Alertas")).not.toBeInTheDocument();
  });

  it("hides alert modal dialog when user lacks alerts permission", () => {
    mockUsePermission.mockReturnValue({ canRead: false });

    render(<DashboardHeader />, { wrapper: createWrapper() });

    expect(screen.queryByTestId("alert-modal-dialog")).not.toBeInTheDocument();
  });

  it("disables bell button when there are no alerts", () => {
    mockUsePermission.mockReturnValue({ canRead: true });
    mockUseHasAlerts.mockReturnValue({ hasAlerts: false, isLoading: false });

    render(<DashboardHeader />, { wrapper: createWrapper() });

    const button = screen.getByLabelText("Alertas");
    expect(button).toBeDisabled();
  });

  it("enables bell button when there are alerts", () => {
    mockUsePermission.mockReturnValue({ canRead: true });
    mockUseHasAlerts.mockReturnValue({ hasAlerts: true, isLoading: false });

    render(<DashboardHeader />, { wrapper: createWrapper() });

    const button = screen.getByLabelText("Alertas");
    expect(button).not.toBeDisabled();
  });

  it("keeps button enabled while loading (optimistic)", () => {
    mockUsePermission.mockReturnValue({ canRead: true });
    mockUseHasAlerts.mockReturnValue({ hasAlerts: false, isLoading: true });

    render(<DashboardHeader />, { wrapper: createWrapper() });

    const button = screen.getByLabelText("Alertas");
    expect(button).not.toBeDisabled();
  });
});
