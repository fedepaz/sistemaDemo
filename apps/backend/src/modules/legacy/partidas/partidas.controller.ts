// src/modules/legacy/partidas/partidas.controller.ts

import { Body, Controller, Get, Post } from '@nestjs/common';
import { PartidasService } from './partidas.service';
import {
  AsignarUbiExtendidoDto,
  AsignarUbiExtendidoDtoSchema,
  AsignarUbiSiembraCompletaDto,
  AsignarUbiSiembraCompletaDtoSchema,
} from '@vivero/shared';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation-pipe';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorators';
import { AuthUser } from '../../auth/types/auth-user.type';

@Controller('l-partidas')
export class PartidasController {
  constructor(private readonly service: PartidasService) {}

  @Get()
  @RequirePermission({
    tableName: 'extendidos',
    action: 'read',
    scope: 'ALL',
  })
  async getAllPartidas() {
    return this.service.getAllPartidas();
  }

  @Post('asignar-extendido')
  @RequirePermission({
    tableName: 'extendidos',
    action: 'create',
    scope: 'ALL',
  })
  async asignarExtendido(
    @Body(new ZodValidationPipe(AsignarUbiExtendidoDtoSchema))
    data: AsignarUbiExtendidoDto,
  ) {
    await this.service.asignarExtendido(data);
    return {
      success: true,
      message: 'Ubicación asignada correctamente',
    };
  }

  @Post('asignar-siembra')
  @RequirePermission({
    tableName: 'siembra',
    action: 'create',
    scope: 'ALL',
  })
  async asignarSiembra(
    @Body(new ZodValidationPipe(AsignarUbiSiembraCompletaDtoSchema))
    data: AsignarUbiSiembraCompletaDto,
    @CurrentUser() user: AuthUser,
  ) {
    await this.service.asignarSiembra(data, user.id);
    return {
      success: true,
      message: 'Ubicación asignada correctamente',
    };
  }
}
