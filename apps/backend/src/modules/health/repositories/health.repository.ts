// src/modules/health/repositories/health.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class HealthRepository {
  constructor(private readonly prisma: PrismaService) {}
  async checkDatabaseHealth(timeoutMs: number): Promise<boolean> {
    return this.prisma.checkHealth(timeoutMs);
  }
}
