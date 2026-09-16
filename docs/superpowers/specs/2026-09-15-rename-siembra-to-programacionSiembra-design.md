# Rename siembra → programacionSiembra

## Goal

Rename the "siembra" entity/feature to "programacionSiembra" across the entire stack to avoid future naming conflicts when a separate "siembra" entity is needed. This is a one-time systematic rename done now while the feature is still young.

## Scope

### What changes
- Backend legacy siembra module: directory, files, classes, methods, endpoint
- Permission entity name: `siembra` → `programacion_siembra` everywhere
- Shared package: schema file names, type names, exports
- Frontend: feature directory, routes, components, query keys, navigation, API paths

### What stays the same
- **Database columns**: `f_siembra`, `sem_siembra` — these map to legacy MySQL columns
- **siembraPartidas module**: directory names, Prisma model, file names — only permission references update
- **siembraPartidas database table**: `siembra_partdas` — unchanged
- **Alerts `siembra-retrasada`**: separate feature with its own `alerts` permission — unchanged
- **User-facing Spanish text**: toast messages like "Partida autorizada para siembra" — these describe the planting process, not the entity name
- **SQL queries**: references to legacy DB columns stay as-is

---

## 1. Backend Module Rename

**Directory:**
- `apps/backend/src/modules/legacy/siembra/` → `apps/backend/src/modules/legacy/programacionSiembra/`

**Files inside:**
| Old | New |
|-----|-----|
| `siembra.controller.ts` | `programacionSiembra.controller.ts` |
| `siembra.module.ts` | `programacionSiembra.module.ts` |
| `siembra.service.ts` | `programacionSiembra.service.ts` |
| `interfaces/siembra.interface.ts` | `interfaces/programacionSiembra.interface.ts` |
| `repositories/siembra.repository.ts` | `repositories/programacionSiembra.repository.ts` |
| `__tests__/siembra.service.spec.ts` | `__tests__/programacionSiembra.service.spec.ts` |

**Class/function renames:**
- `SiembraController` → `ProgramacionSiembraController`
- `SiembraService` → `ProgramacionSiembraService`
- `SiembraRepository` → `ProgramacionSiembraRepository`
- `LegacySiembra` interface → `LegacyProgramacionSiembra`
- `LegacySiembraModule` → `LegacyProgramacionSiembraModule`
- Methods: `getAllSiembra()` → `getAllProgramacionSiembra()`, `findAllSiembra()` → `findAllProgramacionSiembra()`

**Endpoint:**
- `@Controller('l-siembra')` → `@Controller('l-programacion-siembra')`

**Permission:**
- `{ tableName: 'siembra', action: 'read' }` → `{ tableName: 'programacion_siembra', action: 'read' }`

**app.module.ts imports:**
- `import { LegacySiembraModule } from './modules/legacy/siembra/siembra.module'` → `import { LegacyProgramacionSiembraModule } from './modules/legacy/programacionSiembra/programacionSiembra.module'`
- `LegacySiembraModule` → `LegacyProgramacionSiembraModule` in imports array

---

## 2. Permission Updates (Other Modules)

These modules keep their names but update permission decorators:

| File | Change |
|------|--------|
| `siembraPartidas.controller.ts` (lines 15, 31) | `{ tableName: 'siembra' }` → `{ tableName: 'programacion_siembra' }` |
| `partidas.controller.ts` (line 55) | `{ tableName: 'siembra', action: 'create' }` → `{ tableName: 'programacion_siembra', action: 'create' }` |
| `mezcla.controller.ts` (line 16) | `{ tableName: 'siembra', action: 'create' }` → `{ tableName: 'programacion_siembra', action: 'create' }` |
| `prisma/seed-billboard.ts` (line 77) | `permissionTable: 'siembra'` → `permissionTable: 'programacion_siembra'` |

**Frontend permission references:**
| File | Change |
|------|--------|
| `navigations.ts` (lines 40, 64) | `{ table: "siembra" }` → `{ table: "programacion_siembra" }` |
| `siembra-data-table.tsx` | `tableName="siembra"` → `tableName="programacion_siembra"` |
| `siembra-partidas-registradas-data-table.tsx` | `tableName="siembra"` → `tableName="programacion_siembra"` |
| `mezcla-data-table.tsx` | `tableName="siembra"` → `tableName="programacion_siembra"` |

---

## 3. Shared Package Rename

**File renames:**
| Old | New |
|-----|-----|
| `schemas/siembra.schema.ts` | `schemas/programacionSiembra.schema.ts` |
| `schemas/__tests__/siembra.schema.spec.ts` | `schemas/__tests__/programacionSiembra.schema.spec.ts` |

**Type/schema renames:**
- `SiembraDtoSchema` → `ProgramacionSiembraDtoSchema`
- `SiembraDto` → `ProgramacionSiembraDto`

**Export in `index.ts`:**
- `export * from "./schemas/siembra.schema"` → `export * from "./schemas/programacionSiembra.schema"`

**What stays:**
- `siembraPartida.schema.ts` — unchanged
- `partidas.schema.ts` — `AsignarUbiSiembraDtoSchema` unchanged
- `alerts.schema.ts` — `siembras` field unchanged
- `field-labels.ts` — `f_siembra`, `sem_siembra` labels unchanged

---

## 4. Frontend Rename

**Directory/file renames:**
| Old | New |
|-----|-----|
| `features/siembra/` | `features/programacionSiembra/` |
| `app/(dashboard)/siembra/` | `app/(dashboard)/programacion-siembra/` |

**Route constants:**
- `SIEMBRA: "/siembra"` → `PROGRAMACION_SIEMBRA: "/programacion-siembra"`
- `SIEMBRA_PARTIDAS_REGISTRADAS: "/siembra/partidas-registradas"` → stays as `/programacion-siembra/partidas-registradas` (via updated parent route)

**Component renames inside `features/programacionSiembra/`:**
- `SiembraDashboard` → `ProgramacionSiembraDashboard`
- `SiembraDashboardSkeleton` → `ProgramacionSiembraDashboardSkeleton`
- `SiembraView` → `ProgramacionSiembraView`
- `SiembraViewForm` → `ProgramacionSiembraViewForm`
- `useSiembraPartidas` → `useProgramacionSiembraPartidas`
- `useSiembraPartidaMutation` → `useProgramacionSiembraPartidaMutation`
- `useTratamientos`, `useLegacySustratos` — keep names (generic)
- `siembraService` → `programacionSiembraService`

**Query keys:**
- `siembraQueryKeys` → `programacionSiembraQueryKeys`
- `siembraPartidasRegistradasQueryKeys` → `programacionSiembraPartidasRegistradasQueryKeys`

**Navigation config:**
- `title: "Siembra"` → `title: "Programación Siembra"`
- `href: ROUTES.SIEMBRA` → `href: ROUTES.PROGRAMACION_SIEMBRA`
- `description: "Partidas autorizadas para siembra"` → stays (user-facing Spanish)

**API endpoint paths:**
- `l-siembra` → `l-programacion-siembra` in service files

**Cross-feature imports (aSembrar, mezclas):**
- Update import paths to new `features/programacionSiembra/` directory
- Update permission checks to `tableName: "programacion_siembra"`

---

## 5. Integration Tests

**File rename:**
- `test/integration/siembra.integration.spec.ts` → `test/integration/programacionSiembra.integration.spec.ts`

**Updates in test helpers:**
- `create-app.ts`: update imports to new module names
- `mock-factories.ts`: rename mock factories (`createSiembraMock` → `createProgramacionSiembraMock`)
- `fixtures.ts`: keep `clmocksiembra0000000000000` (it's a test ID, not an entity name)

**Test content:**
- Update route assertions: `GET /l-siembra` → `GET /l-programacion-siembra`
- Update permission mock data to use `programacion_siembra`

---

## 6. Execution Order

1. **Shared package** first (backend depends on it)
2. **Backend module** rename + permission updates
3. **Frontend** rename + API path updates
4. **Integration tests** update
5. **Run verification**: `pnpm lint && pnpm type-check && pnpm test`

---

## Constraints

- **No commits** — user will handle git commits manually
- **No database migrations** — user will migrate manually if needed; code changes only reference existing columns

## Risk Mitigation

- **Database columns untouched**: No migration needed, no data risk
- **siembraPartidas untouched**: Only permission reference changes, no functional impact
- **Alerts untouched**: Completely separate feature
- **Verification**: Full lint + typecheck + test suite after all changes
