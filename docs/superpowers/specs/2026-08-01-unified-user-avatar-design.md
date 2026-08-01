# Unified UserAvatar Component

## Problem

The app has 6 different avatar/initials patterns scattered across components, each with its own `getInitials` function and styling. This creates visual inconsistency and duplicated code.

### Current Patterns

| Location | Style | Issue |
|---|---|---|
| `user-sidebar-menu.tsx` | `bg-primary text-primary-foreground`, `font-black` | Reference pattern |
| `alert-edit-form.tsx` | `bg-primary` for "me", `bg-muted` for others | Inconsistent with sidebar |
| `alerts-view-form.tsx` | `bg-muted` only | Missing primary styling |
| `permission-selector.tsx` | `bg-primary/5 text-primary` | Faint, different font weight |
| `user-selector.tsx` | `bg-primary/5 text-primary` | Same faint pattern |
| `permissions-entity-manager.tsx` | `bg-primary/5 text-primary` | Same faint pattern |

## Solution

Create a single `UserAvatar` component that encapsulates the unified style and is used everywhere.

## Component API

**File:** `src/components/common/user-avatar.tsx`

```tsx
interface UserAvatarProps {
  name: string;           // Full name or username
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

### Behavior

- Extracts initials from `name` (first char of first + last word)
- Empty name/undefined → renders `User` icon from lucide
- Always: `bg-primary text-primary-foreground`, `font-black tracking-tighter`, `rounded-full`
- Sizes: `sm`=h-6/w-6 text-[10px], `md`=h-8/w-8 text-xs, `lg`=h-11/w-11 text-sm

### Usage

```tsx
// Alert comments
<UserAvatar name={comment.userName} />

// User selector
<UserAvatar name={`${user.firstName} ${user.lastName}`} size="sm" />

// Permission selector (entity initials)
<UserAvatar name={table.label} size="sm" />

// Sidebar (replace custom div)
<UserAvatar name={`${userProfile.firstName} ${userProfile.lastName}`} />
```

## Migration Plan

### Files to change

1. **Create** `src/components/common/user-avatar.tsx` — new component
2. **Migrate** `alert-edit-form.tsx` — replace Avatar+AvatarFallback+getInitials with UserAvatar
3. **Migrate** `alerts-view-form.tsx` — same replacement
4. **Migrate** `permission-selector.tsx` — same replacement, size="sm"
5. **Migrate** `user-selector.tsx` — same replacement, size="sm"
6. **Migrate** `permissions-entity-manager.tsx` — same replacement, size="lg"
7. **Update** `user-sidebar-menu.tsx` — replace custom initials div with UserAvatar (keep surrounding layout)

### What gets removed per file

- `import { Avatar, AvatarFallback } from "@/components/ui/avatar"`
- Local `getInitials` function
- `<Avatar className="..."><AvatarFallback className="...">{getInitials(...)}</AvatarFallback></Avatar>` wrapper

### What stays

- `user-sidebar-menu.tsx` surrounding layout (name + username text, dropdown, tooltip)
- Alert comment "me vs others" layout (flex-row-reverse, bubble styling) — only the avatar part changes
- All existing behavior and interactions

## Scope

- ~6 files changed, 1 new file
- Pure refactoring — no behavior changes
- No new dependencies
- Tests should continue passing (no logic changes)

## Success Criteria

- All avatars render with `bg-primary text-primary-foreground`, `font-black`
- No duplicated `getInitials` functions remain
- All 104 existing tests pass
- Lint clean (0 errors)
