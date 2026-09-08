// apps/backend/src/modules/legacy/stock/__tests__/stock.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LegacyStockService } from '../stock.service';
import { StockRepository } from '../repositories/stock.repository';
import { AuditEventEmitter } from '../../../auditLog/events/audit-event.emitter';

describe('LegacyStockService', () => {
  let service: LegacyStockService;
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
    } as unknown as jest.Mocked<AuditEventEmitter>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyStockService,
        { provide: StockRepository, useValue: mockRepository },
        { provide: AuditEventEmitter, useValue: mockAuditEmitter },
      ],
    }).compile();

    service = module.get<LegacyStockService>(LegacyStockService);
    auditEmitter = module.get(AuditEventEmitter);
  });

  describe('updateStock', () => {
    it('should emit audit event after successful update', async () => {
      const lote = 15;
      const anio = 2025;
      const item = 1;
      const requesterId = 'user-123';

      await service.updateStock(lote, anio, item, requesterId);

      const emitCrudSpy = jest.spyOn(auditEmitter, 'emitCrud');
      expect(emitCrudSpy).toHaveBeenCalledTimes(1);
    });

    it('should still return snapshot even if audit fails', async () => {
      (auditEmitter.emitCrud as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('Audit failed');
      });

      const result = await service.updateStock(15, 2025, 1, 'user-123');

      expect(result).toEqual(mockSnapshot);
    });
  });
});
