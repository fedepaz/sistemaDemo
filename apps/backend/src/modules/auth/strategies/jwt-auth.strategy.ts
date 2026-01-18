// src/modules/auth/strategies/jwt-auth.strategy.ts

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

import { AuthStrategy } from '../interfaces/auth-strategy.abstract';
import { UserAuthRepository } from '../repositories/userAuth.repository';
import { AuthUser } from '../types/auth-user.type';

interface JwtPayload {
  sub: string; // userId
  tenantId: string;
  roleId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthStrategy extends AuthStrategy {
  private readonly logger = new Logger(JwtAuthStrategy.name);
  private readonly jwtSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserAuthRepository,
  ) {
    super();
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'your-secret-key-change-me-in-production';

    if (this.jwtSecret === 'your-secret-key-change-me-in-production') {
      this.logger.warn(
        '⚠️ WARNING: Using default JWT secret! Set JWT_SECRET in .env',
      );
    }
  }

  getName(): string {
    return 'JwtAuthStrategy';
  }

  async authenticate(request: Request): Promise<boolean> {
    try {
      // 1. Extract token from Authorization header
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        this.logger.debug('❌ No token found in Authorization header');
        throw new UnauthorizedException('Missing authentication token');
      }

      // 2. Verify and decode JWT
      const payload = this.verifyToken(token);

      // 3. Fetch user from database (validate user still exists and is active)
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        this.logger.warn(`❌ User not found: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        this.logger.warn(`❌ User inactive: ${payload.sub}`);
        throw new UnauthorizedException('User account is deactivated');
      }

      // 4. Verify tenant is still active
      const tenant = await this.userRepository.findTenantById(user.tenantId);
      if (!tenant) {
        this.logger.warn(`❌ Tenant inactive: ${user.tenantId}`);
        throw new UnauthorizedException('Tenant is inactive');
      }

      // 5. Attach user to request (clean, no clerkId!)
      request.user = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        roleId: user.roleId,
      } as AuthUser;

      this.logger.debug(
        `✅ JWT Auth Success | User: ${user.email} | Tenant: ${user.tenantId}`,
      );

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('JWT authentication error:', error);
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  /**
   * Extract JWT token from Authorization header
   * Expected format: "Bearer <token>"
   */
  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      this.logger.warn(
        '❌ Invalid Authorization header format (expected: Bearer <token>)',
      );
      return null;
    }

    return token;
  }

  /**
   * Verify JWT token and return payload
   */
  private verifyToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;

      // Validate payload structure
      if (!payload.sub || !payload.tenantId || !payload.roleId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.debug('❌ Token expired');
        throw new UnauthorizedException('Token has expired');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        this.logger.debug('❌ Invalid token');
        throw new UnauthorizedException('Invalid token');
      }

      throw error;
    }
  }
}
