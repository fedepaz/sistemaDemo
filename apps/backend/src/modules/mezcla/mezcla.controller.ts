// src/modules/mezcla/mezcla.controller.ts

import { Controller, Get } from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { MezclaService } from './mezcla.service';

@Controller('mezcla')
export class MezclaController {
  constructor(private readonly service: MezclaService) {}

  @Get()
  @RequirePermission({ tableName: 'siembra', action: 'read', scope: 'ALL' })
  async getAllMezcla(@CurrentUser() user: AuthUser) {
    return this.service.getAllMezcla(user.id);
  }
}
