// src/modules/legacy/config/config.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { LegacyConfigService } from './config.service';

import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

@Controller('l-config')
export class LegacyConfigController {
  constructor(private readonly service: LegacyConfigService) {}

  @Get()
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getAllConfig() {
    return this.service.getAllConfig();
  }

  @Get('/:key')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getConfigByKey(@Param('key') key: string) {
    return this.service.getConfigByKey(key);
  }
}
