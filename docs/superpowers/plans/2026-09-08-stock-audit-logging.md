# Stock Audit Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add temporary audit logging to `LegacyStockService.updateStock` so we can verify stock updates are working correctly during deployment.

**Architecture:** Emit `AuditCrudEvent` via existing `AuditEventEmitter` after `updateStock` completes. Store in existing Prisma `auditLog` table. No schema changes.

**Tech Stack:** NestJS, Prisma, EventEmitter2, existing AuditLogModule

## Global Constraints

- Legacy MySQL database (martin3) cannot be modified for audit — use Prisma `auditLog` table
- All audit code must be in `stock.service.ts` for easy removal (comment out)
- Audit failure must never prevent stock update from completing
- Conventional Commits format required
- TDD: Write test first, then implement

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `apps/backend/src/modules/legacy/stock/stock.module.ts` | Modify | Import `AuditLogModule` |
| `apps/backend/src/modules/legacy/stock/stock.service.ts` | Modify | Inject `AuditEventEmitter`, emit after `updateStock` |
| `apps/backend/src/modules/legacy/stock/__tests__/stock.service.spec.ts` | Create | Unit tests for audit emission |
| `apps/backend/src/modules/legacy/partidas/partidas.service.ts` | Modify | Pass `requesterId` to `updateStock` call |

---

### Task 1: Add AuditLogModule import to stock.module.ts

**Files:**
- Modify: `apps/backend/src/modules/legacy/stock/stock.module.ts`

**Interfaces:**
- Produces: `LegacyStockModule` now imports `AuditLogModule` (enables DI for `AuditEventEmitter`)

- [ ] **Step 1: Read current stock.module.ts**

```typescript
// Current content:
@Module({
  controllers: [StockController],
  providers: [LegacyStockService, StockRepository],
  exports: [LegacyStockService],
})
export class LegacyStockModule {}
```

- [ ] **Step 2: Add AuditLogModule import**

```typescript
import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { LegacyStockService } from './stock.service';
import { StockRepository } from './repositories/stock.repository';
import { AuditLogModule } from '../../auditLog/auditLog.module';

@Module({
  imports: [AuditLogModule],
  controllers: [StockController],
  providers: [LegacyStockService, StockRepository],
  exports: [LegacyStockService],
})
export class LegacyStockModule {}
```

- [ ] **Step 3: Verify compilation**

Run: `pnpm --filter backend type-check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/legacy/stock/stock.module.ts
git commit -m "feat(backend): import AuditLogModule in LegacyStockModule"
```

---

### Task 2: Write failing test for audit emission

**Files:**
- Create: `apps/backend/src/modules/legacy/stock/__tests__/stock.service.spec.ts`

**Interfaces:**
- Consumes: `LegacyStockService`, `StockRepository`, `AuditEventEmitter`
- Produces: Test file that verifies audit event is emitted after `updateStock`

- [ ] **Step 1: Create test directory**

```bash
mkdir -p apps/backend/src/modules/legacy/stock/__tests__
```

- [ ] **Step 2: Write the failing test**

```typescript
// apps/backend/src/modules/legacy/stock/__tests__/stock.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LegacyStockService } from '../stock.service';
import { StockRepository } from '../repositories/stock.repository';
import { AuditEventEmitter } from '../../../auditLog/events/audit-event.emitter';

describe('LegacyStockService', () => {
  let service: LegacyStockService;
  let repository: jest.Mocked<StockRepository>;
  let auditEmitter: jest.Mocked<AuditEventEmitter>;

  const mockSnapshot = {
    entradasAntes: 100,
    salidasAntes: 50,
    entradasDespues: 100,
    salidasDespues: 50,
  };

  beforeEach(async () => {
    const mockRepository = {
      stockTotal: jest.fn().mockResolvedValue([]),
      updateStock: jest.fn().mockResolvedValue(mockSnapshot),
    };

    const mockAuditEmitter = {
      emitCrud: jest.fn(),
      emitAccess: jest.fn(),
      emitAuth: jest.fn(),
      emitSecurity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyStockService,
        { provide: StockRepository, useValue: mockRepository },
        { provide: AuditEventEmitter, useValue: mockAuditEmitter },
      ],
    }).compile();

    service = module.get<LegacyStockService>(LegacyStockService);
    repository = module.get(StockRepository);
    auditEmitter = module.get(AuditEventEmitter);
  });

  describe('updateStock', () => {
    it('should emit audit event after successful update', async () => {
      const lote = 15;
      const anio = 2025;
      const item = 1;
      const requesterId = 'user-123';

      await service.updateStock(lote, anio, item, requesterId);

      expect(auditEmitter.emitCrud).toHaveBeenCalledTimes(1);
      expect(auditEmitter.emitCrud).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: requesterId,
          action: 'UPDATE',
          entityType: 'STOCK',
          entityId: `lote:${lote}|anio:${anio}|item:${item}`,
          changes: expect.objectContaining({
            antes: { entradas: 100, salidas: 50 },
            despues: { entradas: 100, salidas: 50 },
            body: { lote, anio, item },
          }),
        }),
      );
    });

    it('should still return snapshot even if audit fails', async () => {
      auditEmitter.emitCrud.mockImplementation(() => {
        throw new Error('Audit failed');
      });

      const result = await service.updateStock(15, 2025, 1, 'user-123');

      expect(result).toEqual(mockSnapshot);
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter backend test -- --testPathPatterns="stock.service"`
Expected: FAIL with "Cannot import AuditEventEmitter" (not yet injected)

---

### Task 3: Implement audit emission in stock.service.ts

**Files:**
- Modify: `apps/backend/src/modules/legacy/stock/stock.service.ts`

**Interfaces:**
- Consumes: `AuditEventEmitter` (from AuditLogModule)
- Produces: `updateStock(lote, anio, item, requesterId)` emits audit event

- [ ] **Step 1: Read current stock.service.ts**

```typescript
// Current content:
@Injectable()
export class LegacyStockService {
  constructor(private readonly repository: StockRepository) {}

  async stockTotal(lote, anio, item): Promise<StockTotal[]> {
    return this.repository.stockTotal(lote, anio, item);
  }

  async updateStock(lote, anio, item): Promise<StockSnapshot> {
    return this.repository.updateStock(lote, anio, item);
  }
}
```

- [ ] **Step 2: Add AuditEventEmitter and emit after updateStock**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { StockRepository } from './repositories/stock.repository';
import { StockSnapshot, StockTotal } from './interfaces/stock.interface';
import { AuditEventEmitter } from '../../auditLog/events/audit-event.emitter';

@Injectable()
export class LegacyStockService {
  private readonly logger = new Logger(LegacyStockService.name);

  constructor(
    private readonly repository: StockRepository,
    private readonly auditEventEmitter: AuditEventEmitter,
  ) {}

  async stockTotal(
    lote: number,
    anio: number,
    item: number,
  ): Promise<StockTotal[]> {
    return this.repository.stockTotal(lote, anio, item);
  }

  async updateStock(
    lote: number,
    anio: number,
    item: number,
    requesterId?: string,
  ): Promise<StockSnapshot> {
    const snapshot = await this.repository.updateStock(lote, anio, item);

    try {
      this.auditEventEmitter.emitCrud({
        tenantId: 'unknown',
        userId: requesterId ?? 'unknown',
        action: 'UPDATE',
        entityType: 'STOCK',
        entityId: `lote:${lote}|anio:${anio}|item:${item}`,
        timestamp: new Date(),
        changes: {
          requestId: 'unknown',
          endpoint: '/l-stock/update',
          method: 'POST',
          params: {},
          query: {},
          body: { lote, anio, item },
          affected: { count: 1 },
          durationMs: 0,
          antes: {
            entradas: snapshot.entradasAntes,
            salidas: snapshot.salidasAntes,
          },
          despues: {
            entradas: snapshot.entradasDespues,
            salidas: snapshot.salidasDespues,
          },
        },
      });
    } catch (err) {
      this.logger.error({ err }, 'Failed to emit stock audit event');
    }

    return snapshot;
  }
}
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `pnpm --filter backend test -- --testPathPatterns="stock.service"`
Expected: PASS (2 tests)

- [ ] **Step 4: Run type-check**

Run: `pnpm --filter backend type-check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/legacy/stock/stock.service.ts apps/backend/src/modules/legacy/stock/__tests__/stock.service.spec.ts
git commit -m "feat(backend): add audit logging to LegacyStockService.updateStock"
```

---

### Task 4: Pass requesterId from partidas.service.ts

**Files:**
- Modify: `apps/backend/src/modules/legacy/partidas/partidas.service.ts:134`

**Interfaces:**
- Consumes: `requesterId` (already in scope from `asignarSiembra` method)
- Produces: `updateStock` receives `requesterId` parameter

- [ ] **Step 1: Find the updateStock call in partidas.service.ts**

Location: `apps/backend/src/modules/legacy/partidas/partidas.service.ts:134`

```typescript
// Current:
const stockSnapshot = await this.legacyStockService.updateStock(
  data.lote,
  data.anio,
  data.item,
);
```

- [ ] **Step 2: Add requesterId parameter**

```typescript
const stockSnapshot = await this.legacyStockService.updateStock(
  data.lote,
  data.anio,
  data.item,
  requesterId,
);
```

- [ ] **Step 3: Run type-check**

Run: `pnpm --filter backend type-check`
Expected: PASS

- [ ] **Step 4: Run full test suite**

Run: `pnpm --filter backend test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/legacy/partidas/partidas.service.ts
git commit -m "feat(backend): pass requesterId to LegacyStockService.updateStock"
```

---

### Task 5: Verify and finalize

- [ ] **Step 1: Run full lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 2: Run full type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Run all backend tests**

Run: `pnpm --filter backend test`
Expected: PASS

- [ ] **Step 4: Verify audit log entries appear in DB**

Manual test: Call `POST /l-partidas/asignar-siembra` and check `auditLog` table for `entityType: 'STOCK'` entries.

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix(backend): stock audit logging fixes"
```
