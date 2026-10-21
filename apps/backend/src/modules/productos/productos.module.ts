// src/modules/productos/productos.module.ts

import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { ProductosRepository } from './repositories/productos.repository';
import { LegacyProductoSyncService } from './legacy-producto-sync.service';
import { LegacySustratoModule } from '../legacy/sustrato/sustrato.module';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService, ProductosRepository, LegacyProductoSyncService],
  imports: [LegacySustratoModule],
  exports: [ProductosService],
})
export class ProductosModule {}
