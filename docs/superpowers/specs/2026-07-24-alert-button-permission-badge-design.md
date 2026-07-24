# Design: Permission-Gated Alert Button with Visual State

## Summary

Add permission-based rendering and visual feedback to the alert bell button in `DashboardHeader`. The button is hidden when the user lacks alerts permission, disabled (grayed out) when there are no alerts, and enabled when alerts exist.

## Motivation

Currently the alert bell button renders unconditionally for all users regardless of permissions. Users without alerts access still see the button and can open the modal. Additionally, there's no visual indication of whether alerts exist, making the button feel broken when the alerts table is empty.

## Behavior Matrix

| Permission (`alerts` read) | Alert Data | Button State |
|---|---|---|
| `false` | — | **Hidden** (not rendered) |
| `true` | 0 alerts | **Disabled** (grayed out, not clickable) |
| `true` | >0 alerts | **Enabled** (clickable, opens modal) |

## Implementation

### 1. Permission Gate

In `DashboardHeader`, import and call `usePermission("alerts")` from `src/hooks/usePermission.ts`. If `canRead` is `false`, skip rendering the Bell button entirely. Also skip rendering `<AlertModalDialog />` since the user can't access alerts.

### 2. New Hook: `useHasAlerts`

Create `src/features/alerts/hooks/useHasAlerts.ts`:

- Uses `useQuery` (NOT `useSuspenseQuery`) for each of the 4 alert types
- `enabled: canRead` — only fetches when the user has permission
- Returns `{ hasAlerts: boolean, isLoading: boolean }`
- `hasAlerts` is `true` if any of the 4 alert arrays has `length > 0`
- Reuses existing `alertsQueryKeys` and `alertService` functions
- Polling: inherits the existing 30s `refetchInterval` from the alert service pattern

### 3. Button Disabled State

Pass `disabled={!hasAlerts && !isLoading}` to the shadcn `<Button>` component. When disabled:

- Button gets `disabled` attribute (native HTML, prevents click)
- Bell icon gets `text-muted-foreground/50` for a lighter, muted appearance
- `cursor-not-allowed` via shadcn's disabled styles

### 4. Loading State

While `isLoading` is `true`, the button remains **enabled** (optimistic — assume alerts exist). This avoids a flash of disabled state on initial load. Once loading completes, the button reflects the actual state.

## Files Changed

| File | Action | Description |
|---|---|---|
| `apps/frontend/src/features/alerts/hooks/useHasAlerts.ts` | **Create** | New hook for alert existence check |
| `apps/frontend/src/features/alerts/index.ts` | **Edit** | Export `useHasAlerts` |
| `apps/frontend/src/components/layout/dashboard-header.tsx` | **Edit** | Permission gate + disabled state |

## Non-Goals

- No badge/count number on the button
- No changes to the alert modal or its content
- No backend changes
- No new API endpoints

## Testing

- Unit test for `useHasAlerts` hook: mock alert service, verify `hasAlerts` returns correctly for empty/populated responses
- Unit test for `DashboardHeader`: verify button renders/hidden based on permission mock, verify disabled state based on alert data mock

## Risks

- **4 API calls on header mount**: Each alert type triggers a separate query. Mitigated by `enabled: canRead` (skips if no permission) and 5-minute `staleTime` (cached after first fetch). If this becomes a performance concern, a backend summary endpoint could replace it later.
- **React Query cache**: The hooks share query keys with the existing alert dashboards, so data fetched in the header benefits the dashboards and vice versa.
