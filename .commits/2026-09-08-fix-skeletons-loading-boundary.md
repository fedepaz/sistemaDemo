fix(skeletons): adopt LoadingBoundary everywhere and fix layout flash

- Move BillboardCheck from layout into main content to prevent
  skeleton flashes on navigation
- Replace all 14 raw <Suspense> with <LoadingBoundary> across 11
  files for consistent loading states with accessibility
- Fix CompanyWelcomeSkeleton to match actual component (logo+tagline,
  no phantom badges)
- Restore SiembraDashboardSkeleton toolbar content (week select)
- Update loading-strategy.md to Two Tiers approach (no loading.tsx)
