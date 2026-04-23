// src/modules/legacy/extendidos/extendidos.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { ExtendidosService } from './extendidos.service';
import { ExtendidoDto } from '@vivero/shared';
import { Public } from '../../../shared/decorators/public.decorator';

@Controller('l-extendidos')
export class ExtendidosController {
  constructor(private readonly extendidosService: ExtendidosService) {}

  @Get()
  @Public()
  async getAllExtendidos(): Promise<ExtendidoDto[]> {
    return this.extendidosService.getAllExtendidos();
  }

  @Get('fechas')
  @Public()
  async getAvailableExtendidoDates(): Promise<string[]> {
    return this.extendidosService.getAvailableExtendidoDates();
  }

  @Get(':fecha')
  @Public()
  async getExtendidosByFecha(
    @Param('fecha') fecha: string,
  ): Promise<ExtendidoDto[]> {
    return this.extendidosService.getExtendidosByFecha(fecha);
  }

  @Get('camara/:fecha')
  @Public()
  async getExtendidosEnCamara(
    @Param('fecha') fecha: string,
  ): Promise<ExtendidoDto[]> {
    return this.extendidosService.getExtendidosEnCamara(fecha);
  }
}
