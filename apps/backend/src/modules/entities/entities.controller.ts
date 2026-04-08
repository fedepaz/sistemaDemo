// src/modules/entities/entities.controller.ts

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CreateEntityDto } from '@vivero/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  /* GET all tables */
  @Get('tables')
  @RequirePermission({
    tableName: 'entities',
    action: 'read',
    scope: 'ALL',
  })
  getAllTables(@CurrentUser() user: AuthUser) {
    const tables = this.entitiesService.getAllTables(user.id);
    return tables;
  }

  /* GET table by name */
  @Get('table/:tableName')
  @RequirePermission({
    tableName: 'entities',
    action: 'read',
    scope: 'ALL',
  })
  getTableByName(@Param('tableName') tableName: string) {
    const entity = this.entitiesService.getTableByName(tableName);
    return entity;
  }

  /* POST create entity */
  @Post('entity')
  @RequirePermission({
    tableName: 'entities',
    action: 'create',
    scope: 'ALL',
  })
  async createEntity(
    @Body() data: CreateEntityDto,
    @CurrentUser() user: AuthUser,
  ) {
    const entity = await this.entitiesService.createEntity(data, user.id);
    return entity;
  }

  /* DELETE entity */
  @Delete(':id')
  @RequirePermission({
    tableName: 'entities',
    action: 'delete',
    scope: 'ALL',
  })
  async softDelete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const entity = await this.entitiesService.softRemove(id, user.id);
    return entity;
  }
}
