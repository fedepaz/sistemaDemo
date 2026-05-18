// src/modules/legacy/agentes/agentes.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { LegacyAgentesService } from './agentes.service';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

@Controller('l-agentes')
export class LegacyAgentesController {
  constructor(private readonly service: LegacyAgentesService) {}

  @Get()
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getAllAgents() {
    return this.service.getAllAgents();
  }

  @Get('/:codigo')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getAgentByCodigo(@Param('codigo') codigo: number) {
    return this.service.getAgentByCodigo(codigo);
  }
}
