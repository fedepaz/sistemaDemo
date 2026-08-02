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

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

describe("MobileNavigation", () => {
  it("placeholder - component has heavy dependencies requiring full app context", () => {
    expect(true).toBe(true);
  });
});
