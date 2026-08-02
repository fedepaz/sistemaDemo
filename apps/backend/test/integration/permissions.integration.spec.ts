// apps/backend/test/integration/permissions.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createPermissionsMock } from './helpers/mock-factories';

describe('Permissions (integration)', () => {
  let app: INestApplication;
  let permissionsMock: ReturnType<typeof createPermissionsMock>;

  beforeAll(async () => {
    permissionsMock = createPermissionsMock();
    app = await createTestApp({ permissions: permissionsMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /permissions/me', () => {
    it('returns 200 + user permissions', async () => {
      permissionsMock.getUserPermissionsByUserId.mockResolvedValue({
        userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        permissions: [
          {
            entityId: 'e1',
            tableName: 'users',
            canRead: true,
            canCreate: true,
            canUpdate: false,
            canDelete: false,
            scope: 'ALL',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/permissions/me')
        .expect(200);

      expect(response.body).toHaveProperty('permissions');
      expect(
        Array.isArray(
          (response.body as { permissions: unknown[] }).permissions,
        ),
      ).toBe(true);
      expect(permissionsMock.getUserPermissionsByUserId).toHaveBeenCalled();
    });
  });

  describe('GET /permissions/tables', () => {
    it('returns 200 + list of permission tables', async () => {
      permissionsMock.getAllTables.mockResolvedValue([
        { id: 'e1', name: 'users', description: 'Users entity' },
      ]);

      const response = await request(app.getHttpServer())
        .get('/permissions/tables')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(permissionsMock.getAllTables).toHaveBeenCalled();
    });
  });

  describe('GET /permissions/user/:userId', () => {
    it('returns 200 + permissions for specific user', async () => {
      permissionsMock.getUserPermissionsByUserId.mockResolvedValue({
        userId: 'target-user-id',
        permissions: [],
      });

      const response = await request(app.getHttpServer())
        .get('/permissions/user/target-user-id')
        .expect(200);

      expect(response.body).toHaveProperty('userId', 'target-user-id');
      expect(permissionsMock.getUserPermissionsByUserId).toHaveBeenCalledWith(
        'target-user-id',
      );
    });
  });

  describe('GET /permissions/table/:tableName', () => {
    it('returns 200 + table permissions', async () => {
      permissionsMock.getTableByName.mockResolvedValue({
        id: 'e1',
        name: 'users',
        description: 'Users entity',
      });

      const response = await request(app.getHttpServer())
        .get('/permissions/table/users')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'users');
      expect(permissionsMock.getTableByName).toHaveBeenCalledWith('users');
    });
  });

  describe('PATCH /permissions/user/:userId', () => {
    it('returns 200 on successful permission update', async () => {
      permissionsMock.setPermissionsForUser.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .patch('/permissions/user/target-user-id')
        .send({
          permissions: [
            {
              entityId: 'e1',
              canRead: true,
              canCreate: false,
              canUpdate: false,
              canDelete: false,
              scope: 'OWN',
            },
          ],
        })
        .expect(200);

      expect(permissionsMock.setPermissionsForUser).toHaveBeenCalled();
    });
  });
});
