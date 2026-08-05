// src/modules/alertComments/alertComments.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AlertCommentsService } from './alertComments.service';
import {
  AlertCommentDto,
  CreateAlertCommentDto,
  CreateAlertCommentSchema,
} from '@vivero/shared';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';

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
  ): Promise<AlertCommentDto[]> {
    return this.service.getComments(alertType, partidaId, anio, indice);
  }

  @Post()
  @RequirePermission({ tableName: 'alerts', action: 'create', scope: 'ALL' })
  async createComment(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateAlertCommentSchema))
    data: CreateAlertCommentDto,
  ): Promise<AlertCommentDto> {
    return this.service.createComment(data, user.id);
  }
}
