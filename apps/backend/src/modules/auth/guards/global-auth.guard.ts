// src/auth/global-auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';
import { AuthStrategy } from '../interfaces/auth-strategy.abstract';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  private readonly logger = new Logger(GlobalAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private authStrategy: AuthStrategy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug(`PUBLIC ENDPOINT ${request.url}`);
      return true; // Allow public endpoints to pass
    }

    // Authenticate with the strategy
    this.logger.debug(
      `🔑 AUTH ATTEMPT | Strategy: ${this.authStrategy.getName()} | ${request.method} ${request.url}`,
    );
    try {
      const isAuthenticated = await this.authStrategy.authenticate(request);

      if (isAuthenticated) {
        this.logger.log(
          `✅ AUTH SUCCESS | Strategy: ${this.authStrategy.getName()} | IP: ${this.getClientIp(request)}`,
        );
      } else {
        this.logger.warn(
          `❌ AUTH FAILED | Strategy: ${this.authStrategy.getName()} | IP: ${this.getClientIp(request)}`,
        );
      }

      return isAuthenticated;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown authentication error';

      this.logger.error(
        `🔥 AUTH ERROR | Strategy: ${this.authStrategy.getName()} | ${errorMessage}`,
      );
      throw error; // Let SecurityExceptionFilter handle this
    }
  }

  private getClientIp(request: Request): string {
    return (
      request.headers['x-forwarded-for']?.toString().split(',')[0] ||
      request.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }
}
