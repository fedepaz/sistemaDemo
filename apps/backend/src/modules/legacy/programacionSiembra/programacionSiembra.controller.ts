// src/modules/legacy/programacionSiembra/programacionSiembra.controller.ts

import { Controller, Get } from '@nestjs/common';

import { ProgramacionSiembraDto } from '@vivero/shared';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';
import { ProgramacionSiembraService } from './programacionSiembra.service';

@Controller('l-programacion-siembra')
export class ProgramacionSiembraController {
  constructor(
    private readonly programacionSiembraService: ProgramacionSiembraService,
  ) {}

  @Get()
  @RequirePermission({
    tableName: 'programacion_siembra',
    action: 'read',
    scope: 'ALL',
  })
  async getAllProgramacionSiembra(): Promise<ProgramacionSiembraDto[]> {
    return this.programacionSiembraService.getAllProgramacionSiembra();
  }
}
