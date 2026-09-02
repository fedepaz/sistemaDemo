// src/modules/legacy/tratamiento/tratamiento.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';
import { LegacyTratamientoService } from './tratamiento.service';
import { TratamientoDto } from '@vivero/shared';

@Controller('l-tratamiento')
export class LegacyTratamientoController {
  constructor(private readonly service: LegacyTratamientoService) {}

  @Get()
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getAllTratamientos(): Promise<TratamientoDto[]> {
    return this.service.getAll();
  }

  @Get('/:codigo')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getByCodigo(@Param('codigo') codigo: string): Promise<TratamientoDto> {
    return this.service.getByCodigo(codigo);
  }
}
