// src/modules/legacy/stock/stock.service.ts

import { Injectable } from '@nestjs/common';
import { StockRepository } from './repositories/stock.repository';
import { StockTotal } from './interfaces/stock.interface';

@Injectable()
export class LegacyStockService {
  constructor(private readonly repository: StockRepository) {}

  async stockTotal(
    lote: number,
    anio: number,
    item: number,
  ): Promise<StockTotal[]> {
    return this.repository.stockTotal(lote, anio, item);
  }

  async updateStock(lote: number, anio: number, item: number): Promise<void> {
    return this.repository.updateStock(lote, anio, item);
  }
}
