// src/infra/legacy-mysql/legacy-mysql.service.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { LEGACY_DB_TOKEN, LegacyDbConnection } from './legacy-mysql.provider';

@Injectable()
export class LegacyMysqlService {
  private readonly logger = new Logger('LegacyMysqlService');
  private readonly pool: Pool;
  private readonly isProd: boolean;

  constructor(
    @Inject(LEGACY_DB_TOKEN)
    private readonly legacyDb: LegacyDbConnection,
    private readonly configService: ConfigService,
  ) {
    this.pool = legacyDb.getPool();
    this.isProd =
      this.configService.get<string>('config.environment') === 'production';
  }

  /**
   * Generic query helper using parameterized statements.
   * SECURITY: Always use 'params' for user-provided data. NEVER concatenate strings directly into SQL.
   */
  async query<T extends RowDataPacket[]>(
    sql: string,
    params?: any[],
  ): Promise<T> {
    // Perform basic SQL injection checks in non-production environments
    if (!this.isProd && this.hasUnsafePattern(sql)) {
      this.logger.warn(
        `🛑 POTENTIALLY UNSAFE QUERY DETECTED in non-prod environment: ${sql.trim()}`,
      );
    }

    this.logger.debug(`Executing query: `, { sql: sql.trim(), params });

    try {
      const [rows] = await this.pool.query<T>(sql, params);
      return rows;
    } catch (error) {
      this.logger.error(`❌ Legacy query failed: ${sql}`, error);
      throw error;
    }
  }
  /**
   * Helper: Detect basic SQL injection patterns (dev-only guard)
   */
  private hasUnsafePattern(sql: string): boolean {
    const unsafePatterns = [
      /\bOR\s+1\s*=\s*1\b/i,
      /;\s*DROP\b/i,
      /;\s*DELETE\b/i,
      /'\s*OR\s*'/i,
    ];
    return unsafePatterns.some((pattern) => pattern.test(sql));
  }

  /**
   * Optional: Execute within a transaction for multi-step legacy writes
   */
  async transaction<T>(
    callback: (connection: PoolConnection) => Promise<T>,
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      this.logger.error('❌ Legacy transaction failed', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
