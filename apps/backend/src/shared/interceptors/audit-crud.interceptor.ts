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
import { Request } from 'express';
import { AuditActionType, EntityType } from '../../generated/prisma/enums';
import { AuditService } from '../../modules/auditLog/audit.service';
import { AuditEventEmitter } from '../../modules/auditLog/events/audit-event.emitter';
import { AuditCrudEvent } from '../../modules/auditLog/events/audit.events';

const METHOD_TO_ACTION: Record<string, AuditActionType> = {
  POST: AuditActionType.CREATE,
  PUT: AuditActionType.UPDATE,
  PATCH: AuditActionType.UPDATE,
  DELETE: AuditActionType.DELETE,
};

@Injectable()
export class AuditCrudInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditCrudInterceptor.name);

  constructor(
    @Optional()
    private readonly auditService?: AuditService,
    @Optional()
    private readonly auditEventEmitter?: AuditEventEmitter,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const action = METHOD_TO_ACTION[request.method];

    if (!action) {
      return next.handle();
    }

    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          this.saveAuditLog({
            request,
            action,
            responseBody,
            durationMs: Date.now() - startedAt,
          }).catch((err: unknown) =>
            this.logger.error({ err }, 'Failed to save CRUD audit log'),
          );
        },
        error: () => {
          // Errors are already handled by GlobalExceptionFilter
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
    request: Request;
    action: AuditActionType;
    responseBody: unknown;
    durationMs: number;
  }): Promise<void> {
    if (!this.auditService) {
      this.logger.warn('No AuditService, skipping CRUD audit log');
      return;
    }

    const userId =
      (request as unknown as { user?: { id?: string } }).user?.id ??
      'anonymous';
    const tenantId =
      (request as unknown as { user?: { tenantId?: string } }).user?.tenantId ??
      'unknown';
    const ip = this.getClientIp(request);
    const userAgent = request.headers?.['user-agent'] ?? 'unknown';
    const entityType = this.resolveEntityType(request.url);
    const entityId = this.resolveEntityId(request, responseBody);
    const requestId =
      (request as unknown as { requestId?: string }).requestId ?? 'unknown';

    const sanitizedBody = this.sanitizeBody(request.body);

    const event: AuditCrudEvent = {
      tenantId,
      userId,
      action: action as 'CREATE' | 'UPDATE' | 'DELETE',
      entityType,
      entityId,
      timestamp: new Date(),
      ipAddress: ip,
      userAgent,
      changes: {
        requestId,
        endpoint: request.url,
        method: request.method,
        params: request.params,
        query: request.query,
        body: sanitizedBody as Record<string, unknown>,
        affected: this.extractAffected(responseBody),
        durationMs,
      },
    };

    if (this.auditEventEmitter) {
      this.auditEventEmitter.emitCrud(event);
    } else {
      await this.auditService.logEvent(event);
    }
  }

  private resolveEntityType(url: string): EntityType {
    const segments = url.split('/').filter(Boolean);
    for (const segment of segments) {
      const clean = segment.split('?')[0].toLowerCase();
      if (clean === 'auditlog') return EntityType.AUDIT_LOG;
      const singular = clean.endsWith('s') ? clean.slice(0, -1) : clean;
      const enumKey = singular.toUpperCase();
      if (Object.values(EntityType).includes(enumKey as EntityType)) {
        return enumKey as EntityType;
      }
    }
    return EntityType.UNKNOWN;
  }

  private resolveEntityId(request: Request, responseBody: unknown): string {
    const body = responseBody as Record<string, unknown> | undefined;
    return (
      body?.id?.toString() ??
      (body?.data as Record<string, unknown>)?.id?.toString() ??
      request.params?.id?.toString() ??
      this.resolveEntityIdFromBody(request.body)
    );
  }

  private resolveEntityIdFromBody(body: unknown): string {
    if (!body || typeof body !== 'object') return 'unknown';

    const record = body as Record<string, unknown>;
    if (record.id !== undefined && typeof record.id === 'string')
      return record.id;

    const compositeParts: string[] = [];
    for (const key of ['partida', 'ano', 'indice', 'userId', 'tenantId']) {
      if (record[key] !== undefined && typeof record[key] === 'string')
        compositeParts.push(`${key}:${record[key]}`);
    }
    if (compositeParts.length) return compositeParts.join('|');

    return 'unknown';
  }

  private extractAffected(
    body: unknown,
  ): { id: string } | { count: number } | null {
    if (!body) return null;
    const record = body as Record<string, unknown>;
    if (record.id !== undefined && typeof record.id === 'string')
      return { id: record.id };
    const data = record.data as Record<string, unknown> | undefined;
    if (data?.id !== undefined && typeof data.id === 'string')
      return { id: data.id };
    if (record.count !== undefined && typeof record.count === 'number')
      return { count: record.count };
    return null;
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;

    const REDACTED_KEYS = new Set([
      'password',
      'passwordhash',
      'currentpassword',
      'newpassword',
      'secret',
      'token',
      'accesstoken',
      'refreshtoken',
      'authorization',
      'apikey',
    ]);

    const sanitize = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(sanitize);
      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([k, v]) => [
            k,
            REDACTED_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : sanitize(v),
          ]),
        );
      }
      return value;
    };

    return sanitize(body);
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers?.['x-forwarded-for'];
    if (forwarded) {
      return Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0].trim();
    }
    const socket = request.socket as { remoteAddress?: string } | undefined;
    const connection = (
      request as unknown as { connection?: { remoteAddress?: string } }
    ).connection;
    return socket?.remoteAddress ?? connection?.remoteAddress ?? 'unknown';
  }
}
