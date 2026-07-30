feat(ui): polish AlertModal with enterprise design, a11y fixes, and component registry

- Redesign dialog title with Bell icon and enterprise typography
- Expand desktop width (sm:max-w-5xl lg:max-w-7xl) with responsive padding
- Fix a11y: DialogDescription, aria-label, remove invalid title prop
- Align skeleton sizing with actual content (w-full, matching gaps)
- Define shadow-premium CSS variable for DataTable styling
- Add comprehensive component registry to components.json (~222 components)
- Update components-list.md marking reviewed components
- Update tests for new dialog behavior
