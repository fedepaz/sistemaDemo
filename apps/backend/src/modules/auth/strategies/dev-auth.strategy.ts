// src/auth/strategies/dev-auth.strategy.ts

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthStrategy } from '../interfaces/auth-strategy.abstract';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserAuthRepository } from '../repositories/userAuth.repository';

@Injectable()
export class DevAuthStrategy implements AuthStrategy {
  private readonly logger = new Logger(DevAuthStrategy.name);

  constructor(
    private readonly config: ConfigService,
    private readonly userRepository: UserAuthRepository,
  ) {}

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

    const userId = 'cmklnae6b0003vsj8wu4jf13z';
    try {
      // Add a microtask to satisfy linting (and prepare for real async ops)
      const user = await this.userRepository.findById(userId);
      if (!user) {
        this.logger.warn(`❌ User not found: ${userId}`);
        throw new UnauthorizedException('User not found');
      }

      // Same logic devauthguard but integrated globally

      request.user = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        roleId: user.roleId,
      };

      this.logger.log('✅ DEV AUTH SUCCESS', {
        user: user,
      });
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
