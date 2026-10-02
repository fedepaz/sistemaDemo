# Formula & Producto Full CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add soft-delete endpoints for `formula` and `productos`, wire full frontend CRUD (formula delete; producto edit + delete), and align formula permissions to the `formulas` entity.

**Architecture:** Backend: NestJS `DELETE` handlers on the existing formula/productos modules delegating to the inherited `BaseRepository.softDelete(id, requesterId)` with a `findById` pre-check for 404s; `GET /formula` moves from `programacion_siembra:create` to `formulas:read`. Frontend: mirror `features/users` — service methods, TanStack Query mutations with `query-invalidation-map` entries, DataTable `onEdit`/`onDelete` wiring (built-in `DeleteDialog`), and a new `ProductoEditForm` SlideOver.

**Tech Stack:** NestJS 11 + Prisma soft delete; Jest (ts-jest) + supertest; Next.js 16, React Hook Form + zodResolver, TanStack Query, shadcn/ui DataTable.

## Global Constraints

- Source of truth: `docs/superpowers/specs/2026-10-01-formula-producto-full-crud-design.md`. Non-goals are binding: **no recover endpoint, no formula update anywhere, no reference checks, no `MANAGED_ENTITIES` edits, zero `packages/shared` changes**.
- TDD: every implementation step is preceded by a failing run; the expected failure is stated per step.
- Permission metadata verbatim: `GET /formula` → `{ tableName: 'formulas', action: 'read', scope: 'ALL' }`; `DELETE /formula/:id` → `formulas:delete`; `DELETE /productos/:id` → `productos:delete`.
- Integration tests replace guards with `MockPermissionsGuard` (always `true`) — permission keys are proven only by the unit metadata assertions in Tasks 1–2.
- Conventional Commits, commitlint enforced. Never run `prisma migrate*`. Never touch prod literals (`'Sustrato Genérico'`, cuids `c00000000000000000000001`/`c00000000000000000000002`).
- Frontend: design tokens only (no arbitrary values). Never surface `passwordHash`.
- Gates from repo root: `pnpm lint && pnpm type-check && pnpm test`; integration: `pnpm --filter backend test:integration`.
- Single sequential branch `feat/finish-mezcla`; one commit per task at the end of each task.

## File Structure

| Action | File | Responsibility |
|---|---|---|
| Modify | `apps/backend/src/modules/formula/formula.service.ts` | `deleteFormula` (findById pre-check → 404, then softDelete) |
| Modify | `apps/backend/src/modules/formula/formula.controller.ts` | GET permission key fix + `DELETE /formula/:id` |
| Modify | `apps/backend/src/modules/formula/__tests__/formula.{service,controller}.spec.ts` | unit + metadata tests |
| Modify | `apps/backend/src/modules/productos/productos.{service,controller}.ts` | `deleteProducto` + `DELETE /productos/:id` |
| Modify | `apps/backend/src/modules/productos/__tests__/productos.{service,controller}.spec.ts` | unit + metadata tests |
| Modify | `apps/backend/test/integration/helpers/mock-factories.ts` | `deleteFormula` / `deleteProducto` mocks |
| Modify | `apps/backend/test/integration/{formula,productos}.integration.spec.ts` | DELETE happy/404 cases |
| Modify | `apps/frontend/src/features/formulas/api/formulaService.ts` | `remove(id)` |
| Modify | `apps/frontend/src/features/formulas/hooks/useFormulas.ts` | `useDeleteFormula` |
| Modify | `apps/frontend/src/features/formulas/components/formula-data-table.tsx` | `tableName="formulas"`, `onDelete` wiring |
| Modify | `apps/frontend/src/features/formulas/__tests__/formulaService.test.ts` | `remove` test |
| Modify | `apps/frontend/src/features/formulas/components/__tests__/formula-data-table.test.tsx` | delete wiring test |
| Modify | `apps/frontend/src/features/productos/api/productoService.ts` | `update(id, data)`, `remove(id)` |
| Modify | `apps/frontend/src/features/productos/hooks/useProductos.ts` | `useUpdateProducto`, `useDeleteProducto` |
| Create | `apps/frontend/src/features/productos/components/producto-edit-form.tsx` | edit form (UpdateProductoDto) |
| Modify | `apps/frontend/src/features/productos/components/producto-data-table.tsx` | `mode: "edit"`, edit/delete wiring |
| Modify | `apps/frontend/src/features/productos/__tests__/productoService.test.ts` | update/remove tests |
| Modify | `apps/frontend/src/features/productos/components/__tests__/producto-data-table.test.tsx` | edit/delete wiring tests |
| Modify | `apps/frontend/src/lib/query-invalidation-map.ts` | `deleteFormula`, `updateProducto`, `deleteProducto` entries |

---

### Task 1: Backend formula — DELETE endpoint + GET permission fix

**Files:**
- Modify: `apps/backend/src/modules/formula/formula.service.ts`
- Modify: `apps/backend/src/modules/formula/formula.controller.ts`
- Modify: `apps/backend/src/modules/formula/__tests__/formula.service.spec.ts`
- Modify: `apps/backend/src/modules/formula/__tests__/formula.controller.spec.ts`
- Modify: `apps/backend/test/integration/helpers/mock-factories.ts:107-113`
- Modify: `apps/backend/test/integration/formula.integration.spec.ts` (append before final `});`)

**Interfaces:**
- Consumes: `BaseRepository.softDelete(id: string, deletedByUserId: string): Promise<T>` (`apps/backend/src/shared/baseModule/base.repository.ts:74`); `FormulaRepository.findById(id, requesterId)` (inherited); `REQUIRE_PERMISSION_KEY` from `apps/backend/src/modules/permissions/decorators/require-permission.decorator`.
- Produces: `FormulaService.deleteFormula(id: string, requesterId: string)` (no return annotation — inherited `softDelete` returns the raw Prisma `Formula` row, which lacks the `producto*Nombre` fields `FormulaDto` requires; same shape as the `users` DELETE response, and the Task 3 hook ignores the body). Soft-deletes and returns the row, throws `NotFoundException('Formula not found')` when `findById` returns `null`; HTTP `DELETE /formula/:id` → `200` + row or `404`; integration mock `createFormulaMock()` gains `deleteFormula: jest.Mock`.

- [ ] **Step 1: Write the failing service tests**

In `formula.service.spec.ts`, add `softDelete` to the repo mock type and object:

```ts
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    softDelete: jest.Mock;
  };
```

```ts
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      softDelete: jest.fn(),
    };
```

Append this describe inside `describe('FormulaService', ...)` (after the `createFormula` describe):

```ts
  describe('deleteFormula', () => {
    it('delegates to repository softDelete', async () => {
      repo.findById.mockResolvedValue(mockFormula);
      repo.softDelete.mockResolvedValue(mockFormula);

      const result = await service.deleteFormula('formula-1', 'user-1');

      expect(result).toEqual(mockFormula);
      expect(repo.findById).toHaveBeenCalledWith('formula-1', 'user-1');
      expect(repo.softDelete).toHaveBeenCalledWith('formula-1', 'user-1');
    });

    it('throws NotFoundException when formula not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.deleteFormula('nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
      expect(repo.softDelete).not.toHaveBeenCalled();
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter backend test -- formula.service.spec`
Expected: FAIL — TS2339 `'deleteFormula' does not exist on type 'FormulaService'` (ts-jest compile error).

- [ ] **Step 3: Write minimal implementation**

In `formula.service.ts`, append after `createFormula`:

```ts
  async deleteFormula(id: string, requesterId: string): Promise<FormulaDto> {
    const formula = await this.repo.findById(id, requesterId);
    if (!formula) throw new NotFoundException('Formula not found');
    return this.repo.softDelete(id, requesterId);
  }
```

(`NotFoundException` is already imported.)

- [ ] **Step 4: Run service spec to verify it passes**

Run: `pnpm --filter backend test -- formula.service.spec`
Expected: PASS (all FormulaService tests).

- [ ] **Step 5: Write the failing controller tests**

In `formula.controller.spec.ts`:

1. Add import:

```ts
import { REQUIRE_PERMISSION_KEY } from '../../permissions/decorators/require-permission.decorator';
```

2. Add `deleteFormula: jest.Mock;` to the service mock type and `deleteFormula: jest.fn(),` to the `beforeEach` object (alongside `createFormula`).

3. Append these describes inside `describe('FormulaController', ...)`:

```ts
  describe('deleteFormula', () => {
    it('delegates to service with id and user id', async () => {
      service.deleteFormula.mockResolvedValue(mockDto);

      const result = await controller.deleteFormula(mockUser, 'formula-1');

      expect(result).toEqual(mockDto);
      expect(service.deleteFormula).toHaveBeenCalledWith('formula-1', 'user-1');
    });
  });

  describe('permission metadata', () => {
    it('GET /formula requires formulas:read', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        FormulaController.prototype.getAllFormula,
      );

      expect(meta).toEqual({
        tableName: 'formulas',
        action: 'read',
        scope: 'ALL',
      });
    });

    it('DELETE /formula/:id requires formulas:delete', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        FormulaController.prototype.deleteFormula,
      );

      expect(meta).toEqual({
        tableName: 'formulas',
        action: 'delete',
        scope: 'ALL',
      });
    });
  });
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm --filter backend test -- formula.controller.spec`
Expected: FAIL — TS2339 on `controller.deleteFormula` / `prototype.deleteFormula`, plus the `GET` metadata test failing with `programacion_siembra`/`create` instead of `formulas`/`read`.

- [ ] **Step 7: Write minimal implementation**

In `formula.controller.ts`:

1. Update the `@nestjs/common` import:

```ts
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
```

2. Replace the `GET /formula` decorator block:

```ts
  @Get()
  @RequirePermission({
    tableName: 'formulas',
    action: 'read',
    scope: 'ALL',
  })
  async getAllFormula(@CurrentUser() user: AuthUser): Promise<FormulaDto[]> {
    return this.service.getAllFormula(user.id);
  }
```

3. Append after `getFormula` (end of class):

```ts
  @Delete(':id')
  @RequirePermission({ tableName: 'formulas', action: 'delete', scope: 'ALL' })
  async deleteFormula(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.service.deleteFormula(id, user.id);
  }
```

- [ ] **Step 8: Run both formula unit specs**

Run: `pnpm --filter backend test -- formula`
Expected: PASS — all FormulaService + FormulaController tests green.

- [ ] **Step 9: Add integration mock + DELETE tests**

In `test/integration/helpers/mock-factories.ts`, update the factory:

```ts
export function createFormulaMock() {
  return {
    getAllFormula: jest.fn(),
    getFormulaById: jest.fn(),
    createFormula: jest.fn(),
    deleteFormula: jest.fn(),
  };
}
```

In `test/integration/formula.integration.spec.ts`, append this describe after the `POST /formula` describe's closing `  });` and before the file's final `});` (`NotFoundException` is already imported at line 1):

```ts
  describe('DELETE /formula/:id', () => {
    it('returns 200 + soft-deleted fórmula', async () => {
      formulaMock.deleteFormula.mockResolvedValue(mockFormulaDto());

      await request(app.getHttpServer())
        .delete('/formula/clformulamoc000000000000')
        .expect(200);

      expect(formulaMock.deleteFormula).toHaveBeenCalledWith(
        'clformulamoc000000000000',
        expect.any(String),
      );
    });

    it('returns 404 when fórmula is not found', async () => {
      formulaMock.deleteFormula.mockRejectedValue(
        new NotFoundException('Formula not found'),
      );

      await request(app.getHttpServer())
        .delete('/formula/missing-formula')
        .expect(404);
    });
  });
```

- [ ] **Step 10: Run formula integration tests**

Run: `pnpm --filter backend test:integration -- formula`
Expected: PASS — existing GET/POST suites plus the two new DELETE cases.

- [ ] **Step 11: Commit**

```bash
git add apps/backend/src/modules/formula apps/backend/test/integration/helpers/mock-factories.ts apps/backend/test/integration/formula.integration.spec.ts
git commit -m "feat(formula): add delete endpoint and align list read permission"
```

---

### Task 2: Backend productos — DELETE endpoint

**Files:**
- Modify: `apps/backend/src/modules/productos/productos.service.ts`
- Modify: `apps/backend/src/modules/productos/productos.controller.ts`
- Modify: `apps/backend/src/modules/productos/__tests__/productos.service.spec.ts`
- Modify: `apps/backend/src/modules/productos/__tests__/productos.controller.spec.ts`
- Modify: `apps/backend/test/integration/helpers/mock-factories.ts:124-131`
- Modify: `apps/backend/test/integration/productos.integration.spec.ts`

**Interfaces:**
- Consumes: inherited `BaseRepository.softDelete`; `ProductosRepository.findById(id, requesterId)`; `REQUIRE_PERMISSION_KEY`.
- Produces: `ProductosService.deleteProducto(requesterId: string, id: string)` — 404 via `NotFoundException('Producto not found')` when missing, otherwise returns the soft-deleted row; HTTP `DELETE /productos/:id` → `200` or `404`; `createProductosMock()` gains `deleteProducto: jest.Mock`. Existing PATCH behavior untouched.

- [ ] **Step 1: Write the failing service tests**

In `productos.service.spec.ts`:

1. Add import:

```ts
import { NotFoundException } from '@nestjs/common';
```

2. Add `softDelete: jest.Mock;` to the repo mock type and `softDelete: jest.fn(),` to the `beforeEach` object.

3. Append inside `describe('ProductosService', ...)`:

```ts
  describe('deleteProducto', () => {
    it('soft-deletes when found', async () => {
      repo.findById.mockResolvedValue(mockProducto);
      repo.softDelete.mockResolvedValue(mockProducto);

      const result = await service.deleteProducto('user-1', 'sust-1');

      expect(result).toEqual(mockProducto);
      expect(repo.findById).toHaveBeenCalledWith('sust-1', 'user-1');
      expect(repo.softDelete).toHaveBeenCalledWith('sust-1', 'user-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.deleteProducto('user-1', 'missing'),
      ).rejects.toThrow(NotFoundException);
      expect(repo.softDelete).not.toHaveBeenCalled();
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter backend test -- productos.service.spec`
Expected: FAIL — TS2339 `'deleteProducto' does not exist on type 'ProductosService'`.

- [ ] **Step 3: Write minimal implementation**

In `productos.service.ts`:

1. Update the Nest import:

```ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
```

2. Append after `updateProducto`:

```ts
  async deleteProducto(requesterId: string, id: string) {
    const row = await this.repo.findById(id, requesterId);
    if (!row) throw new NotFoundException('Producto not found');
    return this.repo.softDelete(id, requesterId);
  }
```

- [ ] **Step 4: Run service spec to verify it passes**

Run: `pnpm --filter backend test -- productos.service.spec`
Expected: PASS.

- [ ] **Step 5: Write the failing controller tests**

In `productos.controller.spec.ts`:

1. Add import:

```ts
import { REQUIRE_PERMISSION_KEY } from '../../permissions/decorators/require-permission.decorator';
```

2. Add `deleteProducto: jest.Mock;` to the service mock type and `deleteProducto: jest.fn(),` to the `beforeEach` object.

3. Append inside `describe('ProductosController', ...)`:

```ts
  describe('deleteProducto', () => {
    it('delegates to service with user id and id', async () => {
      service.deleteProducto.mockResolvedValue(mockDto);

      const result = await controller.deleteProducto(mockUser, 'sust-1');

      expect(result).toEqual(mockDto);
      expect(service.deleteProducto).toHaveBeenCalledWith('user-1', 'sust-1');
    });
  });

  describe('permission metadata', () => {
    it('DELETE /productos/:id requires productos:delete', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        ProductosController.prototype.deleteProducto,
      );

      expect(meta).toEqual({
        tableName: 'productos',
        action: 'delete',
        scope: 'ALL',
      });
    });
  });
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm --filter backend test -- productos.controller.spec`
Expected: FAIL — TS2339 on `controller.deleteProducto` / `prototype.deleteProducto`.

- [ ] **Step 7: Write minimal implementation**

In `productos.controller.ts`:

1. Update the `@nestjs/common` import:

```ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
```

2. Append after `updateProducto` (end of class):

```ts
  @Delete(':id')
  @RequirePermission({ tableName: 'productos', action: 'delete', scope: 'ALL' })
  async deleteProducto(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.service.deleteProducto(user.id, id);
  }
```

- [ ] **Step 8: Run both productos unit specs**

Run: `pnpm --filter backend test -- productos`
Expected: PASS — service + controller + repository suites green.

- [ ] **Step 9: Add integration mock + DELETE tests**

In `test/integration/helpers/mock-factories.ts`, update the factory:

```ts
export function createProductosMock() {
  return {
    getAllProductos: jest.fn(),
    getProductoById: jest.fn(),
    createProducto: jest.fn(),
    updateProducto: jest.fn(),
    deleteProducto: jest.fn(),
  };
}
```

In `test/integration/productos.integration.spec.ts`:

1. Update line 2's import:

```ts
import { INestApplication, NotFoundException } from '@nestjs/common';
```

2. Append this describe after the `PATCH /productos/:id` describe's closing `  });` and before the file's final `});`:

```ts
  describe('DELETE /productos/:id', () => {
    it('returns 200 + soft-deleted producto', async () => {
      productosMock.deleteProducto.mockResolvedValue(mockProductoDto());

      await request(app.getHttpServer())
        .delete('/productos/clsusmoc0000000000000000')
        .expect(200);

      expect(productosMock.deleteProducto).toHaveBeenCalledWith(
        expect.any(String),
        'clsusmoc0000000000000000',
      );
    });

    it('returns 404 when producto is not found', async () => {
      productosMock.deleteProducto.mockRejectedValue(
        new NotFoundException('Producto not found'),
      );

      await request(app.getHttpServer())
        .delete('/productos/missing-producto')
        .expect(404);
    });
  });
```

- [ ] **Step 10: Run productos integration tests**

Run: `pnpm --filter backend test:integration -- productos`
Expected: PASS — existing GET/POST/PATCH suites plus the two new DELETE cases.

- [ ] **Step 11: Commit**

```bash
git add apps/backend/src/modules/productos apps/backend/test/integration/helpers/mock-factories.ts apps/backend/test/integration/productos.integration.spec.ts
git commit -m "feat(productos): add soft delete endpoint"
```

---

### Task 3: Frontend formulas — delete action

**Files:**
- Modify: `apps/frontend/src/features/formulas/api/formulaService.ts`
- Modify: `apps/frontend/src/features/formulas/__tests__/formulaService.test.ts`
- Modify: `apps/frontend/src/features/formulas/hooks/useFormulas.ts`
- Modify: `apps/frontend/src/lib/query-invalidation-map.ts` (after the `createFormula` entry, ~line 110)
- Modify: `apps/frontend/src/features/formulas/components/formula-data-table.tsx`
- Modify: `apps/frontend/src/features/formulas/components/__tests__/formula-data-table.test.tsx`

**Interfaces:**
- Consumes: backend `DELETE /formula/:id` (Task 1); `invalidateQueries(queryClient, key)` from `apps/frontend/src/lib/query-invalidation-map.ts`; `formulaQueryKeys.all()`.
- Produces: `formulaService.remove(id: string): Promise<void>`; `useDeleteFormula()` → `useMutation<void, Error, string>`; invalidation-map entry `deleteFormula`; `FormulaDataTable` passes `onDelete` to `DataTable` and uses `tableName="formulas"` (so row buttons gate on `formulas:update/delete`).

- [ ] **Step 1: Write the failing service test**

In `formulaService.test.ts`, append inside `describe('formulaService', ...)`:

```ts
  it("remove calls DELETE /formula/:id", async () => {
    mockClientFetch.mockResolvedValue(undefined);
    await formulaService.remove("formula-1");
    expect(mockClientFetch).toHaveBeenCalledWith("formula/formula-1", {
      method: "DELETE",
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test -- formulaService`
Expected: FAIL — `TypeError: formulaService.remove is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `formulaService.ts`, append inside the exported object:

```ts
  remove: (id: string) => {
    return clientFetch<void>(`formula/${id}`, { method: "DELETE" });
  },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test -- formulaService`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing data-table test**

In `formula-data-table.test.tsx`:

1. Add near the top (after imports, before the `jest.mock` calls is fine — the `mock` prefix is required for the hoisted-factory rule):

```tsx
const mockDeleteFormula = jest.fn().mockResolvedValue(undefined);
```

2. Replace the `DataTable` mock so it also exposes `onDelete`:

```tsx
jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
    onDelete,
  }: {
    title: string;
    onView: (row: FormulaDto) => void;
    onDelete: (row: FormulaDto) => void;
    onCreate: () => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockFormulas[0])}>View Row</button>
      <button onClick={() => onDelete(mockFormulas[0])}>Delete Row</button>
    </div>
  ),
  SlideOverForm: ({
    open,
    children,
  }: {
    open: boolean;
    children: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="slide-over-form">{children}</div>
    ) : null,
}));
```

3. Replace the `useFormulas` mock factory:

```tsx
jest.mock("@/features/formulas/hooks/useFormulas", () => ({
  useFormulas: () => ({
    data: mockFormulas,
  }),
  useCreateFormula: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
  useDeleteFormula: () => ({
    mutateAsync: mockDeleteFormula,
  }),
}));
```

4. Append inside `describe('FormulaDataTable', ...)`:

```tsx
  it("deletes formula when delete is triggered", async () => {
    mockDeleteFormula.mockClear();
    render(<FormulaDataTable />);

    await act(async () => {
      screen.getByText("Delete Row").click();
    });

    expect(mockDeleteFormula).toHaveBeenCalledWith("1");
  });
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm --filter frontend test -- formula-data-table`
Expected: FAIL — `TypeError: onDelete is not a function` (the component does not pass `onDelete` yet).

- [ ] **Step 7: Write minimal implementation**

1. In `apps/frontend/src/lib/query-invalidation-map.ts`, after the `createFormula` entry:

```ts
  deleteFormula: {
    queries: () => [formulaQueryKeys.all()],
  },
```

2. In `useFormulas.ts`, append:

```ts
export const useDeleteFormula = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: formulaService.remove,
    onSuccess: () => {
      toast.success("Fórmula eliminada exitosamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "deleteFormula");
    },
  });
};
```

3. In `formula-data-table.tsx`:

Import the new hook:

```tsx
import {
  useCreateFormula,
  useDeleteFormula,
  useFormulas,
} from "../hooks/useFormulas";
```

Inside the component, after the `createFormula` mutation:

```tsx
  const { mutateAsync: deleteFormula } = useDeleteFormula();

  const handleDelete = useCallback(async (row: FormulaDto) => {
    await deleteFormula(row.id);
  }, [deleteFormula]);
```

Change `tableName="programacion_siembra"` to:

```tsx
        tableName="formulas"
```

Add to the `DataTable` props (next to `onView`):

```tsx
        onDelete={handleDelete}
```

- [ ] **Step 8: Run formula frontend tests**

Run: `pnpm --filter frontend test -- formulas`
Expected: PASS — service, data-table, and view-form suites green.

- [ ] **Step 9: Commit**

```bash
git add apps/frontend/src/features/formulas apps/frontend/src/lib/query-invalidation-map.ts
git commit -m "feat(frontend): add formula delete action"
```

---

### Task 4: Frontend productos — edit and delete actions

**Files:**
- Modify: `apps/frontend/src/features/productos/api/productoService.ts`
- Modify: `apps/frontend/src/features/productos/__tests__/productoService.test.ts`
- Modify: `apps/frontend/src/features/productos/hooks/useProductos.ts`
- Modify: `apps/frontend/src/lib/query-invalidation-map.ts` (after the `createProducto` entry, ~line 105)
- Create: `apps/frontend/src/features/productos/components/producto-edit-form.tsx`
- Modify: `apps/frontend/src/features/productos/components/producto-data-table.tsx`
- Modify: `apps/frontend/src/features/productos/components/__tests__/producto-data-table.test.tsx`

**Interfaces:**
- Consumes: backend `PATCH /productos/:id` + `DELETE /productos/:id` (Task 2); `UpdateProductoDto`/`UpdateProductoSchema` from `@vivero/shared` (already exported); `invalidateQueries` map; `ProductoViewForm`/`ProductoCreateForm` as siblings.
- Produces: `productoService.update(id: string, data: UpdateProductoDto): Promise<ProductoDto>` and `productoService.remove(id: string): Promise<void>`; hooks `useUpdateProducto()` → `useMutation<ProductoDto, Error, { id: string; data: UpdateProductoDto }>` and `useDeleteProducto()` → `useMutation<void, Error, string>`; invalidation entries `updateProducto`/`deleteProducto`; component `ProductoEditForm({ onSubmit, onCancel, formId, form })`; `ProductoDataTable` supports `mode: "view" | "create" | "edit"` and passes `onEdit`/`onDelete` to `DataTable`.

- [ ] **Step 1: Write the failing service tests**

In `productoService.test.ts`, append inside `describe('productoService', ...)`:

```ts
  it("update calls PATCH /productos/:id with body", async () => {
    const data = { nombre: "Perlita" };
    mockClientFetch.mockResolvedValue({ id: "1", ...data, createdAt: "" });
    await productoService.update("1", data);
    expect(mockClientFetch).toHaveBeenCalledWith("productos/1", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  });

  it("remove calls DELETE /productos/:id", async () => {
    mockClientFetch.mockResolvedValue(undefined);
    await productoService.remove("1");
    expect(mockClientFetch).toHaveBeenCalledWith("productos/1", {
      method: "DELETE",
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test -- productoService`
Expected: FAIL — `TypeError: productoService.update is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `productoService.ts`:

1. Update the import:

```ts
import { CreateProductoDto, ProductoDto, UpdateProductoDto } from "@vivero/shared";
```

2. Append inside the exported object:

```ts
  update: (id: string, data: UpdateProductoDto) => {
    return clientFetch<ProductoDto>(`productos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  remove: (id: string) => {
    return clientFetch<void>(`productos/${id}`, { method: "DELETE" });
  },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test -- productoService`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the failing data-table tests**

In `producto-data-table.test.tsx`:

1. Add the file-level lint disable (mirrors `user-data-table.test.tsx`) as line 1 and declare spies after the imports:

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
```

```tsx
const mockUpdateProducto = jest.fn().mockResolvedValue(undefined);
const mockDeleteProducto = jest.fn().mockResolvedValue(undefined);
let capturedProps: any = null;
```

2. Replace the `DataTable`/`SlideOverForm` mock:

```tsx
jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
    onEdit,
    onDelete,
  }: {
    title: string;
    onView: (row: ProductoDto) => void;
    onEdit: (row: ProductoDto) => void;
    onDelete: (row: ProductoDto) => void;
    onCreate: () => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockProductos[0])}>View Row</button>
      <button onClick={() => onEdit(mockProductos[0])}>Edit Row</button>
      <button onClick={() => onDelete(mockProductos[0])}>Delete Row</button>
    </div>
  ),
  SlideOverForm: (props: any) => {
    capturedProps = props;
    return props.open ? (
      <div data-testid="slide-over-form">{props.children}</div>
    ) : null;
  },
}));
```

3. Replace the `useProductos` hook mock factory:

```tsx
jest.mock("@/features/productos/hooks/useProductos", () => ({
  useProductos: () => ({
    data: mockProductos,
  }),
  useCreateProducto: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
  useUpdateProducto: () => ({
    mutateAsync: mockUpdateProducto,
    isPending: false,
  }),
  useDeleteProducto: () => ({
    mutateAsync: mockDeleteProducto,
  }),
}));
```

4. Inside `describe('ProductoDataTable', ...)`, add a `beforeEach` to reset the capture:

```tsx
  beforeEach(() => {
    capturedProps = null;
  });
```

5. Append two tests:

```tsx
  it("deletes producto when delete is triggered", async () => {
    mockDeleteProducto.mockClear();
    render(<ProductoDataTable />);

    await act(async () => {
      screen.getByText("Delete Row").click();
    });

    expect(mockDeleteProducto).toHaveBeenCalledWith("1");
  });

  it("opens slide-over in edit mode with nombre summaryFields", async () => {
    render(<ProductoDataTable />);

    await act(async () => {
      screen.getByText("Edit Row").click();
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.formId).toBe("edit");
    expect(capturedProps.confirm.summaryFields).toEqual(["nombre"]);
  });
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm --filter frontend test -- producto-data-table`
Expected: FAIL — `TypeError: onEdit is not a function` / `onDelete is not a function` (component wires neither yet).

- [ ] **Step 7: Write minimal implementation**

1. In `apps/frontend/src/lib/query-invalidation-map.ts`, after the `createProducto` entry:

```ts
  updateProducto: {
    queries: () => [productoQueryKeys.all()],
  },
  deleteProducto: {
    queries: () => [productoQueryKeys.all()],
  },
```

2. In `useProductos.ts`, update the shared import and append both hooks:

```ts
import { CreateProductoDto, ProductoDto, UpdateProductoDto } from "@vivero/shared";
```

```ts
export const useUpdateProducto = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ProductoDto,
    Error,
    { id: string; data: UpdateProductoDto }
  >({
    mutationFn: ({ id, data }) => productoService.update(id, data),
    onSuccess: (data) => {
      toast.success(`Producto ${data.nombre} actualizado exitosamente`, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "updateProducto");
    },
  });
};

export const useDeleteProducto = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: productoService.remove,
    onSuccess: () => {
      toast.success("Producto eliminado exitosamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "deleteProducto");
    },
  });
};
```

3. Create `producto-edit-form.tsx`:

```tsx
// apps/frontend/src/features/productos/components/producto-edit-form.tsx
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UpdateProductoDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";

interface FormProps {
  onSubmit: (data: UpdateProductoDto) => Promise<void>;
  onCancel: () => void;
  formId: string;
  form: UseFormReturn<UpdateProductoDto>;
}

export function ProductoEditForm({ onSubmit, formId, form }: FormProps) {
  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4"
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-foreground">
                Nombre
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ej: Producto Premium"
                  autoFocus
                  required
                />
              </FormControl>
              <FormDescription className="text-[9px] md:text-[11px] font-medium leading-tight">
                Nombre descriptivo del producto. Ej: &quot;Producto Turba&quot;.
              </FormDescription>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

4. Replace `producto-data-table.tsx` with:

```tsx
// apps/frontend/src/features/productos/components/producto-data-table.tsx
"use client";

import { useState, useCallback } from "react";
import {
  useCreateProducto,
  useDeleteProducto,
  useProductos,
  useUpdateProducto,
} from "../hooks/useProductos";
import {
  CreateProductoDto,
  CreateProductoSchema,
  ProductoDto,
  UpdateProductoDto,
  UpdateProductoSchema,
  fieldLabels,
} from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { productoColumns, productoExportColumns } from "./columns";
import { ProductoCreateForm } from "./producto-create-form";
import { ProductoEditForm } from "./producto-edit-form";
import { ProductoViewForm } from "./producto-view-form";

export function ProductoDataTable() {
  const { data: productos = [] } = useProductos();
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<ProductoDto | null>(
    null,
  );
  const [mode, setMode] = useState<"view" | "create" | "edit">("create");

  const { mutateAsync: createProducto, isPending: isCreatingProducto } =
    useCreateProducto();
  const { mutateAsync: updateProducto, isPending: isUpdatingProducto } =
    useUpdateProducto();
  const { mutateAsync: deleteProducto } = useDeleteProducto();

  const formCreateProducto = useForm<CreateProductoDto>({
    resolver: zodResolver(CreateProductoSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const formEditProducto = useForm<UpdateProductoDto>({
    resolver: zodResolver(UpdateProductoSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const handleNewProducto = useCallback(() => {
    setSelectedProducto(null);
    setMode("create");
    formCreateProducto.reset({ nombre: "" });
    setSlideOverOpen(true);
  }, [formCreateProducto]);

  const handleView = useCallback((row: ProductoDto) => {
    setSelectedProducto(row);
    setMode("view");
    setSlideOverOpen(true);
  }, []);

  const handleEdit = useCallback(
    (row: ProductoDto) => {
      setSelectedProducto(row);
      setMode("edit");
      formEditProducto.reset({ nombre: row.nombre });
      setSlideOverOpen(true);
    },
    [formEditProducto],
  );

  const handleDelete = useCallback(
    async (row: ProductoDto) => {
      await deleteProducto(row.id);
    },
    [deleteProducto],
  );

  const handleCreate = async (formData: CreateProductoDto) => {
    try {
      await createProducto(formData);
    } catch {}

    if (!isCreatingProducto) setSlideOverOpen(false);
  };

  const handleUpdate = async (formData: UpdateProductoDto) => {
    if (selectedProducto) {
      try {
        await updateProducto({ id: selectedProducto.id, data: formData });
      } catch {}

      if (!isUpdatingProducto) setSlideOverOpen(false);
    }
  };

  return (
    <>
      <DataTable
        columns={productoColumns}
        exportColumns={productoExportColumns}
        data={productos}
        title="Productos"
        description="Gestión de productos del sistema"
        tableName="productos"
        totalCount={productos.length}
        onCreate={handleNewProducto}
        createLabel="Nuevo Producto"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        columnLabels={fieldLabels.Producto}
      />
      {slideOverOpen && (
        <SlideOverForm
          formId={
            mode === "create" ? "create" : mode === "edit" ? "edit" : "view"
          }
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title={
            mode === "create"
              ? "Crear producto"
              : mode === "edit"
                ? `Editar producto: ${selectedProducto?.nombre}`
                : `Producto: ${selectedProducto?.nombre}`
          }
          description={
            mode === "create"
              ? "Rellena los campos para crear un nuevo producto."
              : mode === "edit"
                ? `Edita el nombre del producto ${selectedProducto?.nombre}.`
                : undefined
          }
          onCancel={() => setSlideOverOpen(false)}
          saveLabel={
            mode === "edit" ? "Actualizar Producto" : "Crear Producto"
          }
          form={
            mode === "create"
              ? formCreateProducto
              : mode === "edit"
                ? formEditProducto
                : undefined
          }
          mode={mode}
          fieldLabels={fieldLabels.CreateProducto}
          confirm={
            mode === "create"
              ? {
                  title: "Crear producto",
                  description: "¿Deseas crear este nuevo producto?",
                  label: "Crear",
                  summaryFields: ["nombre"],
                }
              : mode === "edit"
                ? {
                    title: "Actualizar producto",
                    description: `¿Deseas guardar los cambios en ${selectedProducto?.nombre}?`,
                    label: "Actualizar",
                    summaryFields: ["nombre"],
                  }
                : undefined
          }
        >
          <div className="flex flex-col gap-3">
            {mode === "create" ? (
              <ProductoCreateForm
                form={formCreateProducto}
                onSubmit={handleCreate}
                onCancel={() => setSlideOverOpen(false)}
                formId="create"
              />
            ) : mode === "edit" ? (
              <ProductoEditForm
                form={formEditProducto}
                onSubmit={handleUpdate}
                onCancel={() => setSlideOverOpen(false)}
                formId="edit"
              />
            ) : selectedProducto ? (
              <ProductoViewForm selectedProducto={selectedProducto} />
            ) : null}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
```

(`mode` matches `SlideOverMode = "create" | "edit" | "view"`; the create-confirm `summaryFields` are fixed to `["nombre"]` per the pre-flight decision — the previous `["partidaId", "anio", "indice"]` values were a copy-paste bug referencing fields that don't exist on productos.)

- [ ] **Step 8: Run productos frontend tests**

Run: `pnpm --filter frontend test -- productos`
Expected: PASS — service (4), data-table (4), view-form suites green.

- [ ] **Step 9: Commit**

```bash
git add apps/frontend/src/features/productos apps/frontend/src/lib/query-invalidation-map.ts
git commit -m "feat(frontend): add producto edit and delete actions"
```

---

### Task 5: Full verification

**Files:** none modified (verification only).

**Interfaces:**
- Consumes: all tasks above.
- Produces: green gate evidence; a report line about the `entities.permissionType` check for the user.

- [ ] **Step 1: Run frontend suites**

Run: `pnpm --filter frontend test`
Expected: PASS — all frontend suites green.

- [ ] **Step 2: Run repo gates**

Run: `pnpm lint && pnpm type-check && pnpm test`
Expected: exit 0 — lint (0 errors), type-check clean, backend unit + frontend + shared suites green.

- [ ] **Step 3: Run integration suite**

Run: `pnpm --filter backend test:integration`
Expected: PASS — full suite (existing 106 cases + the 4 new DELETE cases).

- [ ] **Step 4: Verify entity permissionType (report, do not modify data)**

Row action buttons only render when `DataTable` resolves `entities.permissionType` of `formulas`/`productos` to `CRUD` or `PROCESS` (fallback is `READ_ONLY`, which hides edit/delete). Report to the user this SQL to run against their DB (or check in Prisma Studio):

```sql
SELECT name, permissionType FROM entities WHERE name IN ('formulas', 'productos');
```

If either is `READ_ONLY`, flag it — changing it is an admin/data action outside this plan's code scope (buttons stay hidden until then; lists/create/reads still work).

- [ ] **Step 5: Report completion**

Summarize: 4 feature commits + this verification, gates output, and the permissionType result from Step 4. No commit (verification only).
