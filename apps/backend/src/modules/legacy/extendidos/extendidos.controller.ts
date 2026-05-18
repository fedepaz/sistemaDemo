// src/modules/legacy/extendidos/extendidos.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { ExtendidosService } from './extendidos.service';
import { ExtendidoDto } from '@vivero/shared';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

@Controller('l-extendidos')
export class ExtendidosController {
  constructor(private readonly extendidosService: ExtendidosService) {}

  @Get()
  @RequirePermission({
    tableName: 'extendidos',
    action: 'read',
    scope: 'ALL',
  })
  async getAllExtendidos(): Promise<ExtendidoDto[]> {
    return this.extendidosService.getAllExtendidos();
  }

  @Get('fechas')
  @RequirePermission({
    tableName: 'extendidos',
    action: 'read',
    scope: 'ALL',
  })
  async getAvailableExtendidoDates(): Promise<string[]> {
    return this.extendidosService.getAvailableExtendidoDates();
  }

  @Get('camara/')
  @RequirePermission({
    tableName: 'extendidos',
    action: 'read',
    scope: 'ALL',
  })
  async getExtendidosEnCamara(): Promise<ExtendidoDto[]> {
    return this.extendidosService.getExtendidosEnCamara();
  }
  @Get(':fecha')
  @RequirePermission({
    tableName: 'extendidos',
    action: 'read',
    scope: 'ALL',
  })
  async getExtendidosByFecha(
    @Param('fecha') fecha: string,
  ): Promise<ExtendidoDto[]> {
    return this.extendidosService.getExtendidosByFecha(fecha);
  }
}
