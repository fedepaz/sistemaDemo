/* eslint-disable @typescript-eslint/unbound-method */
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of, noop } from 'rxjs';
import { AuditCrudInterceptor } from '../interceptors/audit-crud.interceptor';
import { AuditService } from '../../modules/auditLog/audit.service';
import { AuditEventEmitter } from '../../modules/auditLog/events/audit-event.emitter';

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

function subscribeAndFlush(observable: Observable<unknown>): Promise<void> {
  observable.subscribe({ next: noop, error: noop });
  return flushPromises();
}

function createMockRequest(overrides: Record<string, unknown> = {}) {
  return {
    method: 'POST',
    url: '/api/users',
    body: { name: 'John' },
    params: {},
    query: {},
    headers: { 'user-agent': 'test-agent' },
    socket: { remoteAddress: '127.0.0.1' },
    user: { id: 'user-1', tenantId: 'tenant-1' },
    ...overrides,
  };
}

describe('AuditCrudInterceptor', () => {
  let interceptor: AuditCrudInterceptor;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockAuditEventEmitter: jest.Mocked<AuditEventEmitter>;
  let mockRequest: ReturnType<typeof createMockRequest>;
  let mockContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuditService = {
      logEvent: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditService>;

    mockAuditEventEmitter = {
      emitCrud: jest.fn(),
    } as unknown as jest.Mocked<AuditEventEmitter>;

    mockRequest = createMockRequest();

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockImplementation(() => mockRequest),
      }),
    } as unknown as jest.Mocked<ExecutionContext>;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ id: 'entity-1', name: 'John' })),
    };
  });

  describe('skip logic', () => {
    it('skips non-CRUD methods (GET)', () => {
      mockRequest = createMockRequest({ method: 'GET' });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      interceptor.intercept(mockContext, mockCallHandler);

      expect(mockCallHandler.handle).toHaveBeenCalled();
      expect(mockAuditEventEmitter.emitCrud).not.toHaveBeenCalled();
      expect(mockAuditService.logEvent).not.toHaveBeenCalled();
    });

    it('skips /auth endpoints', () => {
      mockRequest = createMockRequest({ url: '/auth/login' });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      interceptor.intercept(mockContext, mockCallHandler);

      expect(mockCallHandler.handle).toHaveBeenCalled();
      expect(mockAuditEventEmitter.emitCrud).not.toHaveBeenCalled();
    });
  });

  describe('action mapping', () => {
    it('maps POST to CREATE', async () => {
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      expect(mockAuditEventEmitter.emitCrud).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE' }),
      );
    });

    it('maps PUT to UPDATE', async () => {
      mockRequest = createMockRequest({ method: 'PUT' });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      expect(mockAuditEventEmitter.emitCrud).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE' }),
      );
    });

    it('maps PATCH to UPDATE', async () => {
      mockRequest = createMockRequest({ method: 'PATCH' });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      expect(mockAuditEventEmitter.emitCrud).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE' }),
      );
    });

    it('maps DELETE to DELETE', async () => {
      mockRequest = createMockRequest({ method: 'DELETE' });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      expect(mockAuditEventEmitter.emitCrud).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE' }),
      );
    });
  });

  describe('sanitization', () => {
    it('redacts sensitive fields from body', async () => {
      mockRequest = createMockRequest({
        body: {
          name: 'John',
          password: 'secret123',
          token: 'abc',
          accessToken: 'xyz',
          nested: { passwordHash: 'hash', value: 'keep' },
        },
      });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      const event = mockAuditEventEmitter.emitCrud.mock.calls[0][0];
      expect(event.changes.body).toEqual({
        name: 'John',
        password: '[REDACTED]',
        token: '[REDACTED]',
        accessToken: '[REDACTED]',
        nested: { passwordHash: '[REDACTED]', value: 'keep' },
      });
    });
  });

  describe('entityType resolution', () => {
    it('resolves entityType from URL', async () => {
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      const event = mockAuditEventEmitter.emitCrud.mock.calls[0][0];
      expect(event.entityType).toBe('USER');
    });

    it('resolves auditlog to AUDIT_LOG', async () => {
      mockRequest = createMockRequest({ url: '/api/auditlog' });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      const event = mockAuditEventEmitter.emitCrud.mock.calls[0][0];
      expect(event.entityType).toBe('AUDIT_LOG');
    });

    it('returns UNKNOWN for unrecognized segments', async () => {
      mockRequest = createMockRequest({ url: '/api/unknown-thing' });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      const event = mockAuditEventEmitter.emitCrud.mock.calls[0][0];
      expect(event.entityType).toBe('UNKNOWN');
    });
  });

  describe('fallback to auditService', () => {
    it('uses auditService.logEvent when no emitter provided', async () => {
      interceptor = new AuditCrudInterceptor(mockAuditService);

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE' }),
      );
    });
  });

  describe('missing user', () => {
    it('handles missing user gracefully', async () => {
      mockRequest = createMockRequest({ user: undefined });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      const event = mockAuditEventEmitter.emitCrud.mock.calls[0][0];
      expect(event.userId).toBe('anonymous');
      expect(event.tenantId).toBe('unknown');
    });
  });

  describe('client IP', () => {
    it('extracts IP from X-Forwarded-For header', async () => {
      mockRequest = createMockRequest({
        headers: {
          'x-forwarded-for': '10.0.0.1, 10.0.0.2',
          'user-agent': 'test',
        },
      });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      const event = mockAuditEventEmitter.emitCrud.mock.calls[0][0];
      expect(event.ipAddress).toBe('10.0.0.1');
    });

    it('falls back to socket remoteAddress', async () => {
      mockRequest = createMockRequest({
        headers: { 'user-agent': 'test' },
        socket: { remoteAddress: '192.168.1.1' },
      });
      interceptor = new AuditCrudInterceptor(
        mockAuditService,
        mockAuditEventEmitter,
      );

      const obs = interceptor.intercept(mockContext, mockCallHandler);
      await subscribeAndFlush(obs);

      const event = mockAuditEventEmitter.emitCrud.mock.calls[0][0];
      expect(event.ipAddress).toBe('192.168.1.1');
    });
  });
});
