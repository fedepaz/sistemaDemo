feat(ui): implement loading boundary system and optimize data-table performance

- Add LoadingBoundary component with required skeleton prop (TypeScript enforced)
- Add AuthLayoutSkeleton that mirrors login page layout during auth gating
- Add useHydration hook to prevent SSR/client mismatch
- Improve DashboardProtectedLayout: use AuthLayoutSkeleton for auth gating,
  RootDashboardSkeleton for profile loading, remove LoadingSpinner dependency
- Remove redundant LoadingBoundary from dashboard layout (was causing skeleton flash)
- Remove isFetching skeleton duplication in extendidos and siembra views
- Wrap DataTable in React.memo to prevent unnecessary re-renders
- Memoize callbacks (useView, useEdit, handleOpenChange) in all 6 feature data-tables
- Add loading-strategy.md documentation (3-tier pattern, naming conventions, mirroring rules)
- Update components-list.md with DataTable memoization guide
- Add loading strategy reference to AGENTS.md
