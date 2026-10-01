# Check-First `ensureGenericFormula` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the always-two-upserts generic-formula lookup with a check-first `findUnique` (one query on the steady-state path) and add direct unit tests that pin the seed literals/cuids.

**Architecture:** One public method on `SiembraPartidasService` — `ensureGenericFormula()` first does `formula.findUnique` by the fixed cuid and returns early on a hit; only on a miss does it run today's two upserts verbatim. Call-site logic is unchanged apart from the method reference rename. Tests are added to the existing Nest TestingModule spec with the existing `prismaMock`.

**Tech Stack:** NestJS 11, Prisma (MariaDB), Jest + ts-jest, pnpm + Turborepo.

**Spec:** `docs/superpowers/specs/2026-10-01-check-first-generic-formula-design.md`

## Global Constraints

- `GENERIC_SUSTRATO_NAME` value stays the byte-identical literal `'Sustrato Genérico'`; cuids stay `'c00000000000000000000001'` and `'c00000000000000000000002'` — never change them (upsert-by-nombre + fixed-id invariant; changing either causes a duplicate-key crash).
- No `$transaction`, no memoization, no `deletedAt` filter on the lookup (behavior parity with today's upsert).
- Miss path = today's two upserts verbatim (`update: {}`, same `create` payloads).
- TDD: write the failing tests first, observe the failure, then implement.
- Code identifiers English; Spanish only for user-facing/validation copy (none here).
- Verification before commit: `pnpm lint && pnpm type-check && pnpm test`.
- Conventional Commits (commitlint enforced by hook); one commit for the whole task.
- Do NOT run `prisma migrate*`, do NOT push.

---

### Task 1: Check-first `ensureGenericFormula` + direct tests

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts:25-26` (constants), `:40-61` (method), `:273` and `:351` (call sites)
- Test: `apps/backend/src/modules/siembraPartidas/__tests__/siembraPartidas.service.spec.ts` (prismaMock at `:113-117`; new `describe` inserted before `describe('autorizarSiembra')` at `:284`)

**Interfaces:**
- Consumes: existing `prismaMock = { producto: { upsert }, formula: { upsert }, siembraPartidas: { findFirst } }` (adds `formula.findUnique`); existing `repo`, `mockRow`, `mockDto` fixtures; `SiembraPartidasService` constructor injection of `PrismaService`.
- Produces: public method `ensureGenericFormula(): Promise<string>` on `SiembraPartidasService`; constant `GENERIC_FORMULA_ID = 'c00000000000000000000002'`. Task 1 is self-contained; nothing else consumes the new name beyond the two in-file call sites.

- [ ] **Step 1: Add `findUnique` to the prismaMock and write the failing tests**

In `__tests__/siembraPartidas.service.spec.ts`, extend the mock (lines 113-117):

```ts
    prismaMock = {
      producto: { upsert: jest.fn() },
      formula: { upsert: jest.fn(), findUnique: jest.fn() },
      siembraPartidas: { findFirst: jest.fn() },
    };
```

Insert this `describe` immediately before `describe('autorizarSiembra', () => {` (line 284):

```ts
  describe('ensureGenericFormula', () => {
    const GENERIC_FORMULA_ID = 'c00000000000000000000002';
    const GENERIC_PRODUCTO_ID = 'c00000000000000000000001';

    it('returns the existing formula id without any upserts (check-first)', async () => {
      prismaMock.formula.findUnique.mockResolvedValue({
        id: GENERIC_FORMULA_ID,
      });

      const result = await service.ensureGenericFormula();

      expect(result).toBe(GENERIC_FORMULA_ID);
      expect(prismaMock.formula.findUnique).toHaveBeenCalledWith({
        where: { id: GENERIC_FORMULA_ID },
        select: { id: true },
      });
      expect(prismaMock.producto.upsert).not.toHaveBeenCalled();
      expect(prismaMock.formula.upsert).not.toHaveBeenCalled();
    });

    it('creates producto and formula on a miss and returns the formula id', async () => {
      prismaMock.formula.findUnique.mockResolvedValue(null);
      prismaMock.producto.upsert.mockResolvedValue({ id: GENERIC_PRODUCTO_ID });
      prismaMock.formula.upsert.mockResolvedValue({ id: GENERIC_FORMULA_ID });

      const result = await service.ensureGenericFormula();

      expect(result).toBe(GENERIC_FORMULA_ID);
      expect(prismaMock.producto.upsert).toHaveBeenCalledTimes(1);
      expect(prismaMock.formula.upsert).toHaveBeenCalledTimes(1);
    });

    it('pins the exact literals and cuids in the miss-path upserts', async () => {
      prismaMock.formula.findUnique.mockResolvedValue(null);
      prismaMock.producto.upsert.mockResolvedValue({ id: GENERIC_PRODUCTO_ID });
      prismaMock.formula.upsert.mockResolvedValue({ id: GENERIC_FORMULA_ID });

      await service.ensureGenericFormula();

      expect(prismaMock.producto.upsert).toHaveBeenCalledWith({
        where: { nombre: 'Sustrato Genérico' },
        update: {},
        create: { id: GENERIC_PRODUCTO_ID, nombre: 'Sustrato Genérico' },
      });
      expect(prismaMock.formula.upsert).toHaveBeenCalledWith({
        where: { id: GENERIC_FORMULA_ID },
        update: {},
        create: {
          id: GENERIC_FORMULA_ID,
          producto1Id: GENERIC_PRODUCTO_ID,
          porcentaje1: 100,
        },
      });
    });

    it('connects the generic formula from createSiembraPartida when formulaId is absent', async () => {
      prismaMock.formula.findUnique.mockResolvedValue({
        id: GENERIC_FORMULA_ID,
      });
      repo.createSiembraPartida.mockResolvedValue(mockRow);
      repo.findById.mockResolvedValue(mockRow);

      await service.createSiembraPartida(
        {
          partidaId: 100,
          anio: 2026,
          indice: 1,
          metodoMaquina: true,
          prensadoSustrato: 25,
          profundidadSemilla: '1.525',
          tratamientoSemilla: '',
          sustrato: 'Sustrato A',
          startTime: '2026-09-15T08:00:00.000-03:00',
          endTime: '2026-09-15T12:00:00.000-03:00',
        },
        'user-1',
      );

      expect(repo.createSiembraPartida).toHaveBeenCalledWith(
        expect.objectContaining({
          formula: { connect: { id: GENERIC_FORMULA_ID } },
        }),
      );
    });

    it('never touches the generic lookup when formulaId is provided', async () => {
      repo.createSiembraPartida.mockResolvedValue(mockRow);
      repo.findById.mockResolvedValue(mockRow);

      await service.createSiembraPartida(
        {
          partidaId: 100,
          anio: 2026,
          indice: 1,
          metodoMaquina: true,
          prensadoSustrato: 25,
          profundidadSemilla: '1.525',
          tratamientoSemilla: '',
          sustrato: 'Sustrato A',
          startTime: '2026-09-15T08:00:00.000-03:00',
          endTime: '2026-09-15T12:00:00.000-03:00',
          formulaId: 'formula-1',
        },
        'user-1',
      );

      expect(prismaMock.formula.findUnique).not.toHaveBeenCalled();
      expect(repo.createSiembraPartida).toHaveBeenCalledWith(
        expect.objectContaining({
          formula: { connect: { id: 'formula-1' } },
        }),
      );
    });

    it('uses the generic formula from autorizarSiembra when creating a new row', async () => {
      prismaMock.siembraPartidas.findFirst.mockResolvedValue(null);
      prismaMock.formula.findUnique.mockResolvedValue(null);
      prismaMock.producto.upsert.mockResolvedValue({ id: GENERIC_PRODUCTO_ID });
      prismaMock.formula.upsert.mockResolvedValue({ id: GENERIC_FORMULA_ID });
      repo.createSiembraPartida.mockResolvedValue(mockRow);
      repo.findById.mockResolvedValue(mockRow);
      partidasRepoMock.findByComposite.mockResolvedValue(null);
      taskShiftsRepoMock.findByPartidaComposite.mockResolvedValue(null);

      await service.autorizarSiembra(
        { partidaId: 100, anio: 2026, indice: 1 },
        'user-1',
      );

      expect(prismaMock.formula.findUnique).toHaveBeenCalledTimes(1);
      expect(repo.createSiembraPartida).toHaveBeenCalledWith(
        expect.objectContaining({
          formula: { connect: { id: GENERIC_FORMULA_ID } },
        }),
      );
    });
  });
```

- [ ] **Step 2: Run the tests to verify they fail (compile-level RED)**

Run: `pnpm --filter backend test -- siembraPartidas.service`
Expected: **FAIL** — TS error `Property 'ensureGenericFormula' does not exist on type 'SiembraPartidasService'` (ts-jest compile failure). This is the expected RED: the method does not exist yet. The 6 new tests are the red signal; no other test fails for a different reason.

- [ ] **Step 3: Implement the check-first method**

In `siembraPartidas.service.ts`, add the constant after line 26:

```ts
const GENERIC_FORMULA_ID = 'c00000000000000000000002';
```

Replace the whole `getOrCreateGenericFormula` method (lines 40-61) with:

```ts
  async ensureGenericFormula(): Promise<string> {
    const existing = await this.prisma.formula.findUnique({
      where: { id: GENERIC_FORMULA_ID },
      select: { id: true },
    });
    if (existing) return existing.id;

    const producto = await this.prisma.producto.upsert({
      where: { nombre: GENERIC_SUSTRATO_NAME },
      update: {},
      create: {
        id: GENERIC_PRODUCTO1_ID,
        nombre: GENERIC_SUSTRATO_NAME,
      },
    });

    const formula = await this.prisma.formula.upsert({
      where: { id: GENERIC_FORMULA_ID },
      update: {},
      create: {
        id: GENERIC_FORMULA_ID,
        producto1Id: producto.id,
        porcentaje1: 100,
      },
    });

    return formula.id;
  }
```

Update the two call sites (only the method reference changes):

- Line 273: `const formulaId = data.formulaId ?? (await this.ensureGenericFormula());`
- Line 351: `const formulaId = await this.ensureGenericFormula();`

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter backend test -- siembraPartidas.service`
Expected: PASS — all tests in the file green (6 new + all pre-existing), 0 failed.

- [ ] **Step 5: Run the full verification order**

Run: `pnpm lint && pnpm type-check && pnpm test`
Expected: all three commands exit 0 (5 pre-existing frontend lint warnings are non-blocking).

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts apps/backend/src/modules/siembraPartidas/__tests__/siembraPartidas.service.spec.ts
git commit -m "refactor(siembraPartidas): check-first ensureGenericFormula with direct tests"
```

Expected: pre-commit lint passes, commit created.
