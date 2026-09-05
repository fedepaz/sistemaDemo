// src/modules/legacy/stock/stock.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { LegacyStockService } from './stock.service';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

@Controller('l-stock')
export class StockController {
  constructor(private readonly service: LegacyStockService) {}

  @Get('total')
  @RequirePermission({
    tableName: 'partidas',
    action: 'read',
    scope: 'ALL',
  })
  async stockTotal(
    @Query('lote') lote: string,
    @Query('anio') anio: string,
    @Query('item') item: string,
  ) {
    return this.service.stockTotal(Number(lote), Number(anio), Number(item));
  }
}
