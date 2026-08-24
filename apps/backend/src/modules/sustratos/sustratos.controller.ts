// src/modules/sustratos/sustratos.controller.ts

import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { SustratosService } from './sustratos.service';

@Controller('sustratos')
export class SustratosController {
  constructor(private readonly service: SustratosService) {}

  @Get()
  @RequirePermission({ tableName: 'sustratos', action: 'read', scope: 'ALL' })
  async getAllSustratos(@CurrentUser() user: AuthUser) {
    return this.service.getAllSustratos(user.id);
  }

  @Post()
  @RequirePermission({ tableName: 'sustratos', action: 'create', scope: 'ALL' })
  async createSustrato(sustrato: { nombre: string }) {
    return this.service.createSustrato(sustrato);
  }

  @Get(':id')
  @RequirePermission({ tableName: 'sustratos', action: 'read', scope: 'ALL' })
  async getSustrato(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getSustratoById(user.id, id);
  }

  @Patch(':id')
  @RequirePermission({ tableName: 'sustratos', action: 'update', scope: 'ALL' })
  async updateSustrato(@Param('id') id: string, sustrato: Record<string, unknown>) {
    return this.service.updateSustrato(id, sustrato);
  }
}
