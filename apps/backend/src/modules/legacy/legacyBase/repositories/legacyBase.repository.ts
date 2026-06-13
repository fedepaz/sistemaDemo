// src/modules/legacy/legacyBase/repositories/legacyBase.repository.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  LEGACY_DB_TOKEN,
  LegacyDbConnection,
} from '../../../../infra/legacy-mysql/legacy-mysql.provider';
import { Inject } from '@nestjs/common';
import {
  CountResult,
  LegacyQueryOptions,
  LegacyRow,
} from '../interfaces/legacyBase.types';

@Injectable()
export class LegacyBaseRepository {
  constructor(
    @Inject(LEGACY_DB_TOKEN)
    private readonly legacyDb: LegacyDbConnection,
  ) {}

  private get pool() {
    return this.legacyDb.getPool();
  }

  async queryTable<T = LegacyRow>(
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
      const conditions = Object.keys(where)
        .filter((key) => /^[a-zA-Z0-9_]+$/.test(key)) // Sanitize keys
        .map((key) => `\`${key}\` = ?`);

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
        const validKeys = Object.keys(where).filter((key) =>
          /^[a-zA-Z0-9_]+$/.test(key),
        );
        if (validKeys.length !== Object.keys(where).length) {
          throw new BadRequestException(
            `Invalid WHERE clause: ${JSON.stringify(where)}`,
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        params.push(...validKeys.map((k) => where[k]));
      }
    }

    // Build ORDER BY clause
    if (orderBy && /^[a-zA-Z0-9_\s,]+$/.test(orderBy)) {
      sql += ` ORDER BY ${orderBy}`;
    }

    // Build LIMIT clause
    sql += ` LIMIT ? OFFSET ?`;
    params.push(Math.min(limit, 1000), offset);

    // Execute query
    const [rows] = await this.pool.query(sql, params);
    return rows as T[];
  }

  async queryTableCount(
    tableName: string,
    where: Record<string, any> = {},
  ): Promise<number> {
    let sql = `SELECT COUNT(*) AS total FROM \`${tableName}\``;
    const params: any[] = [];

    // Build WHERE clause
    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where)
        .filter((key) => /^[a-zA-Z0-9_]+$/.test(key)) // Sanitize keys
        .map((key) => `\`${key}\` = ?`);

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
        const validKeys = Object.keys(where).filter((key) =>
          /^[a-zA-Z0-9_]+$/.test(key),
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
        params.push(...validKeys.map((k) => where[k]));
      }
    }

    // Execute query
    const [rows] = await this.pool.query<CountResult[]>(sql, params);
    return rows[0]?.total ?? 0;
  }
}
