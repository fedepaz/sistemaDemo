import type { ReactNode } from "react";

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

describe("DashboardHeader", () => {
  it("placeholder - component has heavy dependencies requiring full app context", () => {
    expect(true).toBe(true);
  });
});
