# Billboard UX/UI Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 UX/UI issues in the billboard feature identified during review: viewport unit, header icon, mobile padding, accessibility, and loading skeleton.

**Architecture:** Modify existing billboard components in-place. Create one new skeleton component. Switch billboard-check from `useQuery` to `useSuspenseQuery` + `LoadingBoundary` for proper loading states.

**Tech Stack:** React, shadcn/ui Dialog, lucide-react icons, @tanstack/react-query (useSuspenseQuery), Skeleton primitive

## Global Constraints

- Spanish UI copy (all user-facing text)
- OKLCH theme tokens only (no hardcoded colors)
- shadcn/ui component patterns (Dialog, AlertDialog, Button, Skeleton)
- Follows AlertModalDialog pattern for header icon styling
- `prefers-reduced-motion` handled by global CSS rule in `globals.css:281`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `apps/frontend/src/features/billboard/components/BillboardModal.tsx` | Modify | Fix vh→dvh, add icon, mobile padding, aria-label |
| `apps/frontend/src/features/billboard/components/BillboardModalSkeleton.tsx` | Create | New skeleton component |
| `apps/frontend/src/features/billboard/hooks/useUnreadBillboard.ts` | Modify | Switch to useSuspenseQuery |
| `apps/frontend/src/components/common/billboard-check.tsx` | Modify | Wrap in LoadingBoundary |
| `apps/frontend/src/features/billboard/index.ts` | Modify | Export new skeleton |

---

### Task 1: Fix viewport unit and mobile padding in BillboardModal

**Files:**
- Modify: `apps/frontend/src/features/billboard/components/BillboardModal.tsx:64,77`

**Interfaces:**
- Consumes: None (standalone change)
- Produces: None (visual fix only)

- [ ] **Step 1: Change `max-h-[90vh]` to `max-h-[90dvh]`**

In `BillboardModal.tsx:64`, change:
```tsx
<DialogContent className="max-h-[90vh] sm:max-w-lg">
```
to:
```tsx
<DialogContent className="max-h-[90dvh] sm:max-w-lg">
```

`dvh` (dynamic viewport height) accounts for mobile browser chrome (address bar, toolbar) that `vh` does not. This matches the `AlertModalDialog` pattern at `alert-modal-dialog.tsx:26`.

- [ ] **Step 2: Add responsive padding to message cards**

In `BillboardModal.tsx:77`, change:
```tsx
className="rounded-lg border bg-card p-4 space-y-2"
```
to:
```tsx
className="rounded-lg border bg-card p-3 sm:p-4 space-y-2"
```

`p-3` (12px) on small screens prevents cards from feeling cramped on mobile. `sm:p-4` (16px) maintains desktop spacing.

- [ ] **Step 3: Verify changes visually**

Run: `pnpm dev:frontend`
Open http://localhost:3000, trigger a billboard message, verify:
- Dialog fits within viewport on mobile (no overflow)
- Cards have appropriate padding at all breakpoints

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/billboard/components/BillboardModal.tsx
git commit -m "fix(billboard): use dvh for viewport height and responsive card padding"
```

---

### Task 2: Add header icon and aria-label to BillboardModal

**Files:**
- Modify: `apps/frontend/src/features/billboard/components/BillboardModal.tsx:4-12,64-71`

**Interfaces:**
- Consumes: None (standalone change)
- Produces: None (visual + a11y fix)

- [ ] **Step 1: Add Megaphone icon import**

In `BillboardModal.tsx`, add to the import block (after line 12):
```tsx
import { Megaphone } from "lucide-react";
```

- [ ] **Step 2: Add aria-label to DialogContent**

In `BillboardModal.tsx:64`, change:
```tsx
<DialogContent className="max-h-[90dvh] sm:max-w-lg">
```
to:
```tsx
<DialogContent className="max-h-[90dvh] sm:max-w-lg" aria-label="Actualizaciones del sistema">
```

- [ ] **Step 3: Add styled header with icon**

In `BillboardModal.tsx:65-71`, replace the DialogHeader block:
```tsx
<DialogHeader>
  <DialogTitle>Actualizaciones</DialogTitle>
  <DialogDescription>
    Hay {messages.length}{" "}
    {messages.length === 1 ? "novedad" : "novedades"} para ti.
  </DialogDescription>
</DialogHeader>
```

with (matching `AlertModalDialog` pattern at `alert-modal-dialog.tsx:29-41`):
```tsx
<DialogHeader className="border-b border-border/40 pb-4">
  <div className="flex items-center justify-center gap-3">
    <div className="p-2 rounded-lg bg-primary/10">
      <Megaphone className="h-5 w-5 text-primary" />
    </div>
    <DialogTitle className="text-xl font-black uppercase tracking-widest">
      Actualizaciones
    </DialogTitle>
  </div>
  <DialogDescription className="sr-only">
    Hay {messages.length}{" "}
    {messages.length === 1 ? "novedad" : "novedades"} para ti.
  </DialogDescription>
</DialogHeader>
```

Key pattern details from `AlertModalDialog`:
- `border-b border-border/40 pb-4` on DialogHeader
- Icon wrapped in `p-2 rounded-lg bg-primary/10`
- Title uses `font-black uppercase tracking-widest`
- DialogDescription uses `sr-only` for screen readers only

- [ ] **Step 4: Verify changes visually**

Run: `pnpm dev:frontend`
Verify:
- Megaphone icon renders in header with purple tint
- Title is uppercase and bold
- Screen reader announces the description
- Close button (X) still present (not hidden like AlertModalDialog — intentional for billboard)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/billboard/components/BillboardModal.tsx
git commit -m "feat(billboard): add header icon and aria-label for accessibility"
```

---

### Task 3: Create BillboardModalSkeleton

**Files:**
- Create: `apps/frontend/src/features/billboard/components/BillboardModalSkeleton.tsx`

**Interfaces:**
- Consumes: `Skeleton` from `@/components/ui/skeleton`
- Produces: `BillboardModalSkeleton` component (exported)

- [ ] **Step 1: Create skeleton component**

Create `apps/frontend/src/features/billboard/components/BillboardModalSkeleton.tsx`:

```tsx
// src/features/billboard/components/BillboardModalSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function BillboardModalSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-3 sm:p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

Pattern follows `DashboardKPISkeleton` (`features/dashboard/components/dashboard-kpi-skeleton.tsx`):
- Uses `Skeleton` primitive from `@/components/ui/skeleton`
- Mirrors real component layout (rounded-lg border, p-3 sm:p-4, space-y-2)
- `animate-pulse` on Skeleton respects `prefers-reduced-motion` via global CSS rule (`globals.css:281`)
- No wrapper Card component — matches the billboard card structure directly

- [ ] **Step 2: Export from barrel**

In `apps/frontend/src/features/billboard/index.ts`, add:
```tsx
export { BillboardModalSkeleton } from "./components/BillboardModalSkeleton";
```

- [ ] **Step 3: Verify skeleton renders**

Temporarily add `<BillboardModalSkeleton />` to a page, run `pnpm dev:frontend`, verify it mirrors the real modal layout.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/billboard/components/BillboardModalSkeleton.tsx apps/frontend/src/features/billboard/index.ts
git commit -m "feat(billboard): add BillboardModalSkeleton for loading state"
```

---

### Task 4: Switch to SuspenseQuery and wrap in LoadingBoundary

**Files:**
- Modify: `apps/frontend/src/features/billboard/hooks/useUnreadBillboard.ts`
- Modify: `apps/frontend/src/components/common/billboard-check.tsx`

**Interfaces:**
- Consumes: `BillboardModalSkeleton` from Task 3
- Produces: Suspense-enabled billboard loading

- [ ] **Step 1: Switch useUnreadBillboard to useSuspenseQuery**

In `apps/frontend/src/features/billboard/hooks/useUnreadBillboard.ts`, replace the entire file:

```tsx
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { BillboardMessageDto } from "@vivero/shared";
import { billboardService } from "../api/billboardService";
import { billboardQueryKeys } from "@/lib/queryKeys";

export const useUnreadBillboard = () => {
  return useSuspenseQuery<BillboardMessageDto[]>({
    queryKey: billboardQueryKeys.unread(),
    queryFn: billboardService.fetchUnread,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};
```

Changes: `useQuery` → `useSuspenseQuery`. Return type changes from `{ data, isLoading, ... }` to `{ data, ... }` (data is always defined after Suspense resolves).

- [ ] **Step 2: Wrap BillboardCheck in LoadingBoundary**

In `apps/frontend/src/components/common/billboard-check.tsx`, replace the entire file:

```tsx
// src/components/common/billboard-check.tsx
"use client";

import { useUnreadBillboard } from "@/features/billboard/hooks/useUnreadBillboard";
import { BillboardModal } from "@/features/billboard/components/BillboardModal";
import { BillboardModalSkeleton } from "@/features/billboard/components/BillboardModalSkeleton";
import { LoadingBoundary } from "@/components/common/loading-boundary";
import { useState } from "react";

export function BillboardCheck() {
  return (
    <LoadingBoundary skeleton={<BillboardModalSkeleton />} name="billboard">
      <BillboardCheckInner />
    </LoadingBoundary>
  );
}

function BillboardCheckInner() {
  const { data: messages } = useUnreadBillboard();
  const [dismissed, setDismissed] = useState(false);

  if (!messages?.length || dismissed) return null;

  return (
    <BillboardModal
      open={true}
      messages={messages}
      onClose={() => setDismissed(true)}
    />
  );
}
```

Key changes:
- `BillboardCheck` becomes a thin wrapper with `LoadingBoundary`
- `BillboardCheckInner` is a new internal component that uses the suspense-enabled hook
- `LoadingBoundary` provides `aria-busy="true"` and `aria-live="polite"` automatically
- Skeleton mirrors real modal layout (2 message cards)
- Dev-mode logging via `name="billboard"`

- [ ] **Step 3: Run lint and type-check**

Run: `pnpm lint && pnpm type-check`
Expected: PASS (no new lint errors, types resolve correctly with useSuspenseQuery)

- [ ] **Step 4: Verify loading state**

Run: `pnpm dev:frontend`
Slow down network in DevTools (Slow 3G), reload page. Verify skeleton appears briefly before modal renders.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/billboard/hooks/useUnreadBillboard.ts apps/frontend/src/components/common/billboard-check.tsx
git commit -m "feat(billboard): use SuspenseQuery with LoadingBoundary for proper loading state"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run full verification suite**

```bash
pnpm lint && pnpm type-check && pnpm test
```

Expected: All pass. No regressions.

- [ ] **Step 2: Manual smoke test**

1. Login → billboard modal appears with icon, proper padding, accessible
2. Click X → AlertDialog confirmation appears
3. Click "Volver" → returns to modal
4. Click "Entendido" → modal closes, marks as read
5. Reload → no modal (messages marked read)
6. Check mobile viewport → dialog fits, cards padding correct
7. Check screen reader → announces "Actualizaciones del sistema" and message count

- [ ] **Step 3: Commit if any final fixes needed**

```bash
git add -A
git commit -m "fix(billboard): address remaining lint issues from UX review"
```
