// src/auth/strategies/clerk-auth.strategy.ts

import {
  UnauthorizedException,
  Injectable,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { AuthStrategy } from '../interfaces/auth-strategy.abstract';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { ClerkJWTPayload } from '../types/clerk-payload.type';

@Injectable()
export class ClerkAuthStrategy implements AuthStrategy {
  private readonly logger = new Logger(ClerkAuthStrategy.name);
  private readonly secretKey: string;
  private readonly defaultTenantId: string;
  private readonly clerk: ReturnType<typeof createClerkClient>;

  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const key = this.config.get<string>('config.clerk.secretKey');
    const defaultTenantId = this.config.get<string>('config.defaultTenantId');
    if (!key) {
      throw new ForbiddenException('Secret key is not configured');
    }
    if (!defaultTenantId) {
      throw new ForbiddenException('Default tenant ID is not configured');
    }

    this.secretKey = key;

    this.defaultTenantId = defaultTenantId;
    this.clerk = createClerkClient({
      secretKey: key,
    });
  }

  getName(): string {
    return 'ClerkAuthStrategy';
  }

  async authenticate(request: Request): Promise<boolean> {
    try {
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException('No authentication token provided');
      }

      // ✅ Clerk verifies: "Yes, this is a real user"
      const payload = await verifyToken(token, {
        secretKey: this.secretKey,
      });

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      this.logger.debug(`🔍 Token verified for clerkId: ${payload.sub}`);

      // ✅ Get tenantId (stored in Clerk during YOUR signup flow)
      //const tenantId = this.extractTenantId(payload);

      const userInfo = await this.clerk.users.getUser(payload.sub);

      // Extract user details from Clerk's userInfo
      const primaryEmailAddress = userInfo.emailAddresses.find(
        (email) => email.id === userInfo.primaryEmailAddressId,
      );
      const email = primaryEmailAddress
        ? primaryEmailAddress.emailAddress
        : userInfo.emailAddresses[0]?.emailAddress;

      if (!email) {
        throw new UnauthorizedException('User has no email address.');
      }

      // ✅ YOUR database manages the rest (role, permissions, etc.)
      const user = await this.authService.findOrCreateUser({
        clerkId: payload.sub,
        email,
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        tenantId: this.defaultTenantId,
      });

      request.user = {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        tenantId: user.tenantId,
        roleId: user.roleId,
      };

      this.logger.log(
        `✅ CLERK AUTH SUCCESS | User: ${user.email} (ID: ${user.id}, ClerkID: ${user.clerkId}) | Tenant: ${user.tenantId}`,
      );

      const allUsers = await this.authService.findAllByTenantId(user.tenantId);

      this.logger.log(`✅ USERS: ${JSON.stringify(allUsers, null, 2)}`);

      return true;
    } catch (error) {
      this.logger.error(
        '❌ CLERK AUTH FAILED',
        error instanceof Error ? error.message : 'Unknown error',
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  private extractTenantId(payload: ClerkJWTPayload): string {
    // From public metadata (YOU set this during signup)
    if (payload.public_metadata?.tenantId) {
      return payload.public_metadata.tenantId;
    }

    // Or from Clerk Organizations
    if (payload.org_id) {
      return payload.org_id;
    }

    throw new UnauthorizedException(
      'No tenant assignment found. Please complete onboarding.',
    );
  }
}
