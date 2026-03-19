// src/modules/health/repositories/health.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  LEGACY_DB_TOKEN,
  LegacyDbConnection,
} from 'src/infra/legacy-mysql/legacy-mysql.provider';

@Injectable()
export class HealthRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(LEGACY_DB_TOKEN)
    private readonly legacyDb: LegacyDbConnection,
  ) {}
  async checkDatabaseHealth(timeoutMs: number): Promise<boolean> {
    return this.prisma.checkHealth(timeoutMs);
  }

  async checkLegacyDatabaseHealth(timeoutMs: number): Promise<boolean> {
    const connection = await this.legacyDb.getPool().getConnection();
    try {
      await Promise.race([
        connection.ping(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Legacy database health check timeout')),
            timeoutMs,
          ),
        ),
      ]);
      return true;
    } catch {
      return false;
    } finally {
      connection.release();
    }
  }
}
