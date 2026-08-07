import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    refreshTokens: jest.Mock;
    changePassword: jest.Mock;
    restorePassword: jest.Mock;
    logout: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshTokens: jest.fn(),
      changePassword: jest.fn(),
      restorePassword: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      const dto = { username: 'newuser', email: 'new@example.com' };
      const expected = {
        user: { id: 'user-1' },
        accessToken: 'token',
        refreshToken: 'token',
      };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call authService.login with ip and dto', async () => {
      const dto = { username: 'testuser', password: 'Password123' };
      const expected = {
        user: { id: 'user-1' },
        accessToken: 'token',
        refreshToken: 'token',
      };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login('127.0.0.1', dto);

      expect(authService.login).toHaveBeenCalledWith('127.0.0.1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshTokens with refreshToken', async () => {
      const dto = { refreshToken: 'valid-token' };
      const expected = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      };
      authService.refreshTokens.mockResolvedValue(expected);

      const result = await controller.refresh(dto);

      expect(authService.refreshTokens).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual(expected);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword', async () => {
      const dto = { currentPassword: 'OldPass1', newPassword: 'NewPass1' };
      const user = { id: 'user-1', username: 'testuser' };
      authService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(dto, user as any);

      expect(authService.changePassword).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual({
        success: true,
        message: 'Contraseña actualizada correctamente',
      });
    });
  });

  describe('restorePassword', () => {
    it('should call authService.restorePassword with dto', async () => {
      const dto = { userId: 'user-1' };
      const expected = {
        success: true,
        message: 'Contraseña de usuario testuser restaurada correctamente',
      };
      authService.restorePassword.mockResolvedValue(expected);

      const result = await controller.restorePassword(dto);

      expect(authService.restorePassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const user = { id: 'user-1', username: 'testuser', tenantId: 'tenant-1' };
      authService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(user);

      expect(authService.logout).toHaveBeenCalledWith('user-1', 'tenant-1');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
