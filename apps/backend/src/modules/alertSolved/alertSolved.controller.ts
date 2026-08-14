// src/modules/alertSolved/alertSolved.controller.ts

import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  AlertSolvedDto,
  CreateAlertSolvedDto,
  CreateAlertSolvedSchema,
} from '@vivero/shared';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';
import { AlertSolvedService } from './alertSolved.service';

@Controller('alert-solved')
export class AlertSolvedController {
  constructor(private readonly service: AlertSolvedService) {}

  @Get()
  @RequirePermission({ tableName: 'alerts', action: 'read', scope: 'ALL' })
  async getSolvedAlerts(
    @CurrentUser() user: AuthUser,
  ): Promise<AlertSolvedDto[]> {
    return this.service.getSolvedAlerts(user.id);
  }

  @Post()
  @RequirePermission({ tableName: 'alerts', action: 'create', scope: 'ALL' })
  async createSolvedAlert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateAlertSolvedSchema))
    data: CreateAlertSolvedDto,
  ) {
    return this.service.createSolvedAlert(data, user.id);
  }
}
