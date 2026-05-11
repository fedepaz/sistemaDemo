// src/modules/legacy/partidas/partidas.controller.ts

import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../../shared/decorators/public.decorator';
import { PartidasService } from './partidas.service';
import { AsignarUbicacionDto, AsignarUbicacionDtoSchema } from '@vivero/shared';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation-pipe';

@Controller('l-partidas')
export class PartidasController {
  constructor(private readonly service: PartidasService) {}

  @Get()
  @Public()
  async getAllPartidas() {
    return this.service.getAllPartidas();
  }

  @Post('asignar-ubicacion')
  @Public()
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
