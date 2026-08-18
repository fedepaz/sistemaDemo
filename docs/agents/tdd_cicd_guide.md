# TDD & CI/CD Guide - AgriManage

Philosophy: tests are the safety net for a solo developer deploying to a production server with no rollback theater — write them first, keep them green, and let CI verify before anything reaches `main`.

## Testing Strategy

- **Backend / shared / frontend specialists** write unit and component tests as part of feature work (TDD).
- **QA engineer** maintains the backend HTTP integration suite and CI gates.

## The Testing Pyramid (Actual)

| Layer | Count | What | How |
|-------|-------|------|-----|
| Unit / component | 114 shared + 105 backend + 104 frontend | schemas, services, repositories, guards, interceptors, components, hooks | `pnpm test` |
| Integration (HTTP) | 43 | backend endpoints via supertest, mocked guards/services | `pnpm --filter backend test:integration` |
| E2E | 0 | not installed | — |

## Testing Rules

1. **TDD**: write the failing test before the implementation.
2. If it's business logic → unit test. If it's an API contract / auth / permission boundary → integration test. If it's UI behavior → component test.
3. Follow existing patterns and existing test files — do not introduce a new test framework.

## CI/CD Pipeline (Actual)

Source of truth: `docs/agents/cicd_agent.md`.

1. `.github/actions/setup/action.yml` — composite setup (pnpm, Node, deps, `prisma generate`).
2. `.github/workflows/ci-test.yml` — reusable; 3 parallel jobs: `lint`, `unit-tests`, `integration-tests`.
3. `.github/workflows/pr-checks.yml` — PR gate → `ci-test.yml` on PRs to `dev`/`main`.
4. `.github/workflows/build-verification.yml` — **builds** frontend + backend on push to `main` (it does NOT deploy).
5. `.github/workflows/scheduled.yml` — daily `pnpm audit --audit-level high`.

## Testing Commands

| Command | Scope | When |
|---------|-------|------|
| `pnpm lint && pnpm type-check && pnpm test` | full quality gate | pre-commit + CI |
| `pnpm --filter backend test:integration` | backend HTTP integration (43) | CI / before merge |
| `pnpm --filter @vivero/shared test` | shared schema tests (114) | CI |

Integration tests mock all DB operations — **no MariaDB required** in CI.

## Quality Gates & Metrics

- Per-package Jest coverage thresholds: branches 60%, functions 80%, lines 70%, statements 70%.
- No high/critical `pnpm audit` findings (enforced by `scheduled.yml`).
- `build-verification.yml` must be green on `main`.

## Deployment Verification (Manual)

GitHub Actions verifies quality but does **not** deploy. After a manual deploy to the Windows server:

1. Health check on frontend (`:3000`) and backend (`:3001`).
2. Login as a real user; confirm dashboard loads.
3. Check backend logs (pino) for startup errors.
4. Confirm Cloudflare Tunnel is up and the public hostname serves the app.

---

Goal: ship to a single production server with confidence — tests catch regressions, CI verifies builds, and the manual deploy is a known, documented procedure.
