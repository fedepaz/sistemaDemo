// src/modules/alertComments/alertComments.controller.ts

import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AlertCommentsService } from './alertComments.service';

import { RequirePermission } from '../permissions/decorators/require-permission.decorator';

@Controller('alert-comments')
export class AlertCommentsController {
  constructor(private readonly service: AlertCommentsService) {}

  @Get(':alertType/:partidaId/:anio/:indice')
  @RequirePermission({ tableName: 'alerts', action: 'read', scope: 'ALL' })
  async getComments(
    @Param('alertType') alertType: string,
    @Param('partidaId', ParseIntPipe) partidaId: number,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('indice', ParseIntPipe) indice: number,
  ) {
    return this.service.getComments(alertType, partidaId, anio, indice);
  }
}
