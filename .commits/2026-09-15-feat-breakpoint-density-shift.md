feat(ui): shift responsive breakpoints for compact desktop density

- Override Tailwind breakpoints: md:1280px, lg:1536px, xl:1920px, 2xl:2560px
- Update useBreakpoint hook to match new breakpoints
- Keep navigation and sidebar at md (1280px), density classes at lg+
- Widen SlideOverForm to max-w-2xl on desktop
- Promote dashboard KPI grid visibility from md to lg
