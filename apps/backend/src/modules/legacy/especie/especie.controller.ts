// src/modules/legacy/especie/especie.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { LegacyEspecieService } from './especie.service';

import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

@Controller('l-especie')
export class LegacyEspecieController {
  constructor(private readonly legacyEspecieService: LegacyEspecieService) {}

  @Get()
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getAllEspecies() {
    return this.legacyEspecieService.getAllEspecies();
  }

  @Get('/:codigo')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getEspecieByCodigo(@Param('codigo') codigo: string) {
    return this.legacyEspecieService.getEspecieByCodigo(codigo);
  }
}
