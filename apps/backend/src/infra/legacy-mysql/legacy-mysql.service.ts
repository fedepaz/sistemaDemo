import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool, RowDataPacket } from 'mysql2/promise';
import { LEGACY_DB_TOKEN } from './legacy-mysql.provider';
import { LegacyAgent, LegacyOperation } from './legacy-mysql.types';

@Injectable()
export class LegacyMysqlService {
  private readonly logger = new Logger('LegacyMysqlService');
  constructor(
    @Inject(LEGACY_DB_TOKEN) private readonly pool: Pool,
  ) {}

  /**
   * Generic query helper using parameterized statements.
   * SECURITY: Always use 'params' for user-provided data. NEVER concatenate strings directly into SQL.
   */
  async query<T extends RowDataPacket[]>(
    sql: string,
    params?: any[],
  ): Promise<T> {
    this.logger.debug(`Executing query: ${sql}`, params);
    const [rows] = await this.pool.query<T>(sql, params);
    return rows;
  }

  // Specific table methods
  async getAgents(): Promise<LegacyAgent[]> {
    return this.query<LegacyAgent[]>(`SELECT codigo, nombre FROM agentes`);
  }

  async getOperationsByCodigo(codigo: string): Promise<LegacyOperation | null> {
    const rows = await this.query<LegacyOperation[]>(
      `SELECT * FROM st_operacion WHERE codigo = ?`,
      [codigo],
    );
    return rows[0] ?? null;
  }

  // Efficiently handle large datasets
  async execute(sql: string, params?: any[]) {
    return this.pool.execute(sql, params);
  }
}
