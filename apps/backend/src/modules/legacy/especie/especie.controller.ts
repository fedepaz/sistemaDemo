// src/modules/legacy/especie/especie.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { LegacyEspecieService } from './especie.service';
import { Public } from '../../../shared/decorators/public.decorator';

@Controller('l-especie')
export class LegacyEspecieController {
  constructor(private readonly legacyEspecieService: LegacyEspecieService) {}

  @Get()
  //@RequirePermission({ tableName: 'especie', action: 'read' })
  @Public()
  async getAllEspecies() {
    return this.legacyEspecieService.getAllEspecies();
  }

  @Get('/:codigo')
  //@RequirePermission({ tableName: 'especie', action: 'read' })
  @Public()
  async getEspecieByCodigo(@Param('codigo') codigo: string) {
    return this.legacyEspecieService.getEspecieByCodigo(codigo);
  }
}
