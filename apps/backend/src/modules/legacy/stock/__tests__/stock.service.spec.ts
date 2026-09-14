// apps/backend/src/modules/legacy/stock/__tests__/stock.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LegacyStockService } from '../stock.service';
import { StockRepository } from '../repositories/stock.repository';

describe('LegacyStockService', () => {
  let service: LegacyStockService;
  let repository: {
    stockTotal: jest.Mock;
    updateStock: jest.Mock;
  };

  const mockSnapshot = {
    entradas: 100,
    salidas: 50,
  };

  beforeEach(async () => {
    repository = {
      stockTotal: jest
        .fn()
        .mockResolvedValue([{ total_entradas: 100, total_salidas: 50 }]),
      updateStock: jest.fn().mockResolvedValue(mockSnapshot),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyStockService,
        { provide: StockRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<LegacyStockService>(LegacyStockService);
  });

  describe('stockTotal', () => {
    it('should return stock totals', async () => {
      const result = await service.stockTotal(15, 2025, 1);

      expect(repository.stockTotal).toHaveBeenCalledWith(15, 2025, 1);
      expect(result).toEqual([{ total_entradas: 100, total_salidas: 50 }]);
    });
  });

  describe('updateStock', () => {
    it('should return updated stock values', async () => {
      const result = await service.updateStock(15, 2025, 1);

      expect(repository.updateStock).toHaveBeenCalledWith(15, 2025, 1);
      expect(result).toEqual(mockSnapshot);
    });
  });
});
