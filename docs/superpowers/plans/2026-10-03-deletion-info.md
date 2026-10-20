# Deletion Info (deletedAt + deleter) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose `deletedAt` + deleter username on producto/fórmula DTOs and show an "Eliminado el `<fecha>` por `<usuario>`" line in both view forms, only for deleted records.

**Architecture:** One protected `enrichDeletedBy(rows)` helper in `BaseRepository` (batch username lookup, zero queries when nothing is deleted) — called only by `ProductosRepository` (findAll/findById overrides) and `FormulaRepository` (its existing overrides + create). Shared Zod DTOs gain three nullable fields; services/repos map them; view forms render a deletion line gated on `deletedAt`.

**Tech Stack:** NestJS 11 + Prisma, Zod (`@vivero/shared`), Next.js 16 + RTL/Jest, monorepo pnpm + Turborepo.

## Global Constraints

- **NO git commits or pushes during execution.** Commits happen only later via the approved commit-workflow (user rule). No commit steps in this plan.
- Language: English for code/comments; **Spanish for all UI copy**.
- UI copy (exact): label `Eliminado`, value `el <fecha> por <username>` (username clause omitted when null). No `Activo` anywhere. Negative-only: the line renders only when `deletedAt` is set.
- Date format: `toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })` (same as existing "Creado"/"Fecha de Creación" rows).
- Design tokens / existing component patterns only — reuse the existing `InfoRow` markup (producto) and the existing "Creado" row markup (fórmula) verbatim; no new arbitrary values.
- **Zero** queryKeys/invalidation changes. **No Prisma migrations** (columns + relations already exist). Never run `prisma migrate*`.
- Prod literals untouched: `'Sustrato Genérico'`, cuids `c00000000000000000000001` / `c00000000000000000000002`.
- Verification order before finishing: `pnpm lint && pnpm type-check && pnpm test`, then `pnpm --filter backend test:integration`.
- Spec: `docs/superpowers/specs/2026-10-03-deletion-info-design.md`.

## File Structure

| File | Responsibility |
|---|---|
| Create: `apps/backend/src/shared/baseModule/__tests__/base.repository.spec.ts` | Unit tests for `enrichDeletedBy` + `recover` hygiene fix |
| Modify: `apps/backend/src/shared/baseModule/base.repository.ts` | Export `WithDeletedBy<T>`, add `enrichDeletedBy`, clear `deletedByUserId` in `recover` |
| Modify: `packages/shared/src/schemas/productos.schema.ts` | `ProductoSchema` += 3 nullable deletion fields |
| Modify: `packages/shared/src/schemas/formula.schema.ts` | `FormulaSchema` += 3 nullable deletion fields |
| Modify: `packages/shared/src/schemas/__tests__/productos.schema.spec.ts` | Fixtures + new deletion-field tests |
| Modify: `packages/shared/src/schemas/__tests__/formula.schema.spec.ts` | Fixtures + new deletion-field tests |
| Modify: `apps/backend/src/modules/productos/repositories/productos.repository.ts` | `findAll`/`findById` overrides calling `enrichDeletedBy` |
| Modify: `apps/backend/src/modules/productos/productos.service.ts` | Map 3 deletion fields into every DTO path |
| Modify: `apps/backend/src/modules/productos/__tests__/productos.repository.spec.ts` | Enrichment tests + fixture update |
| Modify: `apps/backend/src/modules/productos/__tests__/productos.service.spec.ts` | DTO expectations + enrichment passthrough test |
| Modify: `apps/backend/src/modules/formula/repositories/formula.repository.ts` | `mapRow` + enrich in `findAll`/`findById`/`create` |
| Modify: `apps/backend/src/modules/formula/__tests__/formula.repository.spec.ts` | Enrichment tests + `expectedDto` update |
| Modify: `apps/backend/test/integration/fixtures/fixtures.ts` | DTO factories gain 3 null fields |
| Modify: `apps/backend/test/integration/productos.integration.spec.ts` | GET assertions |
| Modify: `apps/backend/test/integration/formula.integration.spec.ts` | GET assertions |
| Modify: `apps/frontend/src/features/productos/components/producto-view-form.tsx` | Conditional `Eliminado` InfoRow |
| Modify: `apps/frontend/src/features/formulas/components/formula-view-form.tsx` | Conditional `Eliminado` row |
| Modify: `apps/frontend/src/features/productos/components/__tests__/producto-view-form.test.tsx` | Deletion line tests |
| Modify: `apps/frontend/src/features/formulas/components/__tests__/formula-view-form.test.tsx` | Deletion line tests |

---

### Task 1: Shared schemas — deletion fields

**Files:**
- Modify: `packages/shared/src/schemas/productos.schema.ts`
- Modify: `packages/shared/src/schemas/formula.schema.ts`
- Test: `packages/shared/src/schemas/__tests__/productos.schema.spec.ts`, `packages/shared/src/schemas/__tests__/formula.schema.spec.ts`

**Interfaces:**
- Produces: `ProductoDto` and `FormulaDto` gain `deletedAt: Date | null`, `deletedByUserId: string | null`, `deletedByUsername: string | null`. All later tasks depend on these exact names.

- [ ] **Step 1: Update existing fixtures (they will fail until the schema change lands) and add failing tests**

In `packages/shared/src/schemas/__tests__/productos.schema.spec.ts`, add the three fields to the `valid` fixture inside `describe("ProductoSchema")`:

```ts
  const valid = {
    id: "clx1234567890abcdef123456",
    nombre: "Turba",
    isActive: true,
    createdAt: new Date("2026-01-15"),
    deletedAt: null,
    deletedByUserId: null,
    deletedByUsername: null,
  };
```

Add a new `describe` block at the end of the file:

```ts
describe("ProductoSchema deletion fields", () => {
  it("accepts null deletion fields", () => {
    const result = ProductoSchema.parse({
      ...valid,
      deletedAt: null,
      deletedByUserId: null,
      deletedByUsername: null,
    });
    expect(result.deletedAt).toBeNull();
    expect(result.deletedByUserId).toBeNull();
    expect(result.deletedByUsername).toBeNull();
  });

  it("accepts populated deletion fields", () => {
    const result = ProductoSchema.parse({
      ...valid,
      deletedAt: new Date("2026-10-01"),
      deletedByUserId: "user-1",
      deletedByUsername: "admin",
    });
    expect(result.deletedAt).toEqual(new Date("2026-10-01"));
    expect(result.deletedByUserId).toBe("user-1");
    expect(result.deletedByUsername).toBe("admin");
  });

  it("rejects missing deletion fields", () => {
    const { deletedAt, ...missing } = valid;
    expect(() => ProductoSchema.parse(missing)).toThrow();
  });

  it("rejects deletedAt that is not a date", () => {
    expect(() =>
      ProductoSchema.parse({ ...valid, deletedAt: "nope" }),
    ).toThrow();
  });
});
```

In `packages/shared/src/schemas/__tests__/formula.schema.spec.ts`, add the three fields to **both** the `valid` and `minimal` fixtures (same values: `deletedAt: null, deletedByUserId: null, deletedByUsername: null`, after `createdAt`), and add:

```ts
describe("FormulaSchema deletion fields", () => {
  it("accepts null deletion fields", () => {
    const result = FormulaSchema.parse({
      ...valid,
      deletedAt: null,
      deletedByUserId: null,
      deletedByUsername: null,
    });
    expect(result.deletedAt).toBeNull();
    expect(result.deletedByUserId).toBeNull();
    expect(result.deletedByUsername).toBeNull();
  });

  it("accepts populated deletion fields", () => {
    const result = FormulaSchema.parse({
      ...valid,
      deletedAt: new Date("2026-10-01"),
      deletedByUserId: "user-1",
      deletedByUsername: "admin",
    });
    expect(result.deletedByUsername).toBe("admin");
  });

  it("rejects missing deletion fields", () => {
    const { deletedAt, ...missing } = valid;
    expect(() => FormulaSchema.parse(missing)).toThrow();
  });

  it("rejects deletedAt that is not a date", () => {
    expect(() => FormulaSchema.parse({ ...valid, deletedAt: "nope" })).toThrow();
  });
});
```

Note: `ProductoSchema` must be in scope for the new producto describe (it is already imported at the top of the file).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @vivero/shared test -- "productos.schema|formula.schema"`
Expected: FAIL — new tests fail (`undefined` instead of `null`, no throw on missing/wrong `deletedAt`) because the schemas do not have the fields yet.

- [ ] **Step 3: Add the fields to both schemas**

In `packages/shared/src/schemas/productos.schema.ts`:

```ts
export const ProductoSchema = z.object({
  id: requiredCuid("El producto"),
  nombre: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  deletedByUserId: z.string().nullable(),
  deletedByUsername: z.string().nullable(),
});
```

In `packages/shared/src/schemas/formula.schema.ts`, inside `FormulaSchema` after `createdAt: z.date(),`:

```ts
  deletedAt: z.date().nullable(),
  deletedByUserId: z.string().nullable(),
  deletedByUsername: z.string().nullable(),
```

(`CreateFormulaSchema` / `CreateProductoSchema` / `UpdateProductoSchema` are untouched.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @vivero/shared test -- "productos.schema|formula.schema"`
Expected: PASS (all new + pre-existing tests in both files).

---

### Task 2: BaseRepository — `enrichDeletedBy` helper + `recover` hygiene fix

**Files:**
- Modify: `apps/backend/src/shared/baseModule/base.repository.ts`
- Test (create): `apps/backend/src/shared/baseModule/__tests__/base.repository.spec.ts`

**Interfaces:**
- Produces: exported type `WithDeletedBy<T> = T & { deletedByUsername: string | null }`; `protected enrichDeletedBy<R extends { deletedByUserId: string | null }>(rows: R[]): Promise<(R & { deletedByUsername: string | null })[]>` (methods on `BaseRepository`, callable from every subclass).
- Consumes: `PrismaService` (already injected).

- [ ] **Step 1: Write the failing spec**

Create `apps/backend/src/shared/baseModule/__tests__/base.repository.spec.ts`:

```ts
// apps/backend/src/shared/baseModule/__tests__/base.repository.spec.ts
import { BaseRepository } from '../base.repository';

class TestRepository extends BaseRepository<any> {
  constructor(prisma: any, model: any) {
    super(prisma, model);
  }

  public enrich(rows: any[]) {
    return this.enrichDeletedBy(rows);
  }
}

describe('BaseRepository', () => {
  let model: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
  };
  let prisma: {
    devAccount: { findMany: jest.Mock };
    user: { findMany: jest.Mock };
  };
  let repo: TestRepository;

  beforeEach(() => {
    model = {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };
    prisma = {
      devAccount: {
        findMany: jest.fn().mockResolvedValue([{ userId: 'dev-1' }]),
      },
      user: { findMany: jest.fn().mockResolvedValue([]) },
    };
    repo = new TestRepository(prisma, model);
  });

  afterEach(() => jest.clearAllMocks());

  describe('enrichDeletedBy', () => {
    it('appends null usernames without querying users when no row has a deleter', async () => {
      const rows = [
        { id: 'a', deletedByUserId: null },
        { id: 'b', deletedByUserId: null },
      ];

      const result = await repo.enrich(rows);

      expect(result).toEqual([
        { id: 'a', deletedByUserId: null, deletedByUsername: null },
        { id: 'b', deletedByUserId: null, deletedByUsername: null },
      ]);
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('batch-resolves usernames for rows with a deleter', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', username: 'ana' }]);
      const rows = [
        { id: 'a', deletedByUserId: 'u1' },
        { id: 'b', deletedByUserId: 'u1' },
        { id: 'c', deletedByUserId: null },
      ];

      const result = await repo.enrich(rows);

      expect(result.map((r) => r.deletedByUsername)).toEqual([
        'ana',
        'ana',
        null,
      ]);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['u1'] } },
        select: { id: true, username: true },
      });
    });

    it('yields null when the deleter no longer exists', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      const result = await repo.enrich([{ id: 'a', deletedByUserId: 'ghost' }]);

      expect(result[0].deletedByUsername).toBeNull();
    });
  });

  describe('recover', () => {
    it('clears deletedAt AND deletedByUserId and restores isActive', async () => {
      model.update.mockResolvedValue({ id: 'a' });

      await repo.recover('a', 'dev-1');

      expect(prisma.devAccount.findMany).toHaveBeenCalledWith({
        select: { userId: true },
      });
      expect(model.update).toHaveBeenCalledWith({
        where: { id: 'a' },
        data: {
          deletedAt: null,
          isActive: true,
          updatedAt: expect.any(Date),
          deletedByUserId: null,
        },
      });
    });

    it('throws ForbiddenException for non-dev requesters', async () => {
      await expect(repo.recover('a', 'user-1')).rejects.toThrow(
        'Only dev accounts can recover records',
      );
      expect(model.update).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter backend test -- base.repository`
Expected: FAIL — `repo.enrich is not a function` (helper missing) and the recover `deletedByUserId: null` assertion fails.

- [ ] **Step 3: Implement**

In `apps/backend/src/shared/baseModule/base.repository.ts`, above the class:

```ts
export type WithDeletedBy<T> = T & { deletedByUsername: string | null };
```

Inside the class (after `recover`, before `create` is fine):

```ts
  protected async enrichDeletedBy<
    R extends { deletedByUserId: string | null },
  >(rows: R[]): Promise<WithDeletedBy<R>[]> {
    const ids = [
      ...new Set(
        rows
          .map((r) => r.deletedByUserId)
          .filter((id): id is string => id !== null),
      ),
    ];
    if (ids.length === 0) {
      return rows.map((r) => ({ ...r, deletedByUsername: null }));
    }
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, username: true },
    });
    const byId = new Map(users.map((u) => [u.id, u.username]));
    return rows.map((r) => ({
      ...r,
      deletedByUsername: r.deletedByUserId
        ? (byId.get(r.deletedByUserId) ?? null)
        : null,
    }));
  }
```

Change `recover`'s `data` to also clear the deleter id:

```ts
    return this.model.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
        updatedAt: new Date(),
        deletedByUserId: null,
      },
    });
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter backend test -- base.repository`
Expected: PASS (5 tests).

---

### Task 3: Productos — repo enrichment + service DTO mapping

**Files:**
- Modify: `apps/backend/src/modules/productos/repositories/productos.repository.ts`
- Modify: `apps/backend/src/modules/productos/productos.service.ts`
- Test: `apps/backend/src/modules/productos/__tests__/productos.repository.spec.ts`, `apps/backend/src/modules/productos/__tests__/productos.service.spec.ts`

**Interfaces:**
- Consumes: `WithDeletedBy<T>`, `enrichDeletedBy` (Task 2); `deletedAt`/`deletedByUserId`/`deletedByUsername` fields (Task 1).
- Produces: `ProductosRepository.findAll(requesterId): Promise<WithDeletedBy<Producto>[]>`, `findById(id, requesterId): Promise<WithDeletedBy<Producto> | null>`; service returns DTOs including the three fields on **every** path.

- [ ] **Step 1: Update the repo spec — fixture, prisma mock shape, and new failing tests**

In `apps/backend/src/modules/productos/__tests__/productos.repository.spec.ts`:

1. Add `user` to the `prisma` mock type declaration and to the mock object in `beforeEach`:

```ts
    user: {
      findMany: jest.Mock;
    };
```

```ts
      user: {
        findMany: jest.fn().mockResolvedValue([]),
      },
```

2. Add `deletedByUsername: null,` to `mockProducto` (after `deletedByUserId: null,`).

3. Add to `describe('findAll')`:

```ts
    it('resolves deleter username on deleted rows for dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.producto.findMany.mockResolvedValue([
        {
          ...mockProducto,
          isActive: false,
          deletedAt: new Date('2026-10-01'),
          deletedByUserId: 'u1',
        },
      ]);
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', username: 'admin' }]);

      const result = await repository.findAll('dev-1');

      expect(result[0].deletedByUsername).toBe('admin');
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['u1'] } },
        select: { id: true, username: true },
      });
    });
```

4. Add to `describe('findById')`:

```ts
    it('resolves deleter username for a deleted record found by id', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.producto.findFirst.mockResolvedValue({
        ...mockProducto,
        isActive: false,
        deletedAt: new Date('2026-10-01'),
        deletedByUserId: 'u1',
      });
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', username: 'admin' }]);

      const result = await repository.findById('sust-1', 'dev-1');

      expect(result?.deletedByUsername).toBe('admin');
    });
```

- [ ] **Step 2: Update the service spec — DTO expectations and a failing enrichment passthrough test**

In `apps/backend/src/modules/productos/__tests__/productos.service.spec.ts`:

1. Add the three fields to `mockDto`:

```ts
  const mockDto = {
    id: 'sust-1',
    nombre: 'Turba',
    isActive: true,
    createdAt: new Date('2026-01-15'),
    deletedAt: null,
    deletedByUserId: null,
    deletedByUsername: null,
  };
```

2. Replace the `createProducto` success assertion — the service now returns a DTO (no `updatedAt`, explicit nulls):

```ts
      expect(result).toEqual({
        id: 'sust-1',
        nombre: 'Turba',
        isActive: true,
        createdAt: new Date('2026-01-15'),
        deletedAt: null,
        deletedByUserId: null,
        deletedByUsername: null,
      });
```

3. Replace the first `updateProducto` assertion (`expect(result).toEqual(updated)`) with:

```ts
      expect(result).toEqual({
        id: 'sust-1',
        nombre: 'Perlita',
        isActive: true,
        createdAt: new Date('2026-01-15'),
        deletedAt: null,
        deletedByUserId: null,
        deletedByUsername: null,
      });
```

(The `updated` const fed by `repo.update.mockResolvedValue(updated)` stays as is — the repo still returns a raw row.)

4. Add to `describe('getAllProductos')`:

```ts
    it('passes deletion info through to the DTO', async () => {
      repo.findAll.mockResolvedValue([
        {
          ...mockProducto,
          isActive: false,
          deletedAt: new Date('2026-10-01'),
          deletedByUserId: 'u1',
          deletedByUsername: 'admin',
        },
      ]);

      const result = await service.getAllProductos('dev-1');

      expect(result[0].deletedAt).toEqual(new Date('2026-10-01'));
      expect(result[0].deletedByUserId).toBe('u1');
      expect(result[0].deletedByUsername).toBe('admin');
    });
```

- [ ] **Step 3: Run both spec files to verify they fail**

Run: `pnpm --filter backend test -- productos`
Expected: FAIL — `deletedByUsername` undefined in repo results, service mappings omit the fields, create/update expectations mismatch.

- [ ] **Step 4: Implement the repository overrides**

In `apps/backend/src/modules/productos/repositories/productos.repository.ts`, import the new helpers and add overrides:

```ts
import { BaseRepository, WithDeletedBy } from '../../../shared/baseModule/base.repository';
```

After the existing `update` method:

```ts
  override async findAll(
    requesterId: string,
  ): Promise<WithDeletedBy<Producto>[]> {
    return this.enrichDeletedBy(await super.findAll(requesterId));
  }

  override async findById(
    id: string,
    requesterId: string,
  ): Promise<WithDeletedBy<Producto> | null> {
    const row = await super.findById(id, requesterId);
    if (!row) return null;
    return (await this.enrichDeletedBy([row]))[0];
  }
```

- [ ] **Step 5: Implement the service mapping**

In `apps/backend/src/modules/productos/productos.service.ts`:

```ts
  async getAllProductos(requesterId: string): Promise<ProductoDto[]> {
    const rows = await this.repo.findAll(requesterId);
    return rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      isActive: r.isActive,
      createdAt: r.createdAt,
      deletedAt: r.deletedAt,
      deletedByUserId: r.deletedByUserId,
      deletedByUsername: r.deletedByUsername,
    }));
  }
```

```ts
  async getProductoById(
    requesterId: string,
    id: string,
  ): Promise<ProductoDto | null> {
    const row = await this.repo.findById(id, requesterId);
    if (!row) return null;
    return {
      id: row.id,
      nombre: row.nombre,
      isActive: row.isActive,
      createdAt: row.createdAt,
      deletedAt: row.deletedAt,
      deletedByUserId: row.deletedByUserId,
      deletedByUsername: row.deletedByUsername,
    };
  }
```

```ts
  async createProducto(data: CreateProductoDto) {
    const row = await this.repo.create({
      nombre: data.nombre,
    });
    return {
      id: row.id,
      nombre: row.nombre,
      isActive: row.isActive,
      createdAt: row.createdAt,
      deletedAt: null,
      deletedByUserId: null,
      deletedByUsername: null,
    };
  }
```

```ts
  async updateProducto(
    requesterId: string,
    id: string,
    data: UpdateProductoDto,
  ) {
    if (!data.nombre) {
      throw new BadRequestException('nombre is required');
    }

    const row = await this.repo.update(id, {
      nombre: data.nombre,
    });
    return {
      id: row.id,
      nombre: row.nombre,
      isActive: row.isActive,
      createdAt: row.createdAt,
      deletedAt: null,
      deletedByUserId: null,
      deletedByUsername: null,
    };
  }
```

(`deleteProducto` stays as is.)

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm --filter backend test -- productos`
Expected: PASS (repository + service + controller specs).

---

### Task 4: Fórmula — repo enrichment (`mapRow` + findAll/findById/create)

**Files:**
- Modify: `apps/backend/src/modules/formula/repositories/formula.repository.ts`
- Test: `apps/backend/src/modules/formula/__tests__/formula.repository.spec.ts`

**Interfaces:**
- Consumes: `enrichDeletedBy` (Task 2).
- Produces: `FormulaRecord` (via `FormulaDto`) includes `deletedByUsername`; `findAll`/`findById`/`create` return enriched records. `FormulaService` needs **no** change (it pass-throughs repo records).

- [ ] **Step 1: Update the spec — fixture, prisma mock shape, failing tests**

In `apps/backend/src/modules/formula/__tests__/formula.repository.spec.ts`:

1. Add `user: { findMany: jest.Mock }` to the `prisma` mock type and `user: { findMany: jest.fn().mockResolvedValue([]) }` to the `beforeEach` mock object (same pattern as Task 3).

2. Add `deletedByUsername: null,` to `expectedDto` (after `deletedByUserId: null,`).

3. Add to `describe('findAll')`:

```ts
    it('dev user: resolves deleter username on deleted rows', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.formula.findMany.mockResolvedValue([
        {
          ...mockRecordWithRelations,
          isActive: false,
          deletedAt: new Date('2026-08-02'),
          deletedByUserId: 'u1',
        },
      ]);
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', username: 'admin' }]);

      const result = await repository.findAll('dev-1');

      expect(result[0].deletedByUsername).toBe('admin');
    });
```

4. Add to `describe('findById')`:

```ts
    it('resolves deleter username for a deleted record found by id', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.formula.findUnique.mockResolvedValue({
        ...mockRecordWithRelations,
        isActive: false,
        deletedAt: new Date('2026-08-02'),
        deletedByUserId: 'u1',
      });
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', username: 'admin' }]);

      const result = await repository.findById('formula-1', 'dev-1');

      expect(result?.deletedByUsername).toBe('admin');
    });
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `pnpm --filter backend test -- formula.repository`
Expected: FAIL — `deletedByUsername` undefined (missing from `expectedDto` actuals; enrichment never runs).

- [ ] **Step 3: Implement**

In `apps/backend/src/modules/formula/repositories/formula.repository.ts`:

1. `mapRow` return gains the null field (fresh mapping; enrichment overwrites it):

```ts
    return {
      ...formula,
      producto1Nombre: producto1!.nombre,
      producto2Nombre: producto2?.nombre ?? null,
      producto3Nombre: producto3?.nombre ?? null,
      producto4Nombre: producto4?.nombre ?? null,
      deletedByUsername: null,
    };
```

2. `findAll` tail:

```ts
    return this.enrichDeletedBy(rows.map((r) => this.mapRow(r)));
```

3. `findById` return:

```ts
    return (await this.enrichDeletedBy([this.mapRow(row)]))[0];
```

4. `create` return (final return of the method):

```ts
    return (await this.enrichDeletedBy([this.mapRow(row)]))[0];
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter backend test -- formula.repository`
Expected: PASS (all tests incl. create/findAll/findById).

---

### Task 5: Integration fixtures + GET assertions

**Files:**
- Modify: `apps/backend/test/integration/fixtures/fixtures.ts`
- Modify: `apps/backend/test/integration/productos.integration.spec.ts`
- Modify: `apps/backend/test/integration/formula.integration.spec.ts`

**Interfaces:**
- Consumes: Task 1 field names. Integration tests mock the services, so this only asserts controller pass-through of the new fields.

- [ ] **Step 1: Extend both DTO factories**

In `fixtures.ts`, `mockProductoDto` becomes:

```ts
export const mockProductoDto = () => ({
  id: 'clsusmoc0000000000000000',
  nombre: 'Perlita',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  deletedAt: null,
  deletedByUserId: null,
  deletedByUsername: null,
});
```

`mockFormulaDto` gains, after `createdAt: new Date('2026-01-01'),`:

```ts
  deletedAt: null,
  deletedByUserId: null,
  deletedByUsername: null,
```

- [ ] **Step 2: Extend GET assertions**

In `productos.integration.spec.ts`, inside the `GET /productos` success test after the existing `expect(body[0]).toHaveProperty('isActive', true);`:

```ts
      expect(body[0]).toHaveProperty('deletedAt', null);
      expect(body[0]).toHaveProperty('deletedByUserId', null);
      expect(body[0]).toHaveProperty('deletedByUsername', null);
```

(`expect(...).toHaveProperty(key, value)` accepts arbitrary string keys, so the existing `Array<{ id: string; nombre: string }>` annotation needs no change.)

In `formula.integration.spec.ts`, inside the `GET /formula` success test, extend the existing `expect.objectContaining({...})` with:

```ts
            deletedAt: null,
            deletedByUserId: null,
            deletedByUsername: null,
```

- [ ] **Step 3: Run the integration suite**

Run: `pnpm --filter backend test:integration`
Expected: PASS (all suites).

---

### Task 6: Frontend — view-form deletion lines

**Files:**
- Modify: `apps/frontend/src/features/productos/components/producto-view-form.tsx`
- Modify: `apps/frontend/src/features/formulas/components/formula-view-form.tsx`
- Test: `apps/frontend/src/features/productos/components/__tests__/producto-view-form.test.tsx`, `apps/frontend/src/features/formulas/components/__tests__/formula-view-form.test.tsx`

**Interfaces:**
- Consumes: `deletedAt`/`deletedByUserId`/`deletedByUsername` on `ProductoDto`/`FormulaDto` (Task 1).
- Produces: nothing else consumes this UI.

- [ ] **Step 1: Add failing tests to `producto-view-form.test.tsx`**

```tsx
  const deletedProducto: ProductoDto = {
    ...mockProducto,
    isActive: false,
    deletedAt: new Date("2026-10-01T12:00:00.000Z"),
    deletedByUserId: "u1",
    deletedByUsername: "admin",
  };

  it("should show deletion date and deleter when deleted", () => {
    render(<ProductoViewForm selectedProducto={deletedProducto} />);
    expect(screen.getByText(/de octubre de 2026/)).toBeInTheDocument();
    expect(screen.getByText(/por admin/)).toBeInTheDocument();
  });

  it("should omit the deleter clause when username is null", () => {
    render(
      <ProductoViewForm
        selectedProducto={{ ...deletedProducto, deletedByUsername: null }}
      />,
    );
    expect(screen.getByText(/de octubre de 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/por admin/)).toBeNull();
  });

  it("should not show a deletion line for active records", () => {
    render(<ProductoViewForm selectedProducto={mockProducto} />);
    expect(screen.queryByText(/Eliminado/)).toBeNull();
  });
```

Add the three fields (`deletedAt: null, deletedByUserId: null, deletedByUsername: null`) to the base `mockProducto` fixture as well.

- [ ] **Step 2: Add failing tests to `formula-view-form.test.tsx`**

```tsx
  it("should show deletion date and deleter when deleted", () => {
    render(
      <FormulaViewForm
        selectedFormula={{
          ...mockFormula,
          isActive: false,
          deletedAt: new Date("2026-10-01T12:00:00.000Z"),
          deletedByUserId: "u1",
          deletedByUsername: "admin",
        }}
      />,
    );
    expect(screen.getByText(/de octubre de 2026/)).toBeInTheDocument();
    expect(screen.getByText(/por admin/)).toBeInTheDocument();
  });

  it("should omit the deleter clause when username is null", () => {
    render(
      <FormulaViewForm
        selectedFormula={{
          ...mockFormula,
          deletedAt: new Date("2026-10-01T12:00:00.000Z"),
          deletedByUserId: "u1",
          deletedByUsername: null,
        }}
      />,
    );
    expect(screen.getByText(/de octubre de 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/por admin/)).toBeNull();
  });

  it("should not show a deletion line for active records", () => {
    render(<FormulaViewForm selectedFormula={mockFormula} />);
    expect(screen.queryByText(/Eliminado/)).toBeNull();
  });
```

(`mockFormula` is defined at module top level; the new `it` blocks go inside `describe("FormulaViewForm")` — the spread references the module-scope const, fine.)

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm --filter frontend test -- "producto-view-form|formula-view-form"`
Expected: FAIL — the three "show deletion" tests per file fail (no deletion line rendered).

- [ ] **Step 4: Implement `producto-view-form.tsx`**

1. Extend the lucide import:

```tsx
import { Package, Calendar, AlertTriangle, Trash2 } from "lucide-react";
```

2. Inside the details card grid, after the "Fecha de Creación" `InfoRow`:

```tsx
            {selectedProducto.deletedAt && (
              <InfoRow
                icon={Trash2}
                label="Eliminado"
                value={`el ${new Date(selectedProducto.deletedAt).toLocaleDateString(
                  "es-AR",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}${selectedProducto.deletedByUsername ? ` por ${selectedProducto.deletedByUsername}` : ""}`}
              />
            )}
```

- [ ] **Step 5: Implement `formula-view-form.tsx`**

1. Extend the lucide import:

```tsx
import { Blend, Calendar, AlertTriangle, Trash2 } from "lucide-react";
```

2. Inside `CardContent`, after the existing "Creado" row:

```tsx
          {selectedFormula.deletedAt && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
              <Trash2 className="h-3.5 w-3.5 text-destructive/60" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Eliminado:
              </span>
              <span className="text-xs font-bold text-foreground">
                {`el ${new Date(selectedFormula.deletedAt).toLocaleDateString(
                  "es-AR",
                  { year: "numeric", month: "long", day: "numeric" },
                )}${selectedFormula.deletedByUsername ? ` por ${selectedFormula.deletedByUsername}` : ""}`}
              </span>
            </div>
          )}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm --filter frontend test -- "producto-view-form|formula-view-form"`
Expected: PASS (existing + new tests in both files).

---

### Task 7: Full verification gates

**Files:** none (verification only).

- [ ] **Step 1: Run the verification order**

```bash
pnpm lint && pnpm type-check && pnpm test
```
Expected: 0 errors; type-check 3/3 packages; tests green (shared ~218+, backend ~310+, frontend ~300+, counts grow with new tests).

- [ ] **Step 2: Run integration tests**

```bash
pnpm --filter backend test:integration
```
Expected: PASS (110+ tests).

- [ ] **Step 3: Report results**

Summarize gate output; stop. **Do not commit** — wait for the user to invoke the commit workflow.
