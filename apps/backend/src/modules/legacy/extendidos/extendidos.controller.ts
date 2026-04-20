// src/modules/legacy/extendidos/extendidos.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { ExtendidosService } from './extendidos.service';
import { ExtendidoDto } from '@vivero/shared';
import { Public } from '../../../shared/decorators/public.decorator';

@Controller('l-extendidos')
export class ExtendidosController {
  constructor(private readonly extendidosService: ExtendidosService) {}

  @Get(':fecha')
  @Public()
  async getExtendidosByFecha(
    @Param('fecha') fecha: string,
  ): Promise<ExtendidoDto[]> {
    return this.extendidosService.getExtendidosByFecha(fecha);
  }
}
