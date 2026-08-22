// apps/backend/test/integration/auth.integration.spec.ts
import {
  INestApplication,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createAuthMock } from './helpers/mock-factories';
import {
  validLoginPayload,
  validRegisterPayload,
  validChangePasswordPayload,
  validRefreshPayload,
  validRestorePasswordPayload,
  mockAuthResponse,
  mockTokens,
} from './fixtures/fixtures';

describe('Auth (integration)', () => {
  let app: INestApplication;
  let authMock: ReturnType<typeof createAuthMock>;

  beforeAll(async () => {
    authMock = createAuthMock();
    app = await createTestApp({ auth: authMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('returns 200 + tokens on valid credentials', async () => {
      authMock.login.mockResolvedValue(mockAuthResponse());

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(validLoginPayload())
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(
        (response.body as { user: Record<string, unknown> }).user,
      ).toHaveProperty('id');
      expect(
        (response.body as { user: Record<string, unknown> }).user,
      ).toHaveProperty('username');
      expect(authMock.login).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ username: 'testuser' }),
      );
    });

    it('returns 401 on invalid credentials', async () => {
      authMock.login.mockRejectedValue(
        new UnauthorizedException('Credenciales inválidas'),
      );

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(validLoginPayload())
        .expect(401);
    });

    it('returns 400 on invalid body (missing password)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'testuser' })
        .expect(400);
    });

    it('returns 400 on invalid body (empty username)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: '', password: 'Pass1234' })
        .expect(400);
    });
  });

  describe('POST /auth/register', () => {
    it('returns 201 + auth response on valid payload', async () => {
      authMock.register.mockResolvedValue(mockAuthResponse());

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterPayload())
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(authMock.register).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'newuser' }),
      );
    });

    it('returns 409 on duplicate username', async () => {
      authMock.register.mockRejectedValue(
        new ConflictException('El nombre de usuario ya existe'),
      );

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterPayload())
        .expect(409);
    });

    it('returns 400 on invalid body (missing username)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ firstName: 'Test' })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('returns 200 + new tokens on valid refresh token', async () => {
      authMock.refreshTokens.mockResolvedValue(mockTokens());

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(validRefreshPayload())
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(authMock.refreshTokens).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
    });

    it('returns 401 on invalid refresh token', async () => {
      authMock.refreshTokens.mockRejectedValue(
        new UnauthorizedException('Token inválido'),
      );

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('returns 400 on missing refreshToken', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('PATCH /auth/password', () => {
    it('returns 200 on valid password change', async () => {
      authMock.changePassword.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .patch('/auth/password')
        .send(validChangePasswordPayload())
        .expect(200);

      expect(authMock.changePassword).toHaveBeenCalledWith(
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        expect.objectContaining({ currentPassword: 'OldPass1' }),
      );
    });

    it('returns 401 when wrong current password', async () => {
      authMock.changePassword.mockRejectedValue(
        new UnauthorizedException('Contraseña actual incorrecta'),
      );

      await request(app.getHttpServer())
        .patch('/auth/password')
        .send({
          currentPassword: 'WrongPass',
          newPassword: 'NewPass1',
        })
        .expect(401);
    });

    it('returns 400 on weak new password', async () => {
      await request(app.getHttpServer())
        .patch('/auth/password')
        .send({
          currentPassword: 'OldPass1',
          newPassword: 'weak',
        })
        .expect(400);
    });

    it('returns 400 on missing fields', async () => {
      await request(app.getHttpServer())
        .patch('/auth/password')
        .send({ currentPassword: 'OldPass1' })
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 200 with success message', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /auth/restore', () => {
    it('returns 200 on successful password restore', async () => {
      authMock.restorePassword.mockResolvedValue({
        success: true,
        message: 'Contraseña de usuario testuser restaurada correctamente',
      });

      const response = await request(app.getHttpServer())
        .patch('/auth/restore')
        .send(validRestorePasswordPayload())
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(authMock.restorePassword).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        }),
      );
    });

    it('returns 400 on missing userId', async () => {
      await request(app.getHttpServer())
        .patch('/auth/restore')
        .send({})
        .expect(400);
    });

    it('returns 400 on empty userId', async () => {
      await request(app.getHttpServer())
        .patch('/auth/restore')
        .send({ userId: '' })
        .expect(400);
    });
  });
});
