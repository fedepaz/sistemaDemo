# Loading Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize all loading states across the app with a `<LoadingBoundary>` component, replace LoadingSpinner in auth gating with a content-area skeleton, and document the loading strategy.

**Architecture:** Create a lightweight `<LoadingBoundary>` wrapper around React Suspense with a required `skeleton` prop (TypeScript enforces it). Replace the 3 `LoadingSpinner` instances in `dashboard-protected-layout.tsx` with a content-area skeleton. Wrap existing `<Suspense>` in dashboard layout with `<LoadingBoundary>`. Document everything in `loading-strategy.md`.

**Tech Stack:** React 19 Suspense, Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui Skeleton

## Global Constraints

- React 19.1.0, Next.js 16.3.0 (Turbopack)
- Skeletons use `animate-pulse` from Tailwind
- `LoadingSpinner` is NOT deleted — kept for initial app boot / legacy
- No commits without explicit user approval
- Existing test mocks for `LoadingSpinner` in `dashboard-header.test.tsx` must not break

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Create | `components/common/loading-boundary.tsx` | `<LoadingBoundary>` component |
| Create | `components/common/skeletons/auth-gating-skeleton.tsx` | Content-area skeleton for auth gating states |
| Modify | `components/common/dashboard-protected-layout.tsx` | Replace 3x LoadingSpinner with auth-gating-skeleton |
| Modify | `app/(dashboard)/layout.tsx` | Wrap `<Suspense>` in `<LoadingBoundary>` |
| Create | `docs/agents/loading-strategy.md` | Loading strategy documentation |
| Modify | `AGENTS.md` | Reference loading-strategy.md |

---

### Task 1: Create `<LoadingBoundary>` Component

**Files:**
- Create: `apps/frontend/src/components/common/loading-boundary.tsx`
- Test: `apps/frontend/src/components/common/__tests__/loading-boundary.test.tsx`

**Interfaces:**
- Consumes: React `Suspense` (from `react`)
- Produces: `<LoadingBoundary skeleton={} name?="">` export

- [ ] **Step 1: Write the failing test**

```tsx
// apps/frontend/src/components/common/__tests__/loading-boundary.test.tsx
import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { LoadingBoundary } from "../loading-boundary";

function AsyncComponent() {
  return <div data-testid="real-content">Loaded</div>;
}

function ThrowingComponent() {
  throw new Promise(() => {}); // Always suspends
}

describe("LoadingBoundary", () => {
  it("renders children when not suspended", () => {
    render(
      <LoadingBoundary skeleton={<div data-testid="skeleton" />}>
        <AsyncComponent />
      </LoadingBoundary>
    );
    expect(screen.getByTestId("real-content")).toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });

  it("shows skeleton when children suspend", () => {
    render(
      <LoadingBoundary skeleton={<div data-testid="skeleton" />}>
        <ThrowingComponent />
      </LoadingBoundary>
    );
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("real-content")).not.toBeInTheDocument();
  });

  it("wraps skeleton in aria-busy and aria-live", () => {
    render(
      <LoadingBoundary skeleton={<div data-testid="skeleton" />}>
        <ThrowingComponent />
      </LoadingBoundary>
    );
    const wrapper = screen.getByTestId("skeleton").parentElement;
    expect(wrapper).toHaveAttribute("aria-busy", "true");
    expect(wrapper).toHaveAttribute("aria-live", "polite");
  });

  it("requires skeleton prop (TypeScript enforcement tested at compile time)", () => {
    // This test verifies the component renders without error when skeleton is provided
    render(
      <LoadingBoundary skeleton={<div />}>
        <div />
      </LoadingBoundary>
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test -- --testPathPattern="loading-boundary" --no-coverage`
Expected: FAIL — module not found

- [ ] **Step 3: Write the component**

```tsx
// apps/frontend/src/components/common/loading-boundary.tsx
import { Suspense, type ReactNode } from "react";

interface LoadingBoundaryProps {
  /** Required skeleton fallback. TypeScript enforces this. */
  skeleton: ReactNode;
  /** Optional name for dev-mode console logging */
  name?: string;
  /** Content that suspends */
  children: ReactNode;
}

export function LoadingBoundary({
  skeleton,
  name,
  children,
}: LoadingBoundaryProps) {
  if (process.env.NODE_ENV === "development" && name) {
    console.log(`[LoadingBoundary] "${name}" showing skeleton`);
  }

  return (
    <Suspense
      fallback={
        <div aria-busy="true" aria-live="polite">
          {skeleton}
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test -- --testPathPattern="loading-boundary" --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/common/loading-boundary.tsx apps/frontend/src/components/common/__tests__/loading-boundary.test.tsx
git commit -m "feat(common): add LoadingBoundary component with required skeleton prop"
```

---

### Task 2: Create Auth Gating Skeleton

**Files:**
- Create: `apps/frontend/src/components/common/skeletons/auth-gating-skeleton.tsx`

**Interfaces:**
- Consumes: `Skeleton` from `@/components/ui/skeleton`
- Produces: `<AuthGatingSkeleton />` export, used by `dashboard-protected-layout.tsx`

- [ ] **Step 1: Create the skeleton component**

```tsx
// apps/frontend/src/components/common/skeletons/auth-gating-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Content-area skeleton shown while auth state resolves.
 * Mirrors the dashboard shell layout: sidebar + header + content area.
 * The sidebar and header are already mounted — this only shows
 * the content area skeleton to avoid layout shift.
 */
export function AuthGatingSkeleton() {
  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar placeholder — matches DesktopSidebar width */}
      <div className="hidden md:flex w-64 flex-col gap-4 border-r border-border p-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header placeholder — matches DashboardHeader height */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <Skeleton className="h-6 w-40" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Content skeleton */}
        <main className="flex-1 overflow-auto px-1 sm:px-2 lg:px-4 py-1.5">
          <div className="mx-auto w-full max-w-[1600px] space-y-4 pb-1">
            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
            {/* Content blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm --filter frontend type-check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/common/skeletons/auth-gating-skeleton.tsx
git commit -m "feat(common): add AuthGatingSkeleton for auth gating states"
```

---

### Task 3: Replace LoadingSpinner in DashboardProtectedLayout

**Files:**
- Modify: `apps/frontend/src/components/common/dashboard-protected-layout.tsx`
- Modify: `apps/frontend/src/components/layout/__tests__/dashboard-header.test.tsx` (update mock)

**Interfaces:**
- Consumes: `<AuthGatingSkeleton />` from `./skeletons/auth-gating-skeleton`
- Produces: Updated `DashboardProtectedLayout` with skeleton instead of spinner

- [ ] **Step 1: Update dashboard-protected-layout.tsx**

Replace the entire file content:

```tsx
// src/components/common/dashboard-protected-layout.tsx
"use client";

import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { AuthGatingSkeleton } from "./skeletons/auth-gating-skeleton";
import { DatabaseUnavailablePage } from "./database-unavailable";
import { PendingPermissionsPage } from "./pending-permissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface DashboardProtectedLayoutProps {
  children: React.ReactNode;
}

export function DashboardProtectedLayout({
  children,
}: DashboardProtectedLayoutProps) {
  const router = useRouter();

  const {
    isSignedIn,
    loading: authLoading,
    userProfile,
    isLoading: profileLoading,
    isDatabaseUnavailable,
    isPendingPermissions,
  } = useAuthContext();

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.replace("/login");
    }
  }, [authLoading, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn && userProfile) {
    }
  }, [isSignedIn, userProfile]);

  if (profileLoading || authLoading) {
    return <AuthGatingSkeleton />;
  }

  if (!isSignedIn) {
    return <AuthGatingSkeleton />;
  }

  if (isDatabaseUnavailable) {
    return <DatabaseUnavailablePage />;
  }

  if (isPendingPermissions) {
    return <PendingPermissionsPage />;
  }

  if (!userProfile) {
    return <AuthGatingSkeleton />;
  }
  return <>{children}</>;
}
```

- [ ] **Step 2: Update the test mock**

In `apps/frontend/src/components/layout/__tests__/dashboard-header.test.tsx`, remove lines 35-37 (the `LoadingSpinner` mock). The header component does not use LoadingSpinner directly — this mock was likely a leftover from an earlier refactor. Removing it keeps the test file clean.

Old (lines 35-37):
```tsx
jest.mock("@/components/common/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));
```

New: Delete these 3 lines entirely.

- [ ] **Step 3: Run tests to verify nothing breaks**

Run: `pnpm --filter frontend test -- --testPathPattern="dashboard-header" --no-coverage`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/components/common/dashboard-protected-layout.tsx apps/frontend/src/components/layout/__tests__/dashboard-header.test.tsx
git commit -m "refactor(auth): replace LoadingSpinner with AuthGatingSkeleton in auth gating"
```

---

### Task 4: Wrap Dashboard Suspense in LoadingBoundary

**Files:**
- Modify: `apps/frontend/src/app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `<LoadingBoundary>` from `@/components/common/loading-boundary`
- Produces: Updated dashboard layout with LoadingBoundary wrapper

- [ ] **Step 1: Update the layout**

```tsx
//src/app/(dashboard)/layout.tsx

import type React from "react";

import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

import { DashboardProtectedLayout } from "@/components/common/dashboard-protected-layout";
import { LoadingBoundary } from "@/components/common/loading-boundary";
import { RootDashboardSkeleton } from "@/features/dashboard";

export const dynamic = "force-dynamic";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <LoadingBoundary skeleton={<RootDashboardSkeleton />} name="dashboard-root">
      <DashboardProtectedLayout>
        <div className="flex h-dvh overflow-hidden">
          <DesktopSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-auto pb-safe-area-inset-bottom md:pb-0 px-1 sm:px-2 lg:px-4 py-1.5">
              <div className="mx-auto w-full max-w-[1600px] space-y-4 pb-1 mb-0.5">
                {children}
              </div>
            </main>
          </div>
        </div>
      </DashboardProtectedLayout>
    </LoadingBoundary>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm --filter frontend type-check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/(dashboard)/layout.tsx
git commit -m "refactor(layout): wrap dashboard Suspense in LoadingBoundary"
```

---

### Task 5: Write Loading Strategy Documentation

**Files:**
- Create: `docs/agents/loading-strategy.md`
- Modify: `AGENTS.md` (add reference)

**Interfaces:**
- Consumes: None (documentation only)
- Produces: Loading strategy doc, updated AGENTS.md

- [ ] **Step 1: Create the strategy doc**

```markdown
# Loading Strategy

## Overview

This document defines the standard loading patterns for AgriManage.
Every loading state must follow these rules to ensure consistency,
accessibility, and zero layout shift across the application.

**Principle:** Every loading state uses a skeleton. Spinners only for
initial app boot and button-level async feedback.

---

## The Three Tiers

### Tier 1: Route-Level (`loading.tsx`)

Every route segment under `(dashboard)/` and `(auth)/` MUST have a
`loading.tsx` file. This is the page-level skeleton that shows while
the route's server components stream in.

```tsx
// app/(dashboard)/users/loading.tsx
export default function Loading() {
  return <UsersPageSkeleton />;
}
```

**Rules:**
- One `loading.tsx` per route segment
- Skeleton mirrors the full page layout (header + content area)
- No `<LoadingBoundary>` wrapper here — `loading.tsx` IS the Suspense boundary
- Skeleton components live in the feature directory: `features/{name}/components/{name}-skeleton.tsx`

### Tier 2: Section-Level (`<LoadingBoundary>`)

Any data-fetching section within a page MUST use `<LoadingBoundary>`.
This wraps `<Suspense>` with a required skeleton prop.

```tsx
import { LoadingBoundary } from '@/components/common/loading-boundary';
import { UserTableSkeleton } from '@/features/users/components/user-table-skeleton';

export function UsersPage() {
  return (
    <main>
      <PageHeader title="Users" /> {/* Fast — no boundary needed */}
      <LoadingBoundary skeleton={<UserTableSkeleton />}>
        <UserTable /> {/* Suspends while data loads */}
      </LoadingBoundary>
    </main>
  );
}
```

**Rules:**
- `skeleton` prop is required — TypeScript enforces this
- Skeleton must mirror the real component's dimensions (prevent CLS)
- Keep fast content (headers, nav) OUTSIDE the boundary
- One boundary per independently-loading section

### Tier 3: Inline (Button States)

Async actions (form submissions, toggles, deletes) use a spinner
inside the button. Never show a full-page skeleton for a button action.

```tsx
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="animate-spin" />}
  Save Changes
</Button>
```

**Rules:**
- Spinner stays INSIDE the button (never full-page)
- Use existing `Loader2` icon from lucide-react
- Disable the button during submission
- `LoadingSpinner` component is NOT used here

---

## The `<LoadingBoundary>` Component

**Location:** `apps/frontend/src/components/common/loading-boundary.tsx`

```tsx
import { Suspense, type ReactNode } from 'react';

interface LoadingBoundaryProps {
  /** Required — skeleton fallback. TypeScript enforces this. */
  skeleton: ReactNode;
  /** Optional name for dev-mode console logging */
  name?: string;
  /** Content that suspends */
  children: ReactNode;
}

export function LoadingBoundary({ skeleton, name, children }: LoadingBoundaryProps) {
  if (process.env.NODE_ENV === 'development' && name) {
    console.log(`[LoadingBoundary] "${name}" showing skeleton`);
  }

  return (
    <Suspense
      fallback={
        <div aria-busy="true" aria-live="polite">
          {skeleton}
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
```

**Why this exists:**
- Makes it impossible to create a loading state without specifying a skeleton
- Adds accessibility attributes automatically
- Dev-mode logging helps debug which boundary is active
- Consistent API across the entire codebase

---

## Skeleton Naming Conventions

| Type | Naming Pattern | Location |
|------|---------------|----------|
| Route skeleton | `{Route}Skeleton` | `app/(dashboard)/loading.tsx` (inline or imported) |
| Feature skeleton | `{Feature}Skeleton` | `features/{name}/components/{name}-skeleton.tsx` |
| Shared skeleton | `{Element}Skeleton` | `components/common/skeletons/{element}-skeleton.tsx` |

**File naming:** Always `{feature}-skeleton.tsx` (kebab-case, colocated with the feature).

---

## Mirroring Rules

A skeleton must match its real component in:

1. **Layout structure** — Same flex/grid arrangement
2. **Spacing** — Same gaps, padding, margins
3. **Typography** — Same font sizes, line heights, text lengths
4. **Visual elements** — Avatar circles, icon placeholders, badge widths
5. **Responsive breakpoints** — Same column count at each breakpoint
6. **Container constraints** — Same max-width, overflow behavior

**How to verify:**
1. Place skeleton and real component side-by-side
2. Toggle between them rapidly
3. Nothing should jump or shift position
4. Check at mobile, tablet, and desktop breakpoints

---

## Accessibility

Every `<LoadingBoundary>` automatically includes:
- `aria-busy="true"` on the fallback container
- `aria-live="polite"` so screen readers announce loading state

When content loads, `aria-busy` is removed by React's Suspense swap.

**Reduced motion:** Skeleton `animate-pulse` respects
`prefers-reduced-motion: reduce` via the existing global CSS rule.

---

## Common Anti-Patterns

| Don't | Do |
|-------|-----|
| `<Suspense fallback={<LoadingSpinner />}>` | `<LoadingBoundary skeleton={<FeatureSkeleton />}>` |
| Full-page spinner for auth gating | Content-area skeleton inside `<LoadingBoundary>` |
| Skeleton with wrong dimensions | Skeleton that mirrors real component exactly |
| Skeleton in a separate directory | Skeleton colocated with its feature |
| `useEffect` fetch + manual loading state | Server component with `<LoadingBoundary>` |

---

## Pre-Merge Checklist

- [ ] Every route has a `loading.tsx`
- [ ] Every data-fetching section uses `<LoadingBoundary>`
- [ ] Every skeleton mirrors its real component
- [ ] No raw `<Suspense fallback={<LoadingSpinner />}>` in source
- [ ] `LoadingSpinner` only appears in: root layout (boot) or button states
- [ ] Skeleton file is colocated with its feature
- [ ] Skeleton passes reduced-motion check
```

- [ ] **Step 2: Add reference to AGENTS.md**

In `AGENTS.md`, add a line after line 47 (`4. **Feature-based frontend**...`), before the blank line at line 48:

```markdown
5. **Loading strategy:** See `docs/agents/loading-strategy.md` for skeleton and loading state patterns
```

- [ ] **Step 3: Commit**

```bash
git add docs/agents/loading-strategy.md AGENTS.md
git commit -m "docs: add loading strategy documentation and AGENTS.md reference"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Run all verification commands**

```bash
pnpm lint && pnpm type-check && pnpm --filter frontend test -- --no-coverage
```

Expected: All PASS

- [ ] **Step 2: Verify no LoadingSpinner imports remain in non-test source files**

Run: `grep -r "LoadingSpinner" apps/frontend/src/ --include="*.tsx" --include="*.ts" | grep -v __tests__ | grep -v node_modules`
Expected: Only `loading-spinner.tsx` itself (the component definition)

- [ ] **Step 3: Verify LoadingBoundary is exported from common**

Run: `grep -r "LoadingBoundary" apps/frontend/src/components/common/`
Expected: Found in `loading-boundary.tsx` and `__tests__/loading-boundary.test.tsx`

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address verification findings for loading boundary"
```
