# Design: Check-First `ensureGenericFormula`

**Date:** 2026-10-01
**Status:** Approved (brainstorming)
**Scope:** `apps/backend/src/modules/siembraPartidas/` only

## Context

`SiembraPartidasService.getOrCreateGenericFormula()` (`siembraPartidas.service.ts:40-61`) lazily seeds a "generic" producto + formula pair on every siembra-partida create without an explicit `formulaId` and on every `autorizarSiembra` creation. In production the UI never sends `formulaId` (`FormulaSelector` has no production consumer), so this path runs on essentially every create/authorize.

Each call executes **two upserts** even though after the first-ever call both rows already exist. That redundant write-path work — and the lack of direct tests around the helper — is what this refactor addresses.

## Goals

1. **Steady-state cost:** one `findUnique` instead of two upserts when the generic formula already exists (the normal case).
2. **Direct tests** for the generic-formula behavior, including an assertion that pins the exact literals/cuids so the fragile upsert invariant cannot be broken unknowingly.

## Non-Goals

- Changing `GENERIC_SUSTRATO_NAME` (`'Sustrato Genérico'`), `GENERIC_PRODUCTO1_ID` (`c000…001`), or the formula cuid (`c000…002`) — values stay byte-identical.
- Renaming the generic record's data or its display name.
- Filtering the generic rows out of producto/formula list endpoints.
- Memoization, `$transaction` wrapping, or `deletedAt` filtering on the lookup.

## Design

Public method on `SiembraPartidasService` (renamed from private `getOrCreateGenericFormula`):

```ts
async ensureGenericFormula(): Promise<string> {
  const existing = await this.prisma.formula.findUnique({
    where: { id: GENERIC_FORMULA_ID },
    select: { id: true },
  });
  if (existing) return existing.id;

  const producto = await this.prisma.producto.upsert({ /* unchanged */ });
  const formula = await this.prisma.formula.upsert({ /* unchanged */ });
  return formula.id;
}
```

- New constant `GENERIC_FORMULA_ID = 'c00000000000000000000002'` replaces the two inline literals (byte-identical value).
- Miss path is today's two upserts verbatim; no transaction (each upsert targets a unique key, so MySQL's native upsert is race-safe, and a half-created pair self-heals on the next call). Self-healing covers a half-created pair produced by this code (producto written, formula not); a formula row whose producto was later hard-deleted externally is no longer repaired on the hit path, unlike the old always-upserts version — accepted, since Goal 1 defines hit = zero writes.
- Hit semantics match today's upsert: a soft-deleted generic formula is still returned (no `deletedAt` filter).
- Call sites keep their existing logic; only the method reference updates: `createSiembraPartida` (`data.formulaId ?? await this.ensureGenericFormula()`) and `autorizarSiembra`.

## Test Plan (TDD — tests written red first)

In `apps/backend/src/modules/siembraPartidas/__tests__/siembraPartidas.service.spec.ts`:

1. **Hit:** `formula.findUnique` resolves `{ id }` → method returns id, zero upserts.
2. **Miss:** `findUnique` resolves `null` → producto upsert then formula upsert called; returns created formula id.
3. **Pinned arguments:** upsert calls carry exactly `'Sustrato Genérico'`, `c000…001`, `c000…002`, `porcentaje1: 100` (guards the invariant).
4. **Wiring:** `createSiembraPartida` without `formulaId` connects the generic id; with `formulaId` provided, `findUnique` is never called; `autorizarSiembra` on a non-existing row uses the generic id.

## Acceptance

- `pnpm lint && pnpm type-check && pnpm test` green.
- Steady-state create/authorize path issues 1 `findUnique` and no upserts.
- All existing siembraPartidas tests unchanged and passing (behavior parity).
