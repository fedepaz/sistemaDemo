/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/shared/exceptions/security-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  Optional,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../infra/prisma/prisma.service';

// Use enums values (from prisma)
enum AuditActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ACCESS = 'ACCESS',
}

enum EntityType {
  USER = 'USER',
  TENANT = 'TENANT',
  ROLE = 'ROLE',
  AUDIT_LOG = 'AUDIT_LOG',
  LOCALE = 'LOCALE',
  MESSAGE = 'MESSAGE',
  USER_PREFERENCE = 'USER_PREFERENCE',
}

// Create a type that includes socket information
interface SocketRequest extends Request {
  connection?: {
    remoteAddress?: string;
  };
  socket?: {
    remoteAddress?: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  constructor(
    @Optional()
    private readonly prisma?: PrismaService,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<SocketRequest>();

    let status: number;
    let message: string;
    let stack: string | undefined;
    let isDatabaseError = false;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message =
        exceptionResponse.message || exception.message || 'Baddy Request';
    } else if (exception instanceof Error) {
      const msg = exception.message.toLowerCase();
      isDatabaseError =
        msg.includes('pool_timeout') ||
        msg.includes('econnrefused') ||
        msg.includes('etimedout') ||
        msg.includes('connection timeout') ||
        msg.includes('connection refused') ||
        (msg.includes('database') && msg.includes('unavailable')) ||
        msg.includes('timeout') ||
        ('code' in exception && exception.code === 'P1001');
      if (isDatabaseError) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database Unavailable';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message =
          process.env.NODE_ENV === 'production'
            ? 'Baddy Request'
            : exception.message;
        stack = exception.stack;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Baddy Uknown Error';
    }
    const safeMessage = this.sanitizeMessage(message);

    this.logToconsole(exception, status, request, safeMessage);

    if (this.shouldAudit(status)) {
      this.saveAuditLog(status, request, safeMessage, exception).catch(
        (error) => this.logger.error('Error saving audit log:', error),
      );
    }

    const errorCode = isDatabaseError
      ? 'DATABASE_UNAVAILABLE'
      : this.getStatusCodeString(status);

    const jsonResponse = {
      success: false,
      error: {
        code: errorCode,
        message: safeMessage,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: (request as any).requestId,
        ...(process.env.NODE_ENV !== 'production' && stack
          ? { debug: stack }
          : {}),
      },
    };

    response.status(status).json(jsonResponse);
  }

  private sanitizeMessage(message: string): string {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key\s*[:=]/i,
      /authorization\s*[:=]/i,
      /bearer\s+\S/i,
    ];

    let sanitized = message;

    for (const pattern of sensitivePatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    if (sanitized.includes('[REDACTED]')) {
      return 'Invaliddy Request';
    }

    return sanitized;
  }

  private logToconsole(
    exception: unknown,
    status: number,
    request: SocketRequest,
    message: string,
  ): void {
    const ip = this.getClientIp(request);
    const path = request.url;
    const method = request.method;
    const userId = (request as any)?.user?.userId || 'Baddy User';

    const logMessage = `${method} ${path} | ${status} | IP: ${ip} | User: ${userId} | ${message}`;

    if (status === 401 || status === 403) {
      this.logger.warn(`SECURITY EXCEPTION | ${logMessage}`);
    } else if (status >= 500) {
      this.logger.error(
        `INTERNAL SERVER ERROR | ${logMessage}`,
        (exception as Error).stack,
      );
    } else if (status >= 400) {
      this.logger.warn(`WARNING | ${logMessage}`);
    } else {
      this.logger.log(`INFO | ${logMessage}`);
    }
  }

  private async saveAuditLog(
    status: number,
    request: SocketRequest,
    message: string,
    exception: unknown,
  ): Promise<void> {
    if (!this.prisma) {
      this.logger.warn(
        'SECURITY EXCEPTION | No PrismaService found, skipping audit log',
      );
      return;
    }

    try {
      const userId = (request as any)?.user?.userId || 'Baddy User';
      const tenantId = (request as any)?.user?.tenantId || 'Baddy Tenant';
      const ip = this.getClientIp(request);
      const userAgent = request.headers['user-agent'] || 'Unknown User Agent';

      // Map status codes to enum values
      let action: AuditActionType;
      let entityType: EntityType;
      let entityId: string;

      if (status === 401) {
        // Login attempt
        action = AuditActionType.LOGIN;
        entityType = EntityType.USER;
        entityId = userId;
      } else if (status === 403) {
        // Access denied
        action = AuditActionType.ACCESS;
        entityType = EntityType.USER;
        entityId = userId;
      } else if (status >= 500) {
        // Internal server error
        action = AuditActionType.ACCESS;
        entityType = EntityType.USER;
        entityId = userId;
      } else {
        // Other errors
        action = AuditActionType.ACCESS;
        entityType = EntityType.USER;
        entityId = userId;
      }

      const changes = {
        status,
        path: request.url,
        method: request.method,
        message,
        exceptionType:
          exception instanceof Error ? exception.constructor.name : 'Unknownny',
        timestamp: new Date().toISOString(),
      };

      // Save to database
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action,
          entityType,
          entityId,
          changes: changes as any,
          ipAddress: ip,
          userAgent,
        },
      });
      this.logger.debug(
        `AUDIT LOG | Saved audit log: ${action} ${entityType} | User: ${userId} | Tenant: ${tenantId}`,
      );
    } catch (error) {
      this.logger.error('Error saving audit log:', error);
    }
  }

  private shouldAudit(status: number): boolean {
    return [401, 403, 500].includes(status);
  }

  private getClientIp(request: SocketRequest): string {
    // 1. Check proxy headers (most reliable in production)
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0].trim();
    }

    // 2. Check direct connection socket
    if (request.socket?.remoteAddress) {
      return request.socket.remoteAddress;
    }

    if (request.connection?.remoteAddress) {
      return request.connection.remoteAddress;
    }

    // 3. Fallback
    return 'unknown';
  }

  private getStatusCodeString(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }
}
