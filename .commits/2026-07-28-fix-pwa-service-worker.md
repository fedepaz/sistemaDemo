fix(frontend): add service worker to enable PWA install prompt

Complete PWA implementation by adding the missing service worker.
The previous commit only added the manifest; this adds the actual
service worker that triggers the install prompt and enables
basic offline caching.

- `apps/frontend/public/sw.js` — Service worker with install/activate/fetch
- `apps/frontend/src/components/service-worker-registration.tsx` — Client registration component
- `apps/frontend/src/app/layout.tsx` — Mount SW registration in layout
- `apps/frontend/next.config.ts` — Cache-Control header for sw.js
