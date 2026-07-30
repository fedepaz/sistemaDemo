// src/modules/legacy/alerts/alerts.controller.ts

import { Controller, Get } from '@nestjs/common';
import {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from '@vivero/shared';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';
import { AlertsService } from './alerts.service';

@Controller('l-alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('siembra-retrasada')
  @RequirePermission({
    tableName: 'alerts',
    action: 'read',
    scope: 'ALL',
  })
  async getSiembraRetrasada(): Promise<SiembraRetrasadaDto[]> {
    return this.alertsService.getSiembraRetrasada();
  }

  @Get('falta-germinacion')
  @RequirePermission({
    tableName: 'alerts',
    action: 'read',
    scope: 'ALL',
  })
  async getFaltaGerminacion(): Promise<FaltaGerminacionDto[]> {
    return this.alertsService.getFaltaGerminacion();
  }

  @Get('faltante-plantas')
  @RequirePermission({
    tableName: 'alerts',
    action: 'read',
    scope: 'ALL',
  })
  async getFaltantePlantas(): Promise<FaltantePlantasDto[]> {
    return this.alertsService.getFaltantePlantas();
  }

  @Get('falta-pre-expedicion')
  @RequirePermission({
    tableName: 'alerts',
    action: 'read',
    scope: 'ALL',
  })
  async getFaltaPreExpedicion(): Promise<FaltaPreExpedicionDto[]> {
    return this.alertsService.getFaltaPreExpedicion();
  }
}
