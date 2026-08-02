# Alert Button Permission & Visual State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add permission-based rendering and visual feedback to the alert bell button in DashboardHeader.

**Architecture:** Create a `useHasAlerts` hook that queries all 4 alert types via `useQuery` (non-suspending) with `enabled: canRead`. Use the existing `usePermission("alerts")` hook for the permission gate. Conditionally render the button and modal dialog based on permission, and toggle disabled state based on alert data.

**Tech Stack:** React, TanStack Query, Vitest, shadcn/ui Button, existing `usePermission` hook

## Global Constraints

- Spanish-only UI strings
- Conventional Commits enforced by commitlint
- TDD: tests before implementation code
- Follow existing patterns: `usePermission` hook for permission checks, `alertService` for API calls, `alertsQueryKeys` for query keys
- No new design tokens, palettes, or typography

---

### Task 1: Create `useHasAlerts` hook with tests

**Files:**
- Create: `apps/frontend/src/features/alerts/hooks/useHasAlerts.ts`
- Create: `apps/frontend/src/features/alerts/__tests__/useHasAlerts.test.ts`

**Interfaces:**
- Consumes: `alertService` (4 fetch methods), `alertsQueryKeys`, `usePermission` hook
- Produces: `useHasAlerts(canRead: boolean)` returns `{ hasAlerts: boolean, isLoading: boolean }`

- [ ] **Step 1: Write the failing test**

```typescript
// apps/frontend/src/features/alerts/__tests__/useHasAlerts.test.ts
import { renderHook } from "@testing-library/react";
import { useHasAlerts } from "../hooks/useHasAlerts";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockFetchSiembraRetrasada = jest.fn();
const mockFetchFaltaGerminacion = jest.fn();
const mockFetchFaltantePlantas = jest.fn();
const mockFetchFaltaPreExpedicion = jest.fn();

jest.mock("@/features/alerts/api/alertService", () => ({
  alertService: {
    fetchSiembraRetrasada: (...args: unknown[]) => mockFetchSiembraRetrasada(...args),
    fetchFaltaGerminacion: (...args: unknown[]) => mockFetchFaltaGerminacion(...args),
    fetchFaltantePlantas: (...args: unknown[]) => mockFetchFaltantePlantas(...args),
    fetchFaltaPreExpedicion: (...args: unknown[]) => mockFetchFaltaPreExpedicion(...args),
  },
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

describe("useHasAlerts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchSiembraRetrasada.mockResolvedValue([]);
    mockFetchFaltaGerminacion.mockResolvedValue([]);
    mockFetchFaltantePlantas.mockResolvedValue([]);
    mockFetchFaltaPreExpedicion.mockResolvedValue([]);
  });

  it("returns hasAlerts false when all alert types return empty arrays", async () => {
    const { result } = renderHook(() => useHasAlerts(true), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for queries to settle
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAlerts).toBe(false);
  });

  it("returns hasAlerts true when at least one alert type has data", async () => {
    mockFetchSiembraRetrasada.mockResolvedValue([{ id: 1 }]);

    const { result } = renderHook(() => useHasAlerts(true), {
      wrapper: createWrapper(),
    });

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAlerts).toBe(true);
  });

  it("does not fetch when canRead is false", () => {
    renderHook(() => useHasAlerts(false), {
      wrapper: createWrapper(),
    });

    expect(mockFetchSiembraRetrasada).not.toHaveBeenCalled();
    expect(mockFetchFaltaGerminacion).not.toHaveBeenCalled();
    expect(mockFetchFaltantePlantas).not.toHaveBeenCalled();
    expect(mockFetchFaltaPreExpedicion).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test -- --run src/features/alerts/__tests__/useHasAlerts.test.ts`
Expected: FAIL with "Cannot find module '../hooks/useHasAlerts'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// apps/frontend/src/features/alerts/hooks/useHasAlerts.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { alertService } from "../api/alertService";
import { alertsQueryKeys } from "@/lib/queryKeys";

export function useHasAlerts(canRead: boolean) {
  const siembra = useQuery({
    queryKey: alertsQueryKeys.byType("siembra-retrasada"),
    queryFn: alertService.fetchSiembraRetrasada,
    enabled: canRead,
    refetchInterval: 30_000,
    staleTime: 5 * 60 * 1000,
  });

  const germinacion = useQuery({
    queryKey: alertsQueryKeys.byType("falta-germinacion"),
    queryFn: alertService.fetchFaltaGerminacion,
    enabled: canRead,
    refetchInterval: 30_000,
    staleTime: 5 * 60 * 1000,
  });

  const faltante = useQuery({
    queryKey: alertsQueryKeys.byType("faltante-plantas"),
    queryFn: alertService.fetchFaltantePlantas,
    enabled: canRead,
    refetchInterval: 30_000,
    staleTime: 5 * 60 * 1000,
  });

  const preExpedicion = useQuery({
    queryKey: alertsQueryKeys.byType("falta-pre-expedicion"),
    queryFn: alertService.fetchFaltaPreExpedicion,
    enabled: canRead,
    refetchInterval: 30_000,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = siembra.isLoading || germinacion.isLoading || faltante.isLoading || preExpedicion.isLoading;

  const hasAlerts =
    (siembra.data?.length ?? 0) > 0 ||
    (germinacion.data?.length ?? 0) > 0 ||
    (faltante.data?.length ?? 0) > 0 ||
    (preExpedicion.data?.length ?? 0) > 0;

  return { hasAlerts, isLoading };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test -- --run src/features/alerts/__tests__/useHasAlerts.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Export from feature barrel**

Edit `apps/frontend/src/features/alerts/index.ts` — add to Hooks section:

```typescript
export { useHasAlerts } from "./hooks/useHasAlerts";
```

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/features/alerts/hooks/useHasAlerts.ts apps/frontend/src/features/alerts/__tests__/useHasAlerts.test.ts apps/frontend/src/features/alerts/index.ts
git commit -m "feat(alerts): add useHasAlerts hook for alert existence check"
```

---

### Task 2: Update DashboardHeader with permission gate and disabled state

**Files:**
- Modify: `apps/frontend/src/components/layout/dashboard-header.tsx`
- Modify: `apps/frontend/src/components/layout/__tests__/dashboard-header.test.tsx`

**Interfaces:**
- Consumes: `usePermission("alerts")`, `useHasAlerts(canRead)`
- Produces: Updated `DashboardHeader` component with conditional rendering and disabled button

- [ ] **Step 1: Write the failing tests**

Replace the placeholder test in `dashboard-header.test.tsx`:

```typescript
// apps/frontend/src/components/layout/__tests__/dashboard-header.test.tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter frontend test -- --run src/components/layout/__tests__/dashboard-header.test.tsx`
Expected: FAIL — button always renders regardless of permission

- [ ] **Step 3: Update DashboardHeader implementation**

```typescript
// apps/frontend/src/components/layout/dashboard-header.tsx
"use client";

import { MobileNavigation } from "./mobile-navigation";

import { useLogout } from "@/features/auth";
import { LoadingSpinner } from "../common/loading-spinner";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "../common/logo";
import { getISOWeek, getTotalWeeks, formatSpanishDate } from "@/lib/date-utils";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlertModal } from "@/providers/alert-modal-provider";
import { AlertModalDialog } from "@/components/modals/alert-modal-dialog";
import { usePermission } from "@/hooks/usePermission";
import { useHasAlerts } from "@/features/alerts";

export function DashboardHeader() {
  const { openAlert } = useAlertModal();
  const { isLoading } = useLogout();
  const router = useRouter();
  const { userProfile } = useAuthContext();
  const { canRead } = usePermission("alerts");
  const { hasAlerts, isLoading: isLoadingAlerts } = useHasAlerts(canRead);

  const currentDate = new Date();
  const weekNum = getISOWeek(currentDate);
  const totalWeeks = getTotalWeeks(currentDate.getFullYear());
  const formattedDate = formatSpanishDate(currentDate);

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
    }
  }, [userProfile, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
      <div className="container mx-auto px-1">
        <div className="flex h-14 items-center justify-between">
          {/* Logo and Mobile Navigation */}
          <div className="flex items-center space-x-3">
            <MobileNavigation />
            <div className="flex items-center space-x-2 md:hidden">
              <Logo variant="icon" className="h-4 w-auto" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {/* Notifications */}
            {canRead && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openAlert("info")}
                disabled={!hasAlerts && !isLoadingAlerts}
                aria-label="Alertas"
                className="h-14 w-10 rounded-none"
              >
                <Bell className={`h-5 w-5 ${!hasAlerts && !isLoadingAlerts ? "text-muted-foreground/50" : "text-muted-foreground"}`} />
              </Button>
            )}

            {/* Week Display with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center px-3 border-r border-border/50 h-14 cursor-help">
                    <div className="flex flex-col items-end">
                      <p className="text-xl font-black text-foreground tracking-tighter leading-none">
                        S{weekNum}
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
                        Semana
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-popover border-border shadow-xl"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">
                      {formattedDate}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Semana {weekNum} de {totalWeeks}
                    </p>
                    <div className="pt-1 border-t border-border/50">
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Mendoza, Argentina
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      {canRead && <AlertModalDialog />}
    </header>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter frontend test -- --run src/components/layout/__tests__/dashboard-header.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Run full test suite to verify no regressions**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 6: Run lint and type-check**

Run: `pnpm lint && pnpm type-check`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/components/layout/dashboard-header.tsx apps/frontend/src/components/layout/__tests__/dashboard-header.test.tsx
git commit -m "feat(ui): add permission gate and disabled state to alert button"
```
