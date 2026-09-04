feat(frontend): add global search bar to DataTable component

- Add `enableSearch` prop (default true) for opt-out per table
- Search input with magnifying glass icon, real-time client-side filtering
- Clear button (X) appears when filter is active
- Results count badge ("X de Y") shown on desktop
- Responsive placeholder text (mobile: "Buscar...", desktop: "Buscar en la tabla...")
- 6 tests covering rendering, visibility, input, clear button, badge, empty state

Co-Authored-By: opencode <noreply@opencode.ai>
