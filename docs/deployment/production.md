# Production Deployment Guide - AgriManage

> This is the **only** deployment reference for the project. It describes the actual production setup:
> a single Windows server, process-based apps, and a Cloudflare Tunnel. There is **no** Docker,
> Kubernetes, Nginx, or PM2 in production.

## Architecture

```
Internet
   │
   ▼
Cloudflare Tunnel (cloudflared) ──► https://<hostname> ──► localhost:3000 (frontend)
                                                          └──► localhost:3001 (backend, /api via rewrite)

Windows Server
├── Frontend  Next.js 16            port 3000   (pnpm --filter frontend start)
├── Backend   NestJS 11             port 3001   (pnpm --filter backend start)
├── MariaDB   dev/main database     localhost:3306
├── MariaDB   legacy (martin3)      localhost:3307
└── nssm      runs startapp.bat as a Windows service (auto-restart + boot start)
```

The frontend proxies `/api/*` to the backend through `next.config.ts` rewrites, so the browser only ever talks to `:3000`.

## Server Layout

- Repo location: `C:\Users\Administrador.WIN-5O8PFH87N2N\Documents\sistemaProplanta\sistemaDemo`
  (see `docs/scripts/startapp.bat` — the working directory is baked into the script).
- Runtime `.env` files live on the server and are **gitignored**:
  - `apps/backend/.env` — backend config (`BACKEND_NODE_ENV=production`, DB URLs, JWT secrets, `PORT`, `CORS_ORIGINS`).
  - `apps/frontend/.env` — frontend config (public API URL, `allowedDevOrigins` where needed).
- Never commit `.env` files or real secrets.

## Environment Variables (Backend)

Selected by `BACKEND_NODE_ENV` (default `development`). All validated by Joi on boot (`apps/backend/src/config/configuration.ts`):

| Variable | Purpose |
|----------|---------|
| `BACKEND_NODE_ENV` | `development` / `production` / `test` / `staging` |
| `PORT` | backend port (default `3001`) |
| `URL` | backend public URL |
| `CORS_ORIGINS` | allowed CORS origins |
| `DATABASE_PROD_*` | production database connection (host, port, user, password, URL) |
| `DATABASE_DEV_*` | development database connection |
| `DATABASE_LEGACY_*` | legacy `martin3` connection |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | JWT secrets (min 32 chars) |
| `JWT_EXPIRES_IN` (default `15m`), `JWT_REFRESH_EXPIRES_IN` (default `7d`) | token lifetimes |
| `DEFAULT_TENANT_ID`, `DEFAULT_PASSWORD` | bootstrap values |

## Install & Build

```bash
# Local machine or server, first time:
pnpm install
pnpm build                 # builds shared + frontend + backend
```

## Running as a Windows Service

1. Install **nssm** (`https://nssm.cc/download`).
2. Register the watchdog script:
   ```
   nssm install AgriManage "C:\Windows\System32\cmd.exe"
   nssm set AgriManage AppParameters "/c C:\Users\<user>\Documents\sistemaProplanta\sistemaDemo\docs\scripts\startapp.bat"
   nssm set AgriManage AppDirectory "C:\Users\<user>\Documents\sistemaProplanta\sistemaDemo"
   nssm set AgriManage Start SERVICE_AUTO_START
   nssm start AgriManage
   ```
3. `startapp.bat` runs `pnpm start` in a loop and waits 5 seconds between restarts, so a crash is recovered automatically without CPU spin-up.

## Cloudflare Tunnel

The server is **not** directly exposed. `cloudflared` runs on the server and maps a public hostname to `localhost:3000`:

```bash
# On the server (cloudflared for Windows: https://developers.cloudflare.com/cloudflared/)
cloudflared tunnel login
cloudflared tunnel create agrimanage
cloudflared tunnel route dns agrimanage <hostname>
```

`~/.cloudflared/config.yml`:
```yaml
tunnel: agrimanage
credentials-file: C:/Users/<user>/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: <hostname>
    service: http://localhost:3000
  - service: http_status:404
```

Register `cloudflared` as a Windows service (`cloudflared service install`) so it starts on boot.

## Update Cycle (Lean Strategy)

There is no CI deploy. Updates are manual and use Git as the transport:

```bash
# On the server:
git pull origin main          # restores any purged tracked files + applies updates
pnpm install
pnpm build                    # rebuild shared + apps
# optional "lean purge": delete src/, test/, .next/cache, etc. on the server to keep runtime-only
nssm restart AgriManage       # or rely on startapp.bat if the service is stopped manually
```

## Database Backups

Manual, scheduled `mysqldump` for each database (dev/main and legacy):

```bash
mysqldump -u root -p vivero_client_alpha > backups/backup-main-YYYY-MM-DD.sql
mysqldump -u root -p martin3          > backups/backup-legacy-YYYY-MM-DD.sql
```

- Test the restore procedure (`mysql < backup.sql`) at least once.
- Keep a few daily copies; prune old ones.

## Health Checks & Troubleshooting

- Frontend: `curl http://localhost:3000/login` → 200.
- Backend: `curl http://localhost:3001/api/health` → `200 OK` (confirms DB connectivity).
- Public: open the Cloudflare hostname in a browser.
- Logs: backend logs are pino JSON on stdout — capture them in a file/service log. Frontend logs to the browser console.
- If the app won't start: check `apps/backend/.env` (`BACKEND_NODE_ENV`, DB host/port), MariaDB services, and the nssm service status.

## Deployment Checklist

- [ ] `pnpm lint && pnpm type-check && pnpm test` green.
- [ ] `pnpm --filter backend test:integration` green.
- [ ] `build-verification.yml` green on `main`.
- [ ] Backend `.env` set to `BACKEND_NODE_ENV=production` with correct DB targets.
- [ ] `JWT_SECRET` / `JWT_REFRESH_SECRET` are strong and unique.
- [ ] Cloudflare Tunnel service running; public hostname resolves.
- [ ] Fresh DB backup taken before deploy.
