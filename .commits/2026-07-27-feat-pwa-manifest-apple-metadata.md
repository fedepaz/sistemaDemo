feat(frontend): add PWA support with web app manifest and Apple metadata

Add Next.js web app manifest for PWA installation and Apple Web App
metadata for iOS home screen support. Enables standalone display mode
and app-like experience on mobile devices.

- `apps/frontend/src/app/manifest.ts` — PWA web app manifest (Next.js MetadataRoute)
- `apps/frontend/src/app/layout.tsx` — Apple Web App metadata (icon, capable, statusBarStyle)
- `docs/agents/frontend-agent.md` — Added PWA to tech stack and file conventions
- `.commits/` — Moved commit files from `app/.commits/` to correct location

Enables PWA installation on supported browsers and iOS home screen addition.
No impact on existing functionality, builds, or tests.
