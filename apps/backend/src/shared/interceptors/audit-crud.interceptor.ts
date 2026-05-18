/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/shared/interceptors/audit-crud.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Request } from 'express';

enum AuditActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
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

const METHOD_TO_ACTION: Record<string, AuditActionType> = {
  POST: AuditActionType.CREATE,
  PUT: AuditActionType.UPDATE,
  PATCH: AuditActionType.UPDATE,
  DELETE: AuditActionType.DELETE,
};

// Map URL path segments to EntityType
const PATH_TO_ENTITY: Record<string, EntityType> = {
  users: EntityType.USER,
  tenants: EntityType.TENANT,
  roles: EntityType.ROLE,
  locales: EntityType.LOCALE,
  messages: EntityType.MESSAGE,
  preferences: EntityType.USER_PREFERENCE,
};

@Injectable()
export class AuditCrudInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditCrudInterceptor.name);

  constructor(
    @Optional()
    private readonly prisma?: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const action = METHOD_TO_ACTION[request.method];

    // Only audit C/U/D — let reads pass through untouched
    if (!action) {
      return next.handle();
    }

    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          this.logger.debug(
            {
              user: request.user,
              requestId: (request as any).requestId,
              headers: request.headers.authorization,
            },
            'Auditing CRUD',
          );
          // Fire-and-forget — never block the response
          this.saveAuditLog({
            request,
            action,
            responseBody,
            durationMs: Date.now() - startedAt,
          }).catch((err) =>
            this.logger.error({ err }, 'Failed to save CRUD audit log'),
          );
        },
        error: () => {
          // Errors are already handled by GlobalExceptionFilter — skip
        },
      }),
    );
  }

  private async saveAuditLog({
    request,
    action,
    responseBody,
    durationMs,
  }: {
    request: any;
    action: AuditActionType;
    responseBody: any;
    durationMs: number;
  }): Promise<void> {
    if (!this.prisma) {
      this.logger.warn('No PrismaService, skipping CRUD audit log');
      return;
    }

    const userId = request?.user?.id ?? 'anonymous';
    const tenantId = request?.user?.tenantId ?? 'unknown';
    const ip = this.getClientIp(request);
    const userAgent = request.headers?.['user-agent'] ?? 'unknown';

    const entityType = this.resolveEntityType(request.url as string);
    const entityId = this.resolveEntityId(request, responseBody);
    const requestId = request?.requestId ?? 'unknown';

    // Sanitize body before storing — strip sensitive fields
    const sanitizedBody = this.sanitizeBody(request.body);

    const changes = {
      requestId,
      endpoint: request.url,
      method: request.method,
      params: request.params,
      query: request.query,
      body: sanitizedBody,
      // Capture the id(s) affected from the response when available
      affected: this.extractAffected(responseBody),
      durationMs,
      timestamp: new Date().toISOString(),
    };

    try {
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
        `CRUD AUDIT | ${action} ${entityType} (${entityId}) | ` +
          `User: ${userId} | ${durationMs}ms`,
      );
    } catch (err) {
      this.logger.error({ err }, 'Prisma error saving CRUD audit log');
    }
  }

  // Derive EntityType from the URL path, e.g. /api/v1/users/123 → USER
  private resolveEntityType(url: string): EntityType {
    const segments = url.split('/').filter(Boolean);
    for (const segment of segments) {
      const clean = segment.split('?')[0].toLowerCase();
      if (PATH_TO_ENTITY[clean]) return PATH_TO_ENTITY[clean];
    }
    return EntityType.USER; // fallback — adjust to your needs
  }

  // Best-effort entity ID: prefer response.id, then route param, then 'unknown'
  private resolveEntityId(request: any, responseBody: any): string {
    return (
      responseBody?.id?.toString() ??
      responseBody?.data?.id?.toString() ??
      request.params?.id?.toString() ??
      this.resolveEntityIdFromBody(request.body)
    );
  }
  private resolveEntityIdFromBody(body: any): string {
    if (!body) return 'unknown';

    // Explicit id field
    if (body.id) return body.id.toString();

    // Composite keys — build a readable compound id
    const compositeParts: string[] = [];
    for (const key of ['partida', 'ano', 'indice', 'userId', 'tenantId']) {
      if (body[key] !== undefined) compositeParts.push(`${key}:${body[key]}`);
    }
    if (compositeParts.length) return compositeParts.join('|');

    return 'unknown';
  }

  // Pull out ids/counts from the response for the audit record
  private extractAffected(body: any): unknown {
    if (!body) return null;
    if (body.id) return { id: body.id };
    if (body.data?.id) return { id: body.data.id };
    if (body.count) return { count: body.count };
    return null;
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;

    const REDACTED_KEYS = new Set([
      'password',
      'passwordhash',
      'secret',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'apiKey',
    ]);

    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([k, v]) => [
        k,
        REDACTED_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : v,
      ]),
    );
  }

  private getClientIp(request: any): string {
    const forwarded = request.headers?.['x-forwarded-for'];
    if (forwarded) {
      return Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0].trim();
    }
    return (
      request.socket?.remoteAddress ??
      request.connection?.remoteAddress ??
      'unknown'
    );
  }
}
