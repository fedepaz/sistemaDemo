# TECH-STACK.md - AgriManage

> Single source of truth for the technology stack. This file describes **what is actually installed and used** in the repository. Do not add technologies to this list that are not present in `package.json` files.

## Context

AgriManage (repo: `sistemaDemo`, package: `vivero-client-alpha`) is an **internal agricultural management system** (nursery/vivero operations) — not a multi-tenant SaaS. It is a **single-tenant, process-based** deployment running on a single Windows server. It replaces a legacy desktop system and integrates with a legacy MySQL database (`martin3`).

## Monorepo

```yaml
Package Manager: pnpm 10+
Build System: Turborepo 2
Workspaces:
  apps/frontend   # Next.js web application
  apps/backend    # NestJS API
  packages/shared # @vivero/shared — Zod schemas & DTOs
```

## Frontend Stack (`apps/frontend`)

```typescript
Framework: Next.js 16 (App Router, React Server Components)
Runtime: React 19
Language: TypeScript
Styling: Tailwind CSS v4 (CSS variables, OKLCH tokens in globals.css)
Components: shadcn/ui + Radix primitives
Icons: Lucide React
Server State: TanStack Query v5 (useSuspenseQuery for GETs; useQuery with enabled for auth)
Tables: TanStack Table v8 (custom <DataTable />)
Forms: React Hook Form + Zod
Validation: @vivero/shared Zod schemas
PWA: Serwist (@serwist/next) + Web App Manifest
Testing: Jest 30 + @testing-library/react
```

### Installed but unused (do not assume availability, verify before use)

```typescript
next-intl        # i18n — intentionally not activated (Spanish-only UI)
next-themes      # dark mode toggle library
zustand          # global state — not used; local state + context preferred
recharts         # charting
@tremor/react    # dashboard UI kit
```

Do **not** rely on these in new code unless the feature explicitly needs them. New dependencies must be justified and installed via `pnpm add`.

### UI Conventions

- UI is **Spanish-only**. Write user-facing strings directly in Spanish.
- Design tokens live in `apps/frontend/src/app/globals.css` (OKLCH variables, `--primary`, `--chart-1..5`, fonts).
- Fonts: Poppins (sans, light mode), Inter (sans, dark mode), JetBrains Mono (mono).
- Every route gets a `loading.tsx` (Level 1 skeleton); data-fetching components get a colocated `*Skeleton.tsx` (Level 2) wrapped in `<Suspense>`.

## Backend Stack (`apps/backend`)

```typescript
Framework: NestJS 11
Language: TypeScript
ORM: Prisma 7 + @prisma/adapter-mariadb (relationMode = "prisma"; real FKs in DB)
Database: MariaDB 10/11
Legacy DB access: raw MySQL queries (not Prisma) via LegacyMysqlService
Authentication: username/password + JWT (15m access + 7d refresh, rotating secrets)
Validation: Zod schemas (@vivero/shared) + Joi for env validation
Authorization: permission system (@RequirePermission, Entity registry, PermissionType)
Audit: global AuditCrudInterceptor (CREATE/UPDATE/DELETE → AuditLog)
Logging: nestjs-pino (structured JSON, pino-pretty in dev)
Rate limiting: in-memory LoginRateLimiter (10 attempts / 15 min per IP:username)
Testing: Jest 30 + supertest (unit + HTTP integration)
```

### Modules

```
apps/backend/src/modules/
├── auth/          # login, refresh, password change/restore, rate limiting
├── users/         # user management, profiles (passwordHash never exposed)
├── permissions/   # @RequirePermission, PermissionType enforcement
├── entities/      # Entity registry (which tables the permission system manages)
├── auditLog/      # paginated audit trail
├── alerts/        # operational alerts
├── partidas/      # production batches (l-partidas)
├── siembra/       # planting — explicit WIP
└── legacy/        # legacy MySQL integration (programas, etc.)
```

## Infrastructure & Deployment

```yaml
CI/CD: GitHub Actions
  .github/actions/setup/action.yml       # composite setup (pnpm, Node, deps, prisma generate)
  .github/workflows/ci-test.yml          # reusable: lint + unit-tests + integration-tests
  .github/workflows/pr-checks.yml        # PR → dev/main runs ci-test.yml
  .github/workflows/build-verification.yml # builds frontend + backend on push to main
  .github/workflows/scheduled.yml        # daily pnpm audit (high severity)
Production host: single Windows server
Process manager: nssm (Windows service) + docs/scripts/startapp.bat watchdog loop
Networking: Cloudflare Tunnel (no public IP/ports exposed)
Services: frontend on :3000, backend on :3001 (PORT env, default 3001)
Databases: MariaDB dev :3306, legacy (martin3) :3307
Containers: NONE — no Docker, Kubernetes, or PM2
Terraform: NONE
Monitoring: pino structured logs only (no DataDog/New Relic/Sentry/ELK)
```

## Testing

```yaml
Unit/component tests: pnpm test          # shared 114, backend 105, frontend 104
Integration tests (backend HTTP): pnpm --filter backend test:integration   # 43 tests, mocked DB/guards
E2E: none (Playwright not installed)
Coverage thresholds: enforced per-package in jest configs (branches 60%, functions 80%, lines 70%, statements 70%)
```

## Security Configuration

```typescript
✅ JWT: short-lived access token (15m) + refresh token (7d) with separate secrets
✅ Login rate limiting: 10 attempts / 15 min per IP:username
✅ Uniform 401 messages ("Invalid credentials") — no user enumeration
✅ Password policy: 6–20 chars, upper + lower + digit (enforced on create/change)
✅ passwordHash never returned by API or updatable via profile (write-path ban)
✅ Input validation: Zod schemas on all API contracts
✅ SQL injection prevention: Prisma ORM + parameterized raw queries in legacy layer
✅ CORS restricted via CORS_ORIGINS env
✅ Audit logging for all data changes (with sanitization)
✅ Environment variable validation (Joi)
✅ pnpm audit in CI (daily scheduled workflow)
```

## Performance Targets (realistic)

```typescript
- API responses: fast, but no formal SLA is committed.
- The system handles thousands of records per table (production batches, alerts).
- Queries against the legacy martin3 DB are not benchmarked; add indexes where needed.
```

No marketing fantasy: there is no 200k-records/tenant, 10,000-concurrent-users, or €50k-contract target. Optimize for the actual workload: a small team of nursery staff on one server.
