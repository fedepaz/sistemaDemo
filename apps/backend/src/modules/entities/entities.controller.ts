// src/modules/entities/entities.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CreateEntityDto } from '@vivero/shared';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  /* GET all tables */
  @Get('tables')
  @RequirePermission({
    tableName: 'super_admin',
    action: 'read',
    scope: 'ALL',
  })
  getAllTables() {
    const tables = this.entitiesService.getAllTables();
    return tables;
  }

  /* GET table by name */
  @Get('table/:tableName')
  @RequirePermission({
    tableName: 'super_admin',
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
    tableName: 'super_admin',
    action: 'create',
    scope: 'ALL',
  })
  async createEntity(@Body() data: CreateEntityDto) {
    const entity = await this.entitiesService.createEntity(data);
    return entity;
  }
}
