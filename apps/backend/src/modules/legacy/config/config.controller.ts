// src/modules/legacy/config/config.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { LegacyConfigService } from './config.service';

import { Public } from 'src/shared/decorators/public.decorator';

@Controller('l-config')
export class LegacyConfigController {
  constructor(private readonly service: LegacyConfigService) {}

  @Get()
  //@RequirePermission({ tableName: 'config', action: 'read' })
  @Public()
  async getAllConfig() {
    return this.service.getAllConfig();
  }

  @Get('/:key')
  //@RequirePermission({ tableName: 'config', action: 'read' })
  @Public()
  async getConfigByKey(@Param('key') key: string) {
    return this.service.getConfigByKey(key);
  }
}
