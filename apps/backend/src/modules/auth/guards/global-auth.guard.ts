// src/auth/global-auth.guard.ts

import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';
import { TraceableRequest } from '../../../shared/interfaces/request.interface';
import { AuthUser } from '../types/auth-user.type';

@Injectable()
export class GlobalAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(GlobalAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<TraceableRequest>();
    const requestId = request.requestId || 'no-id';

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug(`[${requestId}] PUBLIC ACCESS: ${request.url}`);
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: AuthUser,
    info: any,
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest<TraceableRequest>();
    const requestId = request.requestId || 'no-id';

    if (err || !user) {
      this.logger.warn(
        `[${requestId}] AUTH FAILED | URL: ${request.url} | Reason: ${
          (info as Error)?.message || 'Unauthorized'
        }`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return super.handleRequest(err, user, info, context);
    }

    this.logger.debug(`[${requestId}] AUTH SUCCESS | User: ${user.username}`);
    return user;
  }
}
