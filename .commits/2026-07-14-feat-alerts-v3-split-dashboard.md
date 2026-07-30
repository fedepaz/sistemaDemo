feat(alerts): add v3 split-panel dashboard alongside v1 and v2

Add a third visual alternative for client review: a master-detail
split-panel where alerts are grouped by severity on the left panel
and full details + actions appear on the right when selected.

- Create AlertListPanel with collapsible severity groups
- Create AlertDetailPanel with full card rendering
- Selected alert state management with dismiss-and-close flow
- Mobile responsive via bottom Sheet (shadcn/ui)
- Add /alerts/v3 route with loading skeleton
- Reuse existing V2 card components and useAlertActions hook
