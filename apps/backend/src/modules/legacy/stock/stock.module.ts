// src/modules/legacy/stock/stock.module.ts

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
