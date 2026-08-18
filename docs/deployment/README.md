# Deployment Documentation

> Index for production operations. The canonical guide is **[production.md](./production.md)**.

## Contents

1. **[Production Deployment Guide](./production.md)** — the real setup:
   - Single **Windows server**, process-based apps (no Docker/Kubernetes/PM2/Nginx).
   - Frontend `:3000`, backend `:3001`, Cloudflare Tunnel for public access.
   - Environment variables, nssm service registration, `startapp.bat` watchdog.
   - Manual update cycle, database backups, health checks, troubleshooting.

## Related

- `docs/scripts/startapp.bat` — watchdog launcher used on the server.
- `docs/agents/devops_agent.md` — operations overview and security practices.
- `docs/agents/cicd_agent.md` — GitHub Actions verification workflows (CI does **not** deploy).
