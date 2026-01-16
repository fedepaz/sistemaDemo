// src/auth/strategies/dev-auth.strategy.ts

import { Injectable, Logger } from '@nestjs/common';
import { AuthStrategy } from '../interfaces/auth-strategy.abstract';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DevAuthStrategy implements AuthStrategy {
  private readonly logger = new Logger(DevAuthStrategy.name);

  constructor(private readonly config: ConfigService) {}

  getName(): string {
    return 'DevAuthStrategy';
  }

  async authenticate(request: Request): Promise<boolean> {
    const env = this.config.get<string>('config.environment');

    if (env === 'production') {
      throw new Error('In production environment');
    }

    if (env !== 'development') {
      throw new Error('Not in development environment');
    }

    try {
      // Add a microtask to satisfy linting (and prepare for real async ops)
      await Promise.resolve(); // No-op that makes method truly async

      // Same logic devauthguard but integrated globally

      request.user = {
        id: 'cmk1mgw6i0001j88x5kkx215h',
        clerkId: 'abc123',
        email: 'dev@example.com',
        tenantId: '12345678-1234-1234-1234-123456789012',
        roleId: 'cmk1lzh3y0000j8l5ojy2xon2',
      };

      this.logger.log('✅ DEV AUTH SUCCESS | Hardcoded user authenticated');
      return true;
    } catch (error) {
      this.logger.error(
        '❌ DEV AUTH FAILED',
        error instanceof Error ? error.message : 'Unknown error',
      );
      return false;
    }
  }
}
