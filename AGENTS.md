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

- `apps/frontend` - Next.js 15 (App Router) + shadcn/ui + Tailwind v4
- `apps/backend` - NestJS 11 + Prisma + MariaDB
- `packages/shared` - Zod schemas & DTOs (`@vivero/shared`)

## Critical Rules

1. **Shared contracts**: All data types must be in `packages/shared/src/schemas/`
2. **Conventional Commits**: Enforced by commitlint (feat, fix, docs, etc.)
3. **TDD**: Tests before feature code
4. **Feature-based frontend**: Each feature in `src/features/` with api/, hooks/, components/

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
- Agent profiles in `docs/agents/` are the source of truth for architecture decisions
