// src/modules/legacy/tipoContenedor/tipoContenedor.module.ts

import { Module } from '@nestjs/common';
import { LegacyTipoContenedorController } from './tipoContenedor.controller';
import { TipoContenedorRepository } from './repositories/tipoContenedor.repository';
import { LegacyTipoContenedorService } from './tipoContenedor.service';

@Module({
  controllers: [LegacyTipoContenedorController],
  providers: [LegacyTipoContenedorService, TipoContenedorRepository],
})
export class LegacyTipoContenedorModule {}
