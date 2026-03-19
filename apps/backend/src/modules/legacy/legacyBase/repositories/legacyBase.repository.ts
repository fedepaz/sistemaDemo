// src/modules/legacy/legacyBase/repositories/legacyBase.repository.ts

import { Injectable } from '@nestjs/common';
import {
  LEGACY_DB_TOKEN,
  LegacyDbConnection,
} from '../../../../infra/legacy-mysql/legacy-mysql.provider';
import { RowDataPacket } from 'mysql2/promise';
import { Inject } from '@nestjs/common';
import {
  LegacyQueryOptions,
  LegacyRow,
} from '../interfaces/legacyBase.interface';

@Injectable()
export class LegacyBaseRepository {
  constructor(
    @Inject(LEGACY_DB_TOKEN)
    private readonly legacyDb: LegacyDbConnection,
  ) {}

  private get pool() {
    return this.legacyDb.getPool();
  }

  async queryTable<T extends RowDataPacket = LegacyRow>(
    tableName: string,
    queryOptions: LegacyQueryOptions = {},
  ): Promise<T[]> {
    const {
      select = ['*'],
      where = {},
      orderBy,
      limit = 100,
      offset = 0,
    } = queryOptions;

    // BUILD QUERY
    const columns = select.includes('*')
      ? '*'
      : select.map((col) => `\`${col}\``).join(', ');
    let sql = `SELECT ${columns} FROM \`${tableName}\``;
    const params: any[] = [];

    // Build WHERE clause
    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map((key) => `\`${key}\` = ?`);
      sql += ` WHERE ${conditions.join(' AND ')}`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      params.push(...Object.values(where));
    }

    // Build ORDER BY clause
    if (orderBy && /^[a-zA-Z0-9_\s,]+$/.test(orderBy)) {
      sql += ` ORDER BY ${orderBy}`;
    }

    // Build LIMIT clause
    sql += ` LIMIT ? OFFSET ?`;
    params.push(Math.min(limit, 1000), offset);

    // Execute query
    const [rows] = await this.pool.query<T[]>(sql, params);
    return rows;
  }

  async queryTableCount(
    tableName: string,
    where: Record<string, any> = {},
  ): Promise<number> {
    let sql = `SELECT COUNT(*) AS total FROM \`${tableName}\``;
    const params: any[] = [];

    // Build WHERE clause
    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map((key) => `\`${key}\` = ?`);
      sql += ` WHERE ${conditions.join(' AND ')}`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      params.push(...Object.values(where));
    }

    // Execute query
    const [rows] = await this.pool.query<{ total: number }[]>(sql, params);
    return rows[0].total;
  }
}
