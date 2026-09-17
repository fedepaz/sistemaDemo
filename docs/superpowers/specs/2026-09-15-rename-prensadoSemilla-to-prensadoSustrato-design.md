# Rename prensadoSemilla → prensadoSustrato

## Goal

Rename the field `prensadoSemilla` to `prensadoSustrato` across the entire stack to better reflect that the pressure reading applies to the substrate, not the seed.

## Scope

### What changes
- Prisma schema field name
- Shared package: schema types, constants, field labels, tests
- Backend: service mappings, tests
- Frontend: component form fields, data tables, tests

### What stays the same
- **Database column name**: `prensadoSemilla` — requires manual migration by user
- **Field label**: "Prensado" — unchanged (user-facing Spanish text)
- **Migration SQL files**: untouched (historical)
- **Historical docs/specs**: untouched
- **Label lookup keys** (`CreateSiembraPartida`, `AsignarUbiSiembraCompleta`, `SiembraPartida`, `ASembrar`): unchanged — they're internal keys, not user-facing

---

## 1. Prisma Schema

**File:** `apps/backend/prisma/schema/siembraPartidas.prisma`

- Line 8: `prensadoSemilla` → `prensadoSustrato`

```prisma
prensadoSustrato    Decimal  @db.Decimal(3,1) @default(0) // 0-6 in 0.5 increments
```

**Migration:** User will run `pnpm --filter backend db:migrate:dev` manually after code changes.

---

## 2. Shared Package

### Schema (`packages/shared/src/schemas/siembraPartida.schema.ts`)

- `PrensadoSemillaValues` → `PrensadoSustratoValues`
- `prensadoSemilla` → `prensadoSustrato` in `SiembraPartidaSchema` and `CreateSiembraPartidaSchema`

### Field Labels (`packages/shared/src/schemas/field-labels.ts`)

- Lines 79, 100, 122, 219: `prensadoSemilla: "Prensado"` → `prensadoSustrato: "Prensado"`

### Tests

- `siembraPartida.schema.spec.ts`: all `prensadoSemilla` → `prensadoSustrato`
- `field-labels.spec.ts`: key references updated

---

## 3. Backend

### Service (`apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`)

- Line 161: `row.prensadoSemilla.toNumber()` → `row.prensadoSustrato.toNumber()`
- Line 267: `data.prensadoSemilla` → `data.prensadoSustrato`
- Line 319: `prensadoSemilla: 0` → `prensadoSustrato: 0`
- Line 385: `data.prensadoSemilla` → `data.prensadoSustrato`

### Legacy Partidas Service (`apps/backend/src/modules/legacy/partidas/partidas.service.ts`)

- Line 94: `data.prensadoSemilla` → `data.prensadoSustrato`

### Tests

- `siembraPartidas.service.spec.ts`: 6 references
- `siembraPartidas.controller.spec.ts`: 1 reference
- `programacionSiembra.integration.spec.ts`: 1 reference

---

## 4. Frontend

### A Sembrar Edit Form (`apps/frontend/src/features/aSembrar/components/a-sembrar-edit-form.tsx`)

- Import: `PrensadoSemillaValues` → `PrensadoSustratoValues`
- Form field: `name="prensadoSemilla"` → `name="prensadoSustrato"`
- Select options: `PrensadoSemillaValues.map(...)` → `PrensadoSustratoValues.map(...)`

### A Sembrar Data Table (`apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx`)

- Line 57: `prensadoSemilla: row.prensadoSemilla` → `prensadoSustrato: row.prensadoSustrato`
- Line 113: `"prensadoSemilla"` → `"prensadoSustrato"` in summaryFields

### Siembra Partidas View Form (`apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx`)

- Line 172: `selectedPartida.prensadoSemilla` → `selectedPartida.prensadoSustrato`

### Tests (3 files)

- Mock data: `prensadoSemilla` → `prensadoSustrato`

---

## Execution Order

1. Shared package (backend depends on it)
2. Prisma schema
3. Backend service + tests
4. Frontend components + tests
5. Verification: `pnpm lint && pnpm type-check && pnpm test`
