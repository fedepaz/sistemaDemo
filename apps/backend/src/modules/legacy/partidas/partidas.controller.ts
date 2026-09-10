// src/modules/legacy/partidas/partidas.controller.ts

import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PartidasService } from './partidas.service';
import {
  AsignarUbiExtendidoDto,
  AsignarUbiExtendidoDtoSchema,
  AsignarUbiSiembraCompletaDto,
  AsignarUbiSiembraCompletaDtoSchema,
  PartidaHeader,
  PartidaHeaderSchema,
} from '@vivero/shared';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation-pipe';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorators';
import { AuthUser } from '../../auth/types/auth-user.type';
import { SiembraPartidasService } from '../../siembraPartidas/siembraPartidas.service';

@Controller('l-partidas')
export class PartidasController {
  constructor(
    private readonly service: PartidasService,
    private readonly siembraPartidasService: SiembraPartidasService,
  ) {}

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

  @Post('autorizar-siembra')
  @RequirePermission({
    tableName: 'siembra',
    action: 'create',
    scope: 'ALL',
  })
  async autorizarSiembra(
    @Body(new ZodValidationPipe(PartidaHeaderSchema))
    data: PartidaHeader,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.siembraPartidasService.autorizarSiembra(
      data,
      user.id,
    );
    return {
      success: true,
      message: 'Partida autorizada para siembra',
      data: result,
    };
  }

  @Patch('asignar-siembra/:id')
  @RequirePermission({
    tableName: 'a_sembrar',
    action: 'update',
    scope: 'ALL',
  })
  async completarSiembra(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AsignarUbiSiembraCompletaDtoSchema))
    data: AsignarUbiSiembraCompletaDto,
    @CurrentUser() user: AuthUser,
  ) {
    // 1. Update technical fields on SiembraPartidas
    await this.siembraPartidasService.completarSiembraPartida(
      id,
      data,
      user.id,
    );
    // 2. Write legacy data + stock + TaskShift
    await this.service.completarSiembraLegacy(data, user.id);
    return {
      success: true,
      message: 'Siembra completada correctamente',
    };
  }
}
