// src/modules/legacy/tipoContenedor/tipoContenedor.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';
import { LegacyTipoContenedorService } from './tipoContenedor.service';
import { LegacyTipoContenedorDto } from '@vivero/shared';

@Controller('l-contenedor')
export class LegacyTipoContenedorController {
  constructor(private readonly service: LegacyTipoContenedorService) {}

  @Get()
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getAllTipoContenedor(): Promise<LegacyTipoContenedorDto[]> {
    return this.service.getAll();
  }

  @Get('/:codigo')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getTipoContenedorByCodigo(
    @Param('codigo') codigo: string,
  ): Promise<LegacyTipoContenedorDto> {
    return this.service.getByCodigo(codigo);
  }
}
