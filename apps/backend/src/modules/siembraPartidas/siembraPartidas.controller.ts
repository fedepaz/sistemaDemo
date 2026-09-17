// src/modules/siembraPartidas/siembraPartidas.controller.ts

import { Controller, Get, Param, Patch } from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { SiembraPartidasService } from './siembraPartidas.service';
import { SiembraPartidaDto } from '@vivero/shared';

@Controller('siembra-partidas')
export class SiembraPartidasController {
  constructor(private readonly service: SiembraPartidasService) {}

  @Get()
  @RequirePermission({
    tableName: 'programacion_siembra',
    action: 'read',
    scope: 'ALL',
  })
  async getAllSiembraPartidas(
    @CurrentUser() user: AuthUser,
  ): Promise<SiembraPartidaDto[]> {
    return this.service.getAllSiembraPartidas(user.id);
  }

  @Get('pending')
  @RequirePermission({ tableName: 'a_sembrar', action: 'read', scope: 'ALL' })
  async getPendingSiembraPartidas(
    @CurrentUser() user: AuthUser,
  ): Promise<SiembraPartidaDto[]> {
    return this.service.findPendingSiembraPartidas(user.id);
  }

  @Get(':id')
  @RequirePermission({
    tableName: 'programacion_siembra',
    action: 'read',
    scope: 'ALL',
  })
  async getSiembraPartida(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<SiembraPartidaDto> {
    return this.service.getSiembraPartidaById(id, user.id);
  }

  @Patch(':id/desautorizar')
  @RequirePermission({
    tableName: 'programacion_siembra',
    action: 'create',
    scope: 'ALL',
  })
  async desautorizarSiembra(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<SiembraPartidaDto> {
    return this.service.desautorizarSiembra(id, user.id);
  }
}
