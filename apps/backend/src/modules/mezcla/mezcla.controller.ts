// src/modules/mezcla/mezcla.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { MezclaService } from './mezcla.service';
import { CreateMezclaDto, CreateMezclaSchema, MezclaDto } from '@vivero/shared';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';

@Controller('mezcla')
export class MezclaController {
  constructor(private readonly service: MezclaService) {}

  @Get()
  @RequirePermission({ tableName: 'sustratos', action: 'read', scope: 'ALL' })
  async getAllMezcla(@CurrentUser() user: AuthUser): Promise<MezclaDto[]> {
    return this.service.getAllMezcla(user.id);
  }

  @Post()
  @RequirePermission({ tableName: 'sustratos', action: 'create', scope: 'ALL' })
  async createMezcla(
    @Body(new ZodValidationPipe(CreateMezclaSchema))
    data: CreateMezclaDto,
  ) {
    return this.service.createMezcla(data);
  }

  @Get(':id')
  @RequirePermission({ tableName: 'sustratos', action: 'read', scope: 'ALL' })
  async getMezcla(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<MezclaDto> {
    return this.service.getMezclaById(user.id, id);
  }
}
