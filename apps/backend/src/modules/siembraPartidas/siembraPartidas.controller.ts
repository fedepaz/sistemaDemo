// src/modules/siembraPartidas/siembraPartidas.controller.ts

import { Controller, Get } from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { SiembraPartidasService } from './siembraPartidas.service';

@Controller('siembra-partdas')
export class SiembraPartidasController {
  constructor(private readonly service: SiembraPartidasService) {}

  @Get()
  @RequirePermission({ tableName: 'siembra', action: 'read', scope: 'ALL' })
  async getAllSiembraPartidas(@CurrentUser() user: AuthUser) {
    return this.service.getAllSiembraPartidas(user.id);
  }
}
