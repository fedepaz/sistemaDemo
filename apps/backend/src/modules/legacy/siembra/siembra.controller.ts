// src/modules/legacy/siembra/siembra.controller.ts

import { Controller, Get } from '@nestjs/common';

import { SiembraDto } from '@vivero/shared';
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
}
