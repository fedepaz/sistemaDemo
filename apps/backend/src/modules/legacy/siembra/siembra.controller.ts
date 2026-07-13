// src/modules/legacy/siembra/siembra.controller.ts

import { Body, Controller, Get, Post } from '@nestjs/common';

import {
  AsignarUbiSiembraDto,
  AsignarUbiSiembraDtoSchema,
  SiembraDto,
} from '@vivero/shared';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation-pipe';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';
import { SiembraService } from './siembra.service';

@Controller('l-siembra')
export class SiembraController {
  constructor(private readonly siembraService: SiembraService) {}

  @Get()
  @RequirePermission({
    tableName: 'siembra',
    action: 'read',
    scope: 'ALL',
  })
  async getAllSiembra(): Promise<SiembraDto[]> {
    return this.siembraService.getAllSiembra();
  }

  @Post('asignar-ubicacion-siembra')
  @RequirePermission({
    tableName: 'siembra',
    action: 'create',
    scope: 'ALL',
  })
  async asignarUbicacionSiembra(
    @Body(new ZodValidationPipe(AsignarUbiSiembraDtoSchema))
    data: AsignarUbiSiembraDto,
  ): Promise<void> {
    await this.siembraService.asignarUbicacionSiembra(data);
  }
}
