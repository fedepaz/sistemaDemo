refactor(skeletons): remove all route-level loading.tsx and fix DataTableSkeleton mirroring

Remove all 12 route-level loading.tsx files across auth and dashboard routes.
These caused visual flashes (auth → middle skeleton → route skeleton → content)
during page loads. Route-specific Suspense fallbacks handle loading instead.

Also fixes DataTableSkeleton to match actual DataTable structure: adds toolbar row,
toolbarContent prop, Badge skeleton in header, and aligned search/pagination styling.
Feature skeletons (extendidos, siembra, users) now mirror their actual toolbar content.
