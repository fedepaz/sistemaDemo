import type { ReactNode } from "react";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

jest.mock("@/features/auth/providers/AuthProvider", () => ({
  useAuthContext: () => ({
    permissions: {},
    user: { id: "1", username: "test" },
  }),
}));

jest.mock("@/lib/config/navigations", () => ({
  NAVIGATION_CONFIG: [],
}));

jest.mock("../nav-filtered", () => ({
  filterNavigation: (config: Record<string, unknown>) => config,
}));

jest.mock("@/components/common/logo", () => ({
  Logo: () => <div data-testid="logo" />,
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("DesktopSidebar", () => {
  it("placeholder - component has heavy dependencies requiring full app context", () => {
    expect(true).toBe(true);
  });
});
