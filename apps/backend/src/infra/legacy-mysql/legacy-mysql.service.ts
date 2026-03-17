// src/infra/legacy-mysql/legacy-mysql.service.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { LEGACY_DB_TOKEN, LegacyDbConnection } from './legacy-mysql.provider';
import { LegacyAgent, LegacyOperation } from './legacy-mysql.types';

@Injectable()
export class LegacyMysqlService {
  private readonly logger = new Logger('LegacyMysqlService');
  private readonly pool: Pool;
  constructor(
    @Inject(LEGACY_DB_TOKEN)
    private readonly legacyDb: LegacyDbConnection,
  ) {
    this.pool = legacyDb.getPool();
  }

  /**
   * Generic query helper using parameterized statements.
   * SECURITY: Always use 'params' for user-provided data. NEVER concatenate strings directly into SQL.
   */
  async query<T extends RowDataPacket[]>(
    sql: string,
    params?: any[],
  ): Promise<T> {
    this.logger.warn(
      `Potentially unsafe query detected: ${sql.substring(0, 100)} ...`,
    );

    this.logger.debug(`Executing query: `, { sql: sql.trim(), params });
    const [rows] = await this.pool.query<T>(sql, params);
    return rows;
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

  // Example: specific table methods (add as needed)
  async getAgentes(): Promise<LegacyAgent[]> {
    return this.query<LegacyAgent[]>('SELECT codigo, nombre FROM agentes');
  }

  async getOperacionByCodigo(codigo: string): Promise<LegacyOperation | null> {
    const [rows] = await this.pool.query<LegacyOperation[]>(
      'SELECT * FROM st_operacion WHERE codigo = ?',
      [codigo],
    );
    return rows[0] ?? null;
  }

  /**
   * Pagination helper for large datasets (200k+ entries)
   */
  async getOperacionesPaginated(
    page: number,
    limit: number,
    filters?: Partial<{ fecha_desde: string; fecha_hasta: string }>,
  ) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM st_operacion';
    const params: any[] = [];

    if (filters?.fecha_desde || filters?.fecha_hasta) {
      sql += ' WHERE 1=1';
      if (filters.fecha_desde) {
        sql += ' AND fecha >= ?';
        params.push(filters.fecha_desde);
      }
      if (filters.fecha_hasta) {
        sql += ' AND fecha <= ?';
        params.push(filters.fecha_hasta);
      }
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return this.query(sql, params);
  }
}
