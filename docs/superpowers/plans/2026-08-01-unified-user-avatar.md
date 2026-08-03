# Unified UserAvatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a unified `UserAvatar` component and migrate all 6 avatar patterns to use it.

**Architecture:** Single new component at `src/components/common/user-avatar.tsx` that encapsulates the unified style (bg-primary, font-black, rounded-full). All consumers replace their local Avatar+AvatarFallback+getInitials with `<UserAvatar />`.

**Tech Stack:** React, lucide-react (User icon), cn utility, shadcn Avatar primitive

## Global Constraints

- Follow existing code conventions (shadcn/ui, cn utility, "use client" on all provider/component files)
- Spanish-only UI strings
- OKLCH tokens only, no new palettes
- All tests must pass (104/104)
- Lint clean (0 errors)

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/components/common/user-avatar.tsx` | Create | Unified avatar component |
| `src/features/alerts/components/v1/alert-edit-form.tsx` | Modify | Replace Avatar+getInitials with UserAvatar |
| `src/features/alerts/components/v1/alerts-view-form.tsx` | Modify | Replace Avatar+getInitials with UserAvatar |
| `src/features/permissions/components/permission-selector.tsx` | Modify | Replace Avatar+getInitials with UserAvatar |
| `src/features/permissions/components/user-selector.tsx` | Modify | Replace Avatar+getInitials with UserAvatar |
| `src/features/permissions/components/permissions-entity-manager.tsx` | Modify | Replace Avatar+getInitials with UserAvatar |
| `src/components/user-profile/user-sidebar-menu.tsx` | Modify | Replace custom initials div with UserAvatar |

---

### Task 1: Create UserAvatar component

**Files:**
- Create: `apps/frontend/src/components/common/user-avatar.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`, `User` from `lucide-react`
- Produces: `<UserAvatar name={string} size?="sm"|"md"|"lg" className?={string} />`

- [ ] **Step 1: Create the component file**

```tsx
// src/components/common/user-avatar.tsx
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-11 w-11 text-sm",
} as const;

function extractInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

export function UserAvatar({ name, size = "md", className }: UserAvatarProps) {
  const initials = extractInitials(name);

  return (
    <div
      className={cn(
        "shrink-0 bg-primary rounded-full flex items-center justify-center",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {initials ? (
        <span className="text-primary-foreground font-black tracking-tighter">
          {initials}
        </span>
      ) : (
        <User className="h-4 w-4 text-primary-foreground" />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm --filter frontend type-check`
Expected: PASS (0 errors)

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/common/user-avatar.tsx
git commit -m "feat(components): add unified UserAvatar component"
```

---

### Task 2: Migrate alert-edit-form.tsx

**Files:**
- Modify: `apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx`

**Interfaces:**
- Consumes: `UserAvatar` from `@/components/common/user-avatar`
- Produces: None (pure migration)

- [ ] **Step 1: Replace imports**

Remove:
```tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
```

Add:
```tsx
import { UserAvatar } from "@/components/common/user-avatar";
```

- [ ] **Step 2: Remove getInitials function**

Delete the `getInitials` function (lines 30-35).

- [ ] **Step 3: Replace Avatar usage in comment rendering**

Find the comment avatar block (around line 144):
```tsx
<Avatar className="h-8 w-8 shrink-0">
  <AvatarFallback
    className={cn(
      "text-xs",
      isMe
        ? "bg-primary text-primary-foreground"
        : "bg-muted",
    )}
  >
    {getInitials(comment.userName)}
  </AvatarFallback>
</Avatar>
```

Replace with:
```tsx
<UserAvatar name={comment.userName} />
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter frontend test`
Expected: PASS (104/104)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx
git commit -m "refactor(alerts): migrate alert-edit-form to UserAvatar"
```

---

### Task 3: Migrate alerts-view-form.tsx

**Files:**
- Modify: `apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx`

**Interfaces:**
- Consumes: `UserAvatar` from `@/components/common/user-avatar`
- Produces: None (pure migration)

- [ ] **Step 1: Replace imports**

Remove:
```tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
```

Add:
```tsx
import { UserAvatar } from "@/components/common/user-avatar";
```

- [ ] **Step 2: Remove getInitials function**

Delete the `getInitials` function (lines 18-23).

- [ ] **Step 3: Replace Avatar usage in comment rendering**

Find:
```tsx
<Avatar className="h-8 w-8 shrink-0">
  <AvatarFallback className="text-xs bg-muted">
    {getInitials(comment.userName)}
  </AvatarFallback>
</Avatar>
```

Replace with:
```tsx
<UserAvatar name={comment.userName} />
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter frontend test`
Expected: PASS (104/104)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx
git commit -m "refactor(alerts): migrate alerts-view-form to UserAvatar"
```

---

### Task 4: Migrate permission-selector.tsx

**Files:**
- Modify: `apps/frontend/src/features/permissions/components/permission-selector.tsx`

**Interfaces:**
- Consumes: `UserAvatar` from `@/components/common/user-avatar`
- Produces: None (pure migration)

- [ ] **Step 1: Replace imports**

Remove:
```tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
```

Add:
```tsx
import { UserAvatar } from "@/components/common/user-avatar";
```

- [ ] **Step 2: Remove getInitials function**

Delete the `getInitials` function (lines 52-55).

- [ ] **Step 3: Replace Avatar usages**

Replace both Avatar blocks (selectedTable and table list):

```tsx
// Before (selected):
<Avatar className="h-6 w-6 border border-border/50">
  <AvatarFallback className="bg-primary/5 text-[10px] font-bold text-primary">
    {getInitials(selectedTable)}
  </AvatarFallback>
</Avatar>

// After:
<UserAvatar name={getDisplayName(selectedTable)} size="sm" />
```

```tsx
// Before (list item):
<Avatar className="h-8 w-8 border border-border/50">
  <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary">
    {getInitials(table)}
  </AvatarFallback>
</Avatar>

// After:
<UserAvatar name={getDisplayName(table)} />
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter frontend test`
Expected: PASS (104/104)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/permissions/components/permission-selector.tsx
git commit -m "refactor(permissions): migrate permission-selector to UserAvatar"
```

---

### Task 5: Migrate user-selector.tsx

**Files:**
- Modify: `apps/frontend/src/features/permissions/components/user-selector.tsx`

**Interfaces:**
- Consumes: `UserAvatar` from `@/components/common/user-avatar`
- Produces: None (pure migration)

- [ ] **Step 1: Replace imports**

Remove:
```tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
```

Add:
```tsx
import { UserAvatar } from "@/components/common/user-avatar";
```

- [ ] **Step 2: Remove getInitials function**

Delete the `getInitials` function (lines 50-53).

- [ ] **Step 3: Replace Avatar usages**

```tsx
// Before (selected):
<Avatar className="h-6 w-6 border border-border/50">
  <AvatarFallback className="bg-primary/5 text-[10px] font-bold text-primary">
    {getInitials(selectedUser)}
  </AvatarFallback>
</Avatar>

// After:
<UserAvatar name={getDisplayName(selectedUser)} size="sm" />
```

```tsx
// Before (list item):
<Avatar className="h-8 w-8 border border-border/50">
  <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary">
    {getInitials(user)}
  </AvatarFallback>
</Avatar>

// After:
<UserAvatar name={getDisplayName(user)} />
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter frontend test`
Expected: PASS (104/104)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/permissions/components/user-selector.tsx
git commit -m "refactor(permissions): migrate user-selector to UserAvatar"
```

---

### Task 6: Migrate permissions-entity-manager.tsx

**Files:**
- Modify: `apps/frontend/src/features/permissions/components/permissions-entity-manager.tsx`

**Interfaces:**
- Consumes: `UserAvatar` from `@/components/common/user-avatar`
- Produces: None (pure migration)

- [ ] **Step 1: Replace imports**

Remove:
```tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
```

Add:
```tsx
import { UserAvatar } from "@/components/common/user-avatar";
```

- [ ] **Step 2: Remove getInitials function**

Delete the `getInitials` function (lines 37-40).

- [ ] **Step 3: Replace Avatar usage**

```tsx
// Before:
<Avatar className="h-9 w-9 md:h-11 md:w-11 border border-border/50 shadow-sm">
  <AvatarFallback className="bg-primary/5 text-[10px] md:text-xs font-bold text-primary">
    {getInitials(up.firstName, up.lastName)}
  </AvatarFallback>
</Avatar>

// After:
<UserAvatar
  name={`${up.firstName ?? ""} ${up.lastName ?? ""}`}
  size="lg"
/>
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter frontend test`
Expected: PASS (104/104)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/permissions/components/permissions-entity-manager.tsx
git commit -m "refactor(permissions): migrate permissions-entity-manager to UserAvatar"
```

---

### Task 7: Migrate user-sidebar-menu.tsx

**Files:**
- Modify: `apps/frontend/src/components/user-profile/user-sidebar-menu.tsx`

**Interfaces:**
- Consumes: `UserAvatar` from `@/components/common/user-avatar`
- Produces: None (pure migration)

- [ ] **Step 1: Replace imports**

Remove:
```tsx
import { User } from "lucide-react";
```

Add:
```tsx
import { UserAvatar } from "@/components/common/user-avatar";
```

- [ ] **Step 2: Remove initials computation**

Delete:
```tsx
const initials = `${userProfile?.firstName?.charAt(0) || ""}${userProfile?.lastName?.charAt(0) || ""}`;
```

- [ ] **Step 3: Replace custom div with UserAvatar**

Find:
```tsx
<div className={cn(
  "shrink-0 bg-primary rounded-full flex items-center justify-center transition-all",
  isCollapsed ? "h-8 w-8" : "h-9 w-9 shadow-sm"
)}>
  <span className={cn(
    "text-primary-foreground font-black tracking-tighter",
    isCollapsed ? "text-[10px]" : "text-xs"
  )}>
    {initials || <User className="h-4 w-4" />}
  </span>
</div>
```

Replace with:
```tsx
<UserAvatar
  name={`${userProfile?.firstName ?? ""} ${userProfile?.lastName ?? ""}`}
  size={isCollapsed ? "md" : "md"}
  className={cn("transition-all", !isCollapsed && "shadow-sm")}
/>
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter frontend test`
Expected: PASS (104/104)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/user-profile/user-sidebar-menu.tsx
git commit -m "refactor(layout): migrate user-sidebar-menu to UserAvatar"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full lint**

Run: `pnpm lint`
Expected: 0 errors (warnings OK)

- [ ] **Step 2: Run full type-check**

Run: `pnpm type-check`
Expected: 0 errors

- [ ] **Step 3: Run full test suite**

Run: `pnpm test`
Expected: 104/104 PASS

- [ ] **Step 4: Verify no duplicate getInitials remain**

Run: `grep -r "getInitials" apps/frontend/src/`
Expected: No matches

- [ ] **Step 5: Verify no Avatar+AvatarFallback imports remain in migrated files**

Run: `grep -r "AvatarFallback" apps/frontend/src/features/alerts/ apps/frontend/src/features/permissions/ apps/frontend/src/components/user-profile/`
Expected: No matches
