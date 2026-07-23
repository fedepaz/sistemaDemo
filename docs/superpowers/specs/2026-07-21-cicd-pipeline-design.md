# CI/CD Pipeline Design

**Date:** 2026-07-21
**Status:** Approved
**Reference:** appFinance CI/CD patterns

---

## Overview

Fix and extend sistemaDemo's CI/CD infrastructure based on appFinance patterns. The pipeline provides build verification, linting, unit tests, and integration tests across all packages.

**Key constraint:** Integration tests mock at service layer — no PostgreSQL service container needed in CI.

---

## Branch Structure

```
main ← dev ← feature branches (ephemeral)
```

- `main` — production-ready code (permanent)
- `dev` — development integration (permanent)
- Feature branches — deleted after merge

---

## Files

| File | Action | Purpose |
|------|--------|---------|
| `.github/actions/setup/action.yml` | CREATE | Composite action: pnpm + Node + deps + Prisma |
| `.github/workflows/ci-test.yml` | CREATE | Reusable workflow: lint + unit-tests + integration-tests |
| `.github/workflows/pr-checks.yml` | REWRITE | Calls ci-test.yml on PRs to main/dev |
| `.github/workflows/deploy.yml` | REWRITE | Build-only verification on push to main/dev |
| `.github/workflows/scheduled.yml` | UPDATE | pnpm version bump only |

---

## Composite Action

**File:** `.github/actions/setup/action.yml`

**Inputs:**

| Input | Default | Description |
|-------|---------|-------------|
| `node-version` | `'20'` | Node.js version |
| `pnpm-version` | `'10.33.2'` | pnpm version |

**Steps:**

1. `pnpm/action-setup@v4` — install pnpm
2. `actions/setup-node@v4` — setup Node with pnpm cache
3. `pnpm install --frozen-lockfile` — install deps (exact lockfile)
4. `npx prisma generate` — generate Prisma client

**Notes:**
- Uses `@v4` tags (appFinance used `@v2` — we upgrade)
- `--frozen-lockfile` ensures CI uses exact lockfile versions
- Prisma generate needed for TypeScript types in backend and shared packages

---

## Reusable Workflow

**File:** `.github/workflows/ci-test.yml`

**Trigger:** `workflow_call`

**Jobs:**

| Job | Command | Time |
|-----|---------|------|
| `lint` | `pnpm lint` | ~10s |
| `unit-tests` | `pnpm test` | ~30s |
| `integration-tests` | `pnpm --filter backend test:integration` | ~35s |

**Each job:**

1. Uses composite action (`.github/actions/setup`)
2. Runs its specific command

**Key decisions:**

- 3 separate jobs — gives granular pass/fail status on PRs
- No PostgreSQL service container — integration tests are mocked
- `pnpm test` runs unit tests only (85 tests)
- `pnpm --filter backend test:integration` runs integration tests only (36 tests) — backend-only script
- Both use `--force` to bypass Turborepo cache in CI

---

## PR Checks

**File:** `.github/workflows/pr-checks.yml`

**Trigger:** `pull_request` to `main` and `dev`

**Jobs:**

| Job | What it does |
|-----|-------------|
| `ci` | Calls `.github/workflows/ci-test.yml` reusable workflow |

**Result:** PR gets 3 status checks (lint, unit-tests, integration-tests).

---

## Deploy

**File:** `.github/workflows/deploy.yml`

**Trigger:** `push` to `main` and `dev`

**Jobs:**

| Job | What it does |
|-----|-------------|
| `frontend` | Build frontend (`pnpm --filter frontend build`) |
| `backend` | Build backend (`pnpm --filter backend build`) |

**Key decisions:**

- Build-only — no deploy steps, no echo stubs
- Both jobs run in parallel (no dependency)
- If either build fails, GitHub sends email notification
- No matrix strategy (removed broken `matrix.app` references)

---

## Scheduled

**File:** `.github/workflows/scheduled.yml`

**Trigger:** Cron `0 2 * * *` (daily at 2 AM UTC)

**Jobs:**

| Job | What it does |
|-----|-------------|
| `scan` | `pnpm audit --audit-level high` |

**Change:** pnpm version bump from 8.15.0 to 10.33.2 only.

---

## No Changes Needed

These files stay as-is:

- Dockerfiles (frontend + backend)
- `turbo.json`
- Root `package.json` scripts
- `.env.example` files (root, backend, frontend)
- Entrypoint script

---

## Summary

| Category | Count |
|----------|-------|
| Files created | 2 |
| Files rewritten | 2 |
| Files updated | 1 |
| Total changes | 5 |

**Pipeline flow:**

```
PR → pr-checks.yml → ci-test.yml (lint + unit + integration)
Push → deploy.yml (build frontend + backend)
Daily → scheduled.yml (security audit)
```
