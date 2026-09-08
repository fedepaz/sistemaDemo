// src/modules/legacy/stock/stock.service.ts

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
          body: {
            lote,
            anio,
            item,
            antes: {
              entradas: snapshot.entradasAntes,
              salidas: snapshot.salidasAntes,
            },
            despues: {
              entradas: snapshot.entradasDespues,
              salidas: snapshot.salidasDespues,
            },
          },
          affected: { count: 1 },
          durationMs: 0,
        },
      });
    } catch (err: unknown) {
      this.logger.error({ err }, 'Failed to emit stock audit event');
    }

    return snapshot;
  }
}
