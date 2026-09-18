feat(ui): restore standard breakpoints and add responsive density system

- Restore Tailwind default breakpoints (md:768, lg:1024, xl:1280, 2xl:1536)
- Remove non-standard breakpoint overrides that created a 768-1280px dead zone
- Add design token CSS custom properties for spacing, control heights,
  table density, typography, sidebar, and header
- Implement compact table density at viewports < 1280px (rows 32px,
  headers 32px, cells 8px padding, text-xs)
- Add responsive sidebar width (192px at md, 224px at xl)
- Add responsive header height (48px at md, 56px at xl)
- Scale table column visibility: 4 cols at lg, 5 cols at xl
- Reduce action button touch targets on desktop (32px vs fixed 44px)
- Standardize pagination sizing and gaps across dashboard pages
- Responsive Sheet/SlideOver max-widths for intermediate viewports
- Update ux-ui-agent.md with full design token reference
- Update frontend-agent.md with density patterns and token rules
- Add design system rule to AGENTS.md Critical Rules
- Add density mirroring rule to loading-strategy.md
