feat(alerts): add interactive filtering, dismiss actions, and design tokens

- Add FilterTabs component with per-type color-coded tabs and counts
- Add useAlertActions hook with React Query cache dismiss + sonner toast
- Wire all card action buttons (Sembrada, Anular, Cargar Recuento, etc.)
- Add 8 OKLCH alert-type CSS tokens (siembra, germinacion, faltante, pre-expedicion)
- Refactor FilterTabs from hardcoded hex to theme tokens (20 violations fixed)
- Add responsive grid collapse to all 4 card components (mobile-first)
- Add tooltip + aria-label to NotificationCenter dismiss button
- Add aria-label to comment inputs in cards
- Add refetchInterval: 30s to all alert query hooks
- Update components-list.md with all new alert components
- Add design spec to docs/superpowers/specs/