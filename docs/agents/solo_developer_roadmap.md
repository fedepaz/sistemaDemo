# SOLO-DEV-ROADMAP.md - Development Roadmap

> Realistic plan for a solo developer working part-time on AgriManage. It reflects **what the system actually is** (internal agricultural management system) and **what is already built** — not a SaaS go-to-market fantasy.

## Reality Check

- **System**: internal nursery management web app replacing a legacy desktop system.
- **Deployment**: single Windows server + Cloudflare Tunnel. No Docker/K8s/PM2.
- **Mantra**: correctness, auditability, and operational fit beat feature volume.

## What Exists Today

| Area | Status |
|------|--------|
| Monorepo (pnpm + Turborepo), frontend/backend/shared | Done |
| Auth: login, JWT refresh, password change/restore | Done |
| Login rate limiting, uniform 401s, no passwordHash leak | Done |
| Users, permissions, entities, tenant, audit log (paginated) | Done |
| Legacy integration (partidas, agentes, depositos, especie, programas, config, alerts) | Done |
| Alerts + comment threads | Done |
| Frontend: dashboard, users, permissions, entities, alerts, auditLogs, extendidos | Done |
| Siembra (planting) | **WIP** — partial |
| Extendidos full flow | In progress |
| Dark mode + next-intl | Templates installed, intentionally kept |
| E2E tests | Not started (no Playwright) |
| Hardening: backups, DR runbook, monitoring | Outstanding |

## Roadmap

### Phase 1: Finish the Core Workflows (next)
- Complete Siembra module (back + front).
- Finish Extendidos full flow.
- Close remaining Tier-1 security items and verify with `pnpm lint && pnpm type-check && pnpm test`.

### Phase 2: Operational Hardening
- Documented DB backup/restore procedure (mysqldump schedule + tested restore).
- Server restart/recovery runbook (nssm + startapp.bat verified).
- Structured log review workflow; keep `pnpm audit` at zero high/critical.

### Phase 3: Quality & Confidence
- Optional: add E2E for the two highest-value flows (login + location assignment).
- Optional: coverage reporting; keep Jest coverage thresholds enforced.

## Mindset

- "Would this make the nursery team's day easier?" is the only question that matters.
- Finish one module completely (tests, audit, permissions, docs) before starting the next.
- Never commit new infrastructure that isn't installed and used.

**Target**: a complete, hardened, documented system the team depends on daily.
