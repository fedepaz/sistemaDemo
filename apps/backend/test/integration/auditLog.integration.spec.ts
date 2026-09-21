// apps/backend/test/integration/auditLog.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createAuditLogMock } from './helpers/mock-factories';
import {
  mockAuditLogPaginatedResponse,
  mockAuditLogEntry,
} from './fixtures/fixtures';

describe('AuditLog (integration)', () => {
  let app: INestApplication;
  let auditLogMock: ReturnType<typeof createAuditLogMock>;

  beforeAll(async () => {
    auditLogMock = createAuditLogMock();
    app = await createTestApp({ auditLog: auditLogMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /auditLog', () => {
    it('returns 200 + paginated audit logs', async () => {
      auditLogMock.getAllAuditLogs.mockResolvedValue(
        mockAuditLogPaginatedResponse(),
      );

      const response = await request(app.getHttpServer())
        .get('/auditLog')
        .expect(200);

      const body = response.body as {
        data: unknown[];
        total: number;
      };
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('total');
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data).toHaveLength(1);
      expect(body.data[0]).toHaveProperty('action');
      expect(body.data[0]).toHaveProperty('entityType');
      expect(auditLogMock.getAllAuditLogs).toHaveBeenCalledWith(1, 50);
    });

    it('returns 200 + paginated results with custom page/limit', async () => {
      auditLogMock.getAllAuditLogs.mockResolvedValue({
        data: [mockAuditLogEntry()],
        total: 100,
        page: 2,
        limit: 10,
      });

      const response = await request(app.getHttpServer())
        .get('/auditLog?page=2&limit=10')
        .expect(200);

      const body = response.body as { page: number; limit: number };
      expect(body).toHaveProperty('page', 2);
      expect(body).toHaveProperty('limit', 10);
      expect(auditLogMock.getAllAuditLogs).toHaveBeenCalledWith(2, 10);
    });

    it('returns 200 + empty data when no logs exist', async () => {
      auditLogMock.getAllAuditLogs.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 50,
      });

      const response = await request(app.getHttpServer())
        .get('/auditLog')
        .expect(200);

      const body = response.body as { data: unknown[]; total: number };
      expect(body.data).toEqual([]);
      expect(body.total).toBe(0);
    });

    it('clamps limit to max 100', async () => {
      auditLogMock.getAllAuditLogs.mockResolvedValue(
        mockAuditLogPaginatedResponse(),
      );

      await request(app.getHttpServer()).get('/auditLog?limit=999').expect(200);

      expect(auditLogMock.getAllAuditLogs).toHaveBeenCalledWith(1, 100);
    });

    it('defaults page to 1 when invalid', async () => {
      auditLogMock.getAllAuditLogs.mockResolvedValue(
        mockAuditLogPaginatedResponse(),
      );

      await request(app.getHttpServer()).get('/auditLog?page=abc').expect(200);

      expect(auditLogMock.getAllAuditLogs).toHaveBeenCalledWith(1, 50);
    });
  });

  describe('GET /auditLog/:tenantName', () => {
    it('returns 200 + audit logs for tenant', async () => {
      auditLogMock.getAllByTenantName.mockResolvedValue({
        data: [mockAuditLogEntry()],
        total: 1,
        page: 1,
        limit: 50,
      });

      const response = await request(app.getHttpServer())
        .get('/auditLog/my-tenant')
        .expect(200);

      const body = response.body as { data: unknown[] };
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(1);
      expect(auditLogMock.getAllByTenantName).toHaveBeenCalledWith(
        'my-tenant',
        1,
        50,
      );
    });

    it('returns 200 + empty data for tenant with no logs', async () => {
      auditLogMock.getAllByTenantName.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 50,
      });

      const response = await request(app.getHttpServer())
        .get('/auditLog/empty-tenant')
        .expect(200);

      const body = response.body as { data: unknown[] };
      expect(body.data).toEqual([]);
    });

    it('returns 200 with custom pagination for tenant', async () => {
      auditLogMock.getAllByTenantName.mockResolvedValue({
        data: [],
        total: 50,
        page: 3,
        limit: 20,
      });

      await request(app.getHttpServer())
        .get('/auditLog/my-tenant?page=3&limit=20')
        .expect(200);

      expect(auditLogMock.getAllByTenantName).toHaveBeenCalledWith(
        'my-tenant',
        3,
        20,
      );
    });
  });

  describe('GET /auditLog/user/:userId', () => {
    it('returns 200 + audit logs for user', async () => {
      auditLogMock.getAllByUserId.mockResolvedValue({
        data: [mockAuditLogEntry()],
        total: 1,
        page: 1,
        limit: 50,
      });

      const response = await request(app.getHttpServer())
        .get('/auditLog/user/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .expect(200);

      const body = response.body as { data: unknown[] };
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(1);
      expect(auditLogMock.getAllByUserId).toHaveBeenCalledWith(
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        1,
        50,
      );
    });

    it('returns 200 + empty data for user with no logs', async () => {
      auditLogMock.getAllByUserId.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 50,
      });

      const response = await request(app.getHttpServer())
        .get('/auditLog/user/nonexistent-user-id')
        .expect(200);

      const body = response.body as { data: unknown[] };
      expect(body.data).toEqual([]);
    });

    it('returns 200 with custom pagination for user', async () => {
      auditLogMock.getAllByUserId.mockResolvedValue({
        data: [],
        total: 25,
        page: 2,
        limit: 10,
      });

      await request(app.getHttpServer())
        .get(
          '/auditLog/user/a1b2c3d4-e5f6-7890-abcd-ef1234567890?page=2&limit=10',
        )
        .expect(200);

      expect(auditLogMock.getAllByUserId).toHaveBeenCalledWith(
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        2,
        10,
      );
    });
  });
});
