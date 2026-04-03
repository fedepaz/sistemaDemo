// src/modules/legacy/agentes/agentes.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { LegacyAgentesService } from './agentes.service';

import { Public } from '../../../shared/decorators/public.decorator';

@Controller('l-agentes')
export class LegacyAgentesController {
  constructor(private readonly service: LegacyAgentesService) {}

  @Get()
  //@RequirePermission({ tableName: 'agentes', action: 'read' })
  @Public()
  async getAllAgents() {
    return this.service.getAllAgents();
  }

  @Get('/:codigo')
  //@RequirePermission({ tableName: 'agentes', action: 'read' })
  @Public()
  async getAgentByCodigo(@Param('codigo') codigo: number) {
    return this.service.getAgentByCodigo(codigo);
  }
}
