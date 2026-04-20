// src/modules/legacy/partidas/partidas.controller.ts

import { Controller, Get } from '@nestjs/common';
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
}
