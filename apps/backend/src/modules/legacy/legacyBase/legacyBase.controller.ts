// src/modules/legacy/legacyBase/legacyBase.controller.ts

import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { LegacyBaseService } from './legacyBase.service';
import {
  LEGACY_TABLE_WHITELIST,
  LegacyTableName,
} from './interfaces/legacyBase.interface';

@Controller('legacyBase')
export class LegacyBaseController {
  constructor(private readonly service: LegacyBaseService) {}

  @Get(':tablename')
  async findAll(
    @Param('tablename') tableName: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 100,
    @Query('orderBy') orderBy?: string,
    @Query('filter') filter?: string,
  ) {
    // Validate table name
    if (!LEGACY_TABLE_WHITELIST.includes(tableName as LegacyTableName)) {
      throw new BadRequestException('Table not allowd');
    }

    // Parse filter JSON safely
    let where: Record<string, any> = {};
    if (filter) {
      try {
        where = JSON.parse(filter) as Record<string, any>;
      } catch {
        throw new BadRequestException('Invalid filter JSON');
      }
    }

    const result = await this.service.findAll(tableName as LegacyTableName, {
      limit: Math.min(limit, 1000),
      offset: (page - 1) * limit,
      orderBy,
      where,
    });

    return {
      success: true,
      tableName,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
      data: result.data,
    };
  }

  @Get(':tablename/:id')
  async findOne(
    @Param('tablename') tableName: string,
    @Param('id') id: string,
    @Query('idColumn') idColumn = 'codigo',
  ) {
    // Validate table name
    if (!LEGACY_TABLE_WHITELIST.includes(tableName as LegacyTableName)) {
      throw new BadRequestException('Table not allowd');
    }
    // try numeric id first, fallback to string
    const numericId = parseInt(id);
    const searchId = isNaN(numericId) ? id : numericId;

    const row = await this.service.findOne(
      tableName as LegacyTableName,
      searchId,
      idColumn,
    );

    if (!row) {
      throw new NotFoundException(`Row ${searchId} not found`);
    }

    return {
      success: true,
      tableName,
      data: row,
    };
  }
}
