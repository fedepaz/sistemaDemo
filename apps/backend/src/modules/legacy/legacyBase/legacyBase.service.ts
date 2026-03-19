// src/modules/legacy/legacyBase/legacyBase.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { LegacyBaseRepository } from './repositories/legacyBase.repository';
import {
  LEGACY_TABLE_WHITELIST,
  LegacyQueryOptions,
  LegacyRow,
  LegacyTableName,
} from './interfaces/legacyBase.interface';

@Injectable()
export class LegacyBaseService {
  constructor(private readonly repo: LegacyBaseRepository) {}
  /**
   * Validate table name against whitelist
   */
  private validateTable(table: string): LegacyTableName {
    if (!LEGACY_TABLE_WHITELIST.includes(table as LegacyTableName)) {
      throw new BadRequestException(
        `Table '${table}' is not accessible via legacy API`,
      );
    }
    return table as LegacyTableName;
  }

  /**
   * Sanitize string fields from legacy char() padding
   */
  private sanitizeRow(row: LegacyRow): LegacyRow {
    const sanitized: LegacyRow = {};
    for (const [key, value] of Object.entries(row)) {
      // Trim strings, handle null/undefined
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      sanitized[key] = typeof value === 'string' ? value.trim() : value;
    }
    return sanitized;
  }

  async findAll(
    table: LegacyTableName,
    options: LegacyQueryOptions = {},
  ): Promise<{ data: LegacyRow[]; total: number }> {
    const [data, total] = await Promise.all([
      this.repo.queryTable(table, options),
      this.repo.queryTableCount(table, options.where),
    ]);

    return {
      data: data.map((row) => this.sanitizeRow(row)),
      total,
    };
  }

  async findOne(
    table: LegacyTableName,
    id: number | string,
    idColumn = 'codigo',
  ): Promise<LegacyRow | null> {
    const results = await this.repo.queryTable(table, {
      where: { [idColumn]: id },
      limit: 1,
    });

    const row = results[0];
    return row ? this.sanitizeRow(row) : null;
  }
}
