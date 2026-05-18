// src/modules/legacy/partidas/partidas.controller.ts

import { Body, Controller, Get, Post } from '@nestjs/common';
import { PartidasService } from './partidas.service';
import { AsignarUbicacionDto, AsignarUbicacionDtoSchema } from '@vivero/shared';
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

  @Post('asignar-ubicacion')
  @RequirePermission({
    tableName: 'extendidos',
    action: 'create',
    scope: 'ALL',
  })
  async asignarUbicacion(
    @Body(new ZodValidationPipe(AsignarUbicacionDtoSchema))
    data: AsignarUbicacionDto,
  ) {
    await this.service.asignarUbicacion(data);
    return {
      success: true,
      message: 'Ubicación asignada correctamente',
    };
  }
}
