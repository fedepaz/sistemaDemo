# Loading Strategy

## Overview

This document defines the standard loading patterns for AgriManage.
Every loading state must follow these rules to ensure consistency,
accessibility, and zero layout shift across the application.

**Principle:** Every loading state uses a skeleton. Spinners only for
initial app boot and button-level async feedback.

---

## The Two Tiers

### Tier 1: Section-Level (`<LoadingBoundary>`)

Every data-fetching section within a page MUST use `<LoadingBoundary>`.
This wraps `<Suspense>` with a required skeleton prop. There are NO
route-level `loading.tsx` files — the auth gate in `DashboardProtectedLayout`
renders children directly during `profileLoading`.

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
- Skeleton components live in the feature directory: `features/{name}/components/{name}-skeleton.tsx`

### Tier 2: Inline (Button States)

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
| Full-page skeleton on page load | Content-area skeleton inside `<LoadingBoundary>` |
| Skeleton with wrong dimensions | Skeleton that mirrors real component exactly |
| Skeleton in a separate directory | Skeleton colocated with its feature |
| `useEffect` fetch + manual loading state | Server component with `<LoadingBoundary>` |

---

## isFetching Skeleton Anti-Pattern

**Don't** render a second skeleton below data that's already displayed:

```tsx
// WRONG — shows a skeleton flash below the actual table
{isFetching && <DataTableSkeleton />}
<DataTable data={data} />
```

**Do** let the data stay visible during background refetches:

```tsx
// CORRECT — data stays on screen, React Query handles freshness
<DataTable data={data} />
```

React Query's `staleTime` controls when refetches happen. The data is
already cached and displayed — a second skeleton is just visual noise.

---

## Pre-Merge Checklist

- [ ] Every data-fetching section uses `<LoadingBoundary>`
- [ ] Every skeleton mirrors its real component
- [ ] No raw `<Suspense fallback={<LoadingSpinner />}>` in source
- [ ] No `loading.tsx` route files
- [ ] `LoadingSpinner` only appears in: root layout (boot) or button states
- [ ] Skeleton file is colocated with its feature
- [ ] Skeleton passes reduced-motion check
