// src/modules/sustratos/sustratos.controller.ts

import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { SustratosService } from './sustratos.service';
import {
  CreateSustratoDto,
  CreateSustratoSchema,
  SustratoDto,
  UpdateSustratoDto,
  UpdateSustratoSchema,
} from '@vivero/shared';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';

@Controller('sustratos')
export class SustratosController {
  constructor(private readonly service: SustratosService) {}

  @Get()
  @RequirePermission({ tableName: 'sustratos', action: 'read', scope: 'ALL' })
  async getAllSustratos(@CurrentUser() user: AuthUser): Promise<SustratoDto[]> {
    return this.service.getAllSustratos(user.id);
  }

  @Post()
  @RequirePermission({ tableName: 'sustratos', action: 'create', scope: 'ALL' })
  async createSustrato(
    @Body(new ZodValidationPipe(CreateSustratoSchema))
    data: CreateSustratoDto,
  ) {
    return this.service.createSustrato(data);
  }

  @Get(':id')
  @RequirePermission({ tableName: 'sustratos', action: 'read', scope: 'ALL' })
  async getSustrato(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<SustratoDto | null> {
    return this.service.getSustratoById(user.id, id);
  }

  @Patch(':id')
  @RequirePermission({ tableName: 'sustratos', action: 'update', scope: 'ALL' })
  async updateSustrato(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateSustratoSchema))
    data: UpdateSustratoDto,
  ) {
    return this.service.updateSustrato(id, data);
  }
}
