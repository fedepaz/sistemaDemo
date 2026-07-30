# Alerts Feature — V2/V3 Removal + Test Coverage

**Date:** 2026-07-27
**Status:** Approved
**Scope:** Clean removal of unused V2/V3 alert versions + comprehensive test coverage across all layers

---

## Goal

1. Remove V2/V3 alert implementations (dead code) to fix pre-existing type-check errors and reduce maintenance surface
2. Add test coverage across backend (service, controller, repository) and frontend (hooks, service, V1 components)

---

## Part 1: V2/V3 Removal

### Files to Delete

| # | Path | Reason |
|---|------|--------|
| 1 | `apps/frontend/src/features/alerts/components/v2/AlertsDashboardV2.tsx` | Unused |
| 2 | `apps/frontend/src/features/alerts/components/v2/SiembraRetrasadaCard.tsx` | Only used by V2/V3 |
| 3 | `apps/frontend/src/features/alerts/components/v2/FaltaGerminacionCard.tsx` | Only used by V2/V3 |
| 4 | `apps/frontend/src/features/alerts/components/v2/FaltantePlantasCard.tsx` | Only used by V2/V3 |
| 5 | `apps/frontend/src/features/alerts/components/v2/FaltaPreExpedicionCard.tsx` | Only used by V2/V3 |
| 6 | `apps/frontend/src/features/alerts/components/v2/NotificationCenter.tsx` | Only used by V2 |
| 7 | `apps/frontend/src/features/alerts/components/v3/AlertsDashboardV3.tsx` | Unused |
| 8 | `apps/frontend/src/features/alerts/components/v3/alert-list-panel.tsx` | Only used by V3 |
| 9 | `apps/frontend/src/features/alerts/components/v3/alert-detail-panel.tsx` | Only used by V3 (imports V2 cards) |
| 10 | `apps/frontend/src/features/alerts/components/v3/get-severity.ts` | Only used by V3 |
| 11 | `apps/frontend/src/app/(dashboard)/alerts/v2/page.tsx` | Route for unused V2 |
| 12 | `apps/frontend/src/app/(dashboard)/alerts/v2/loading.tsx` | Loading for unused V2 |
| 13 | `apps/frontend/src/app/(dashboard)/alerts/v3/page.tsx` | Route for unused V3 |
| 14 | `apps/frontend/src/app/(dashboard)/alerts/v3/loading.tsx` | Loading for unused V3 |
| 15 | `apps/frontend/src/features/alerts/hooks/useAlertActions.ts` | Only consumed by V2/V3 |

### Directories to Delete (after removing files)

- `apps/frontend/src/features/alerts/components/v2/`
- `apps/frontend/src/features/alerts/components/v3/`
- `apps/frontend/src/app/(dashboard)/alerts/v2/`
- `apps/frontend/src/app/(dashboard)/alerts/v3/`

### Files to Edit

- `apps/frontend/src/features/alerts/index.ts` — Remove exports for V2, V3, useAlertActions, FilterTabs

### What's NOT Deleted

- `components/shared/filter-tabs.tsx` — harmless dead code, can clean up later
- Backend endpoints — shared by all versions, no V2/V3-specific code
- Navigation/routes config — V2/V3 were never in navigation or route constants

### Side Benefit

Fixes pre-existing type-check errors in V2/V3 card components that reference old DTO properties (`solicitadas`, `germinadasTotales`, `invernadero`, `con`).

---

## Part 2: Backend Tests

### Test File 1: `apps/backend/src/modules/legacy/alerts/__tests__/alerts.service.spec.ts`

**Purpose:** Unit tests for the 4 mapper functions in `AlertsService`.

**Strategy:** Mock `AlertsRepository` to return controlled test data. Verify each mapper correctly transforms legacy DB fields to shared DTO fields.

**Test cases (~24):**

| Mapper | Happy Path | Edge Case |
|--------|-----------|-----------|
| `mapSiembraRetrasada` | All fields mapped correctly | `indice === 0` (no slash in display) |
| `mapFaltaGerminacion` | All fields mapped correctly | `pr === "0"` (zero germination rate) |
| `mapFaltantePlantas` | All fields mapped correctly | `hai === "A"` (excluded from query but mapper doesn't filter) |
| `mapFaltaPreExpedicion` | All fields mapped correctly | `pe === 0` (no pre-expedition) |

**Key verifications:**
- `row.partida` → `partidaId` (number)
- `row.ano` → `anio` (number)
- `row.espvar` → `codigoEspecie` (string)
- `row.nombre` → `nombreEspecie` (string)
- `row.pr` → `pr` (string, not number — decimal precision)
- `row.st_ini_pr` → `stIniPr` (string, not number)
- `row.semSiembra` → `semSiembra` (string from CONCAT)
- `row.semEntrega` → `semEntrega` (string from CONCAT)

### Test File 2: `apps/backend/src/modules/legacy/alerts/__tests__/alerts.controller.spec.ts`

**Purpose:** Unit tests for the 4 GET endpoints in `AlertsController`.

**Strategy:** Use NestJS `Test.createTestingModule` with mocked `AlertsService`. Verify correct HTTP response mapping and permission decorator behavior.

**Test cases (~8):**

| Endpoint | Success | Permission Denied |
|----------|---------|-------------------|
| `GET /l-alerts/siembra-retrasada` | Returns array of DTOs | Returns 403 |
| `GET /l-alerts/falta-germinacion` | Returns array of DTOs | Returns 403 |
| `GET /l-alerts/faltante-plantas` | Returns array of DTOs | Returns 403 |
| `GET /l-alerts/falta-pre-expedicion` | Returns array of DTOs | Returns 403 |

### Test File 3: `apps/backend/test/integration/alerts.integration.spec.ts`

**Purpose:** Integration tests against real MariaDB to validate SQL queries execute correctly and return data matching DTO schemas.

**Strategy:** Use the existing integration test pattern (`apps/backend/test/integration/`). Make HTTP requests to the alert endpoints. Parse responses with Zod schemas to verify contract compliance.

**Test cases (~4):**

| Endpoint | Verification |
|----------|-------------|
| `GET /l-alerts/siembra-retrasada` | Response parses with `SiembraRetrasadaDtoSchema` |
| `GET /l-alerts/falta-germinacion` | Response parses with `FaltaGerminacionDtoSchema` |
| `GET /l-alerts/faltante-plantas` | Response parses with `FaltantePlantasDtoSchema` |
| `GET /l-alerts/falta-pre-expedicion` | Response parses with `FaltaPreExpedicionDtoSchema` |

**Prerequisites:** Running MariaDB instance with seeded data (existing infrastructure).

---

## Part 3: Frontend Tests

### Test File 4: `apps/frontend/src/features/alerts/__tests__/useAlerts.test.tsx`

**Purpose:** Unit tests for the 4 `useSuspenseQuery` hooks in `useAlerts.ts`.

**Strategy:** Mock `alertService` functions. Wrap in `QueryClientProvider`. Verify hooks delegate to correct service functions and return data.

**Test cases (~4):**

| Hook | Verification |
|------|-------------|
| `useSiembraRetrasada` | Calls `fetchSiembraRetrasada`, returns parsed data |
| `useFaltaGerminacion` | Calls `fetchFaltaGerminacion`, returns parsed data |
| `useFaltantePlantas` | Calls `fetchFaltantePlantas`, returns parsed data |
| `useFaltaPreExpedicion` | Calls `fetchFaltaPreExpedicion`, returns parsed data |

### Test File 5: `apps/frontend/src/features/alerts/__tests__/alertService.test.ts`

**Purpose:** Unit tests for the 4 fetch functions in `alertService.ts`.

**Strategy:** Mock `clientFetch` from `@/lib/client-fetch`. Verify correct URLs, HTTP methods, and response parsing.

**Test cases (~8):**

| Function | Success | Error |
|----------|---------|-------|
| `fetchSiembraRetrasada` | Returns parsed DTOs | Throws on network error |
| `fetchFaltaGerminacion` | Returns parsed DTOs | Throws on network error |
| `fetchFaltantePlantas` | Returns parsed DTOs | Throws on network error |
| `fetchFaltaPreExpedicion` | Returns parsed DTOs | Throws on network error |

### Test File 6: `apps/frontend/src/features/alerts/components/v1/__tests__/AlertsDashboardV1.test.tsx`

**Purpose:** Smoke + behavior tests for the main V1 dashboard component.

**Strategy:** Mock the 4 `useSuspenseQuery` hooks. Render with `QueryClientProvider` and `Suspense` boundary. Verify correct component rendering.

**Test cases (~4):**

| Scenario | Verification |
|----------|-------------|
| Loading state | Skeleton renders during suspense |
| Empty state | "No alerts" message when all queries return empty |
| Data state | 4 data tables render when data is provided |
| Mixed state | Some tables show data, others show empty |

### Test File 7: `apps/frontend/src/features/alerts/components/v1/__tests__/alerts-data-table.test.tsx`

**Purpose:** Tests for the reusable `AlertsDataTable` component.

**Strategy:** Render with mock data and columns. Verify table structure and empty state.

**Test cases (~3):**

| Scenario | Verification |
|----------|-------------|
| With data | Rows render correctly |
| Empty data | Empty state message appears |
| Column config | Columns are applied to the table |

---

## Summary

| Layer | New Files | New Tests | Coverage |
|-------|-----------|-----------|----------|
| Backend unit | 2 | ~32 | Service mappers + controller endpoints |
| Backend integration | 1 | ~4 | SQL correctness + DTO validation |
| Frontend | 4 | ~19 | Hooks, service, V1 components |
| V2/V3 removal | — | — | 15 files deleted, type-check errors fixed |
| **Total** | **7** | **~55** | Full coverage across all layers |

---

## Verification Order

After implementation, run in this order:

```bash
pnpm --filter @vivero/shared test        # Shared DTOs
pnpm --filter backend test               # Backend unit + integration
pnpm --filter frontend test              # Frontend unit
pnpm type-check                          # Type check (should be clean after V2/V3 removal)
pnpm lint                                # Lint
```

---

## Out of Scope

- Visual regression tests
- E2E tests (Cypress/Playwright)
- Performance/load testing
- Snapshot tests for components
- `filter-tabs.tsx` cleanup (dead code, non-blocking)
