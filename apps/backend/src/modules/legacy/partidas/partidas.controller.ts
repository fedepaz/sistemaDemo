// src/modules/legacy/partidas/partidas.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../../shared/decorators/public.decorator';
import { PartidasService } from './partidas.service';

@Controller('l-partidas')
export class PartidasController {
  constructor(private readonly service: PartidasService) {}

  @Get()
  @Public()
  async getAllPartidas() {
    return this.service.getAllPartidas();
  }

  @Get('/:partida')
  @Public()
  async getPartidaByPartida(@Param('partida') partida: number) {
    return this.service.getPartidaByPartida(partida);
  }

  @Get('/fecha/:fecha')
  @Public()
  async getPartidasByFecha(@Param('fecha') fecha: string) {
    return this.service.getPartidasByFecha(fecha);
  }

  @Get('/fecha/:fechaInicio/:fechaFin')
  @Public()
  async getPartidasByFechaRange(
    @Param('fechaInicio') fechaInicio: string,
    @Param('fechaFin') fechaFin: string,
  ) {
    return this.service.getPartidasByFechaRange(fechaInicio, fechaFin);
  }

  @Get('/ano/:ano')
  @Public()
  async getPartidasByAno(@Param('ano') ano: number) {
    return this.service.getPartidasByAno(ano);
  }
}
