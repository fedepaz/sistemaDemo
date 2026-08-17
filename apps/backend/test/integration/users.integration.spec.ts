// apps/backend/test/integration/users.integration.spec.ts
import {
  INestApplication,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import {
  createUsersMock,
  createTenantsMock,
  createPermissionsMock,
} from './helpers/mock-factories';
import { mockUser } from './fixtures/fixtures';

describe('Users (integration)', () => {
  let app: INestApplication;
  let usersMock: ReturnType<typeof createUsersMock>;
  let tenantsMock: ReturnType<typeof createTenantsMock>;
  let permissionsMock: ReturnType<typeof createPermissionsMock>;

  beforeAll(async () => {
    usersMock = createUsersMock();
    tenantsMock = createTenantsMock();
    permissionsMock = createPermissionsMock();

    // Mock tenants for GET /users/me (controller calls getTenantById)
    tenantsMock.getTenantById.mockResolvedValue({
      id: '12345678-1234-1234-1234-123456789012',
      name: 'Test Tenant',
      isActive: true,
    });

    // Mock permissions for GET /users/all (controller calls canPerform)
    permissionsMock.canPerform.mockResolvedValue(true);

    app = await createTestApp({
      users: usersMock,
      tenants: tenantsMock,
      permissions: permissionsMock,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/me', () => {
    it('returns 200 + current user profile', async () => {
      usersMock.getProfile.mockResolvedValue(mockUser());

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
      expect(usersMock.getProfile).toHaveBeenCalled();
    });
  });

  describe('GET /users/all', () => {
    it('returns 200 + list of users', async () => {
      usersMock.getAllUsers.mockResolvedValue([mockUser()]);

      const response = await request(app.getHttpServer())
        .get('/users/all')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(usersMock.getAllUsers).toHaveBeenCalled();
    });

    it('returns 200 + empty array when no users', async () => {
      usersMock.getAllUsers.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/users/all')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /users/username/:username', () => {
    it('returns 200 + user by username', async () => {
      usersMock.getUserByUsername.mockResolvedValue(mockUser());

      const response = await request(app.getHttpServer())
        .get('/users/username/testuser')
        .expect(200);

      expect(response.body).toHaveProperty('username', 'testuser');
      expect(usersMock.getUserByUsername).toHaveBeenCalledWith('testuser');
    });

    it('returns 404 when user not found', async () => {
      usersMock.getUserByUsername.mockRejectedValue(
        new NotFoundException('Usuario no encontrado'),
      );

      await request(app.getHttpServer())
        .get('/users/username/nonexistent')
        .expect(404);
    });
  });

  describe('PATCH /users/:username', () => {
    it('returns 200 + updated user', async () => {
      const updatedUser = { ...mockUser(), firstName: 'Updated' };
      usersMock.updateProfile.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .patch('/users/testuser')
        .send({ firstName: 'Updated' })
        .expect(200);

      expect(response.body).toHaveProperty('firstName', 'Updated');
      expect(usersMock.updateProfile).toHaveBeenCalledWith(
        'testuser',
        expect.objectContaining({ firstName: 'Updated' }),
      );
    });
  });

  describe('DELETE /users/:username', () => {
    it('returns 200 on successful soft delete', async () => {
      usersMock.softRemoveUserByUsername.mockResolvedValue({ success: true });

      await request(app.getHttpServer()).delete('/users/testuser').expect(200);

      expect(usersMock.softRemoveUserByUsername).toHaveBeenCalledWith(
        'testuser',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      );
    });
  });

  describe('GET /users/to-activate', () => {
    it('returns 200 + list of pending users', async () => {
      usersMock.getToActivate.mockResolvedValue([
        { id: 'user-2', username: 'pending', isActive: false },
      ]);

      const response = await request(app.getHttpServer())
        .get('/users/to-activate')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(usersMock.getToActivate).toHaveBeenCalled();
    });

    it('returns 200 + empty array when no pending users', async () => {
      usersMock.getToActivate.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/users/to-activate')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('PATCH /users/activate/:userId', () => {
    it('returns 200 + success on activation', async () => {
      usersMock.activateUserById.mockResolvedValue({
        success: true,
        message: 'Usuario activado exitosamente',
      });

      const response = await request(app.getHttpServer())
        .patch('/users/activate/user-2')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(usersMock.activateUserById).toHaveBeenCalledWith(
        'user-2',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      );
    });

    it('returns 400 when user is already active', async () => {
      usersMock.activateUserById.mockRejectedValue(
        new BadRequestException('User is already active'),
      );

      await request(app.getHttpServer())
        .patch('/users/activate/user-1')
        .expect(400);
    });
  });
});
