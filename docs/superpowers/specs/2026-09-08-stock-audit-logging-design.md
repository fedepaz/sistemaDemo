# Stock Audit Logging — Design Spec

> **Date:** 2026-09-08
> **Status:** Approved
> **Scope:** Temporary audit trail for legacy stock operations during deployment verification

## Goal

Add audit logging to the legacy stock module so we can verify `updateStock` is working correctly during the upcoming deployment. This is a **temporary debugging feature** — it will be removed (commented out) once the system is verified stable.

## What Gets Audited

Only `updateStock(lote, anio, item)` in `LegacyStockService`. This is the only write operation; `stockTotal` is read-only and not called from any active feature.

## Audit Data Shape

Each audit entry captures:

| Field | Source |
|-------|--------|
| `userId` | `requesterId` from `PartidasService.asignarSiembra` |
| `action` | `UPDATE` |
| `entityType` | `STOCK` |
| `entityId` | `lote:{lote}\|anio:{anio}\|item:{item}` |
| `antes` | `{ entradas, salidas }` — values before sync |
| `despues` | `{ entradas, salidas }` — values after sync |
| `endpoint` | `/l-stock/update` |
| `method` | `POST` |
| `body` | `{ lote, anio, item }` — input params |
| `timestamp` | `new Date()` at emit time |

## Storage

Existing Prisma `auditLog` table via `AuditEventEmitter.emitCrud()`. No schema changes needed.

## Changes

### 1. `stock.module.ts`
- Add `AuditLogModule` to `imports`

### 2. `stock.service.ts`
- Inject `AuditEventEmitter` into constructor
- Add `requesterId` parameter to `updateStock`
- Emit `AuditCrudEvent` after `updateStock` completes with before/after snapshot
- Wrap emit in try/catch (audit failure must not break stock update)

### 3. `partidas.service.ts`
- Pass `requesterId` to `this.legacyStockService.updateStock(...)` call (already available in scope)

## Removal

When ready to remove:
1. Comment out the `this.auditEventEmitter.emitCrud(...)` block in `stock.service.ts`
2. Comment out the `AuditEventEmitter` import and constructor injection
3. Remove `AuditLogModule` import from `stock.module.ts`
4. Revert `requesterId` param from `updateStock` signature

## Error Handling

- Audit emit is fire-and-forget: wrapped in try/catch, logged on failure
- Audit failure never prevents the stock update from completing
- If the `auditLog` table is unavailable, the stock operation proceeds normally

## Testing

- Unit test for `stock.service.ts`: mock `AuditEventEmitter`, verify `emitCrud` is called with correct shape after `updateStock`
- Integration test: call `updateStock`, verify audit log entry exists in DB
