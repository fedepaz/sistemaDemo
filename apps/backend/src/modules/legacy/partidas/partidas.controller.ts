// src/modules/legacy/partidas/partidas.controller.ts

import { Body, Controller, Get, Post } from '@nestjs/common';
import { PartidasService } from './partidas.service';
import {
  AsignarUbiExtendidoDto,
  AsignarUbiExtendidoDtoSchema,
  AsignarUbiSiembraDto,
  AsignarUbiSiembraDtoSchema,
} from '@vivero/shared';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation-pipe';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

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
    @Body(new ZodValidationPipe(AsignarUbiSiembraDtoSchema))
    data: AsignarUbiSiembraDto,
  ) {
    await this.service.asignarSiembra(data);
    return {
      success: true,
      message: 'Ubicación asignada correctamente',
    };
  }
}
