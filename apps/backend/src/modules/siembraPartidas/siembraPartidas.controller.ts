// src/modules/siembraPartidas/siembraPartidas.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { SiembraPartidasService } from './siembraPartidas.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';
import {
  CreateSiembraPartidaDto,
  CreateSiembraPartidaSchema,
  SiembraPartidaDto,
} from '@vivero/shared';

@Controller('siembra-partidas')
export class SiembraPartidasController {
  constructor(private readonly service: SiembraPartidasService) {}

  @Get()
  @RequirePermission({ tableName: 'siembra', action: 'read', scope: 'ALL' })
  async getAllSiembraPartidas(
    @CurrentUser() user: AuthUser,
  ): Promise<SiembraPartidaDto[]> {
    return this.service.getAllSiembraPartidas(user.id);
  }

  @Post()
  @RequirePermission({ tableName: 'siembra', action: 'create', scope: 'ALL' })
  async createSiembraPartida(
    @Body(new ZodValidationPipe(CreateSiembraPartidaSchema))
    data: CreateSiembraPartidaDto,
  ) {
    return this.service.createSiembraPartida(data);
  }

  @Get(':id')
  @RequirePermission({ tableName: 'siembra', action: 'read', scope: 'ALL' })
  async getSiembraPartida(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<SiembraPartidaDto> {
    return this.service.getSiembraPartidaById(id, user.id);
  }
}
