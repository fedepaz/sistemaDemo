# AGENTS.md - AgriManage

Enterprise Agricultural Management System. Monorepo with pnpm + Turborepo.

## Quick Start

```bash
pnpm install          # Must run first
pnpm dev              # Starts frontend (port 3000) + backend
```

## Key Commands

| Task | Command |
|------|---------|
| Dev (all) | `pnpm dev` |
| Dev (frontend only) | `pnpm dev:frontend` |
| Dev (backend only) | `pnpm dev:backend` |
| Build | `pnpm build` |
| Lint | `pnpm lint` |
| Test | `pnpm test` |
| Type check | `pnpm type-check` |
| Integration tests | `pnpm --filter backend test:integration` |
| Format | `pnpm format` |

## Backend Commands

```bash
pnpm --filter backend db:migrate        # Run Prisma migrations
pnpm --filter backend db:migrate:dev    # Create new migration
pnpm --filter backend db:seed:users     # Seed users
pnpm --filter backend db:seed:admin     # Seed admin
pnpm --filter backend db:studio         # Open Prisma Studio
```

## Monorepo Structure

- `apps/frontend` - Next.js 16 (App Router) + shadcn/ui + Tailwind v4
- `apps/backend` - NestJS 11 + Prisma + MariaDB
- `packages/shared` - Zod schemas & DTOs (`@vivero/shared`)

## Critical Rules

1. **Shared contracts**: All data types must be in `packages/shared/src/schemas/`
2. **Conventional Commits**: Enforced by commitlint (feat, fix, docs, etc.)
3. **TDD**: Tests before feature code
4. **Feature-based frontend**: Each feature in `src/features/` with api/, hooks/, components/
5. **Loading strategy:** See `docs/agents/loading-strategy.md` for skeleton and loading state patterns
6. **Design system tokens:** All spacing, typography, control heights, and table density must use tokens from `globals.css`. See `docs/agents/ux-ui-agent.md` for the full token reference. No arbitrary values (`p-[18px]`, `gap-[22px]`, etc.).
7. **Pull Requests:** Titles follow `PULL_REQUEST_CONVENTIONS.md` (Conventional Commits + `release`, enforced by the `PR Title Check` CI job); bodies use `.github/PULL_REQUEST_TEMPLATE.md`. Use the `pull-request-workflow` skill when asked to create a PR.

## Verification Order

Always run in this order before committing:
```bash
pnpm lint && pnpm type-check && pnpm test
```

## Gotchas

- Frontend build requires shared package: `pnpm --filter @vivero/shared build` runs automatically
- Legacy database uses raw MySQL queries (not Prisma) - see `apps/backend/src/infra/legacy-mysql/`
- Backend port is configured via `PORT` env var (default 3001)
- `pnpm overrides` in root package.json patches security vulnerabilities - don't remove them
  - **Never use `>=` in an override value.** It is unbounded, so pnpm may install the next major and silently bypass the caret ranges declared in workspace `package.json` files (this shipped Nest 12 to the server). Use `^X.Y.Z` instead: same security floor, plus an upper bound. Take `X.Y.Z` from the audit report, and pick it from the major the dependents actually declare rather than the newest major available.
  - `>=` is only valid in a *selector key* (e.g. `picomatch@>=4`), which targets dependency edges instead of constraining resolution - the value on the right is still what gets resolved to.
  - Prefer `pnpm audit --fix=update` over adding an override: it updates the lockfile within the ranges dependents already declared.
- Agent profiles in `docs/agents/` are the source of truth for architecture decisions
- `passwordHash` must NEVER appear in API responses or be updatable via profile schemas (passwords change only via `/auth/password` and `/auth/restore`)
- Login 401s are uniformly `"Invalid credentials"` (anti-enumeration); specifics go only in audit `changes.reason`
- The login rate limiter is in-memory (`LoginRateLimiter`, 10 attempts/15 min per IP:username) - single-instance server
- Integration tests mock all DB operations - no MariaDB needed in CI
