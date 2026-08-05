import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserAuthRepository } from '../repositories/userAuth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TenantsRepository } from '../../tenants/repositories/tenants.repository';

jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userAuthRepo: {
    findByUsername: jest.Mock;
    findById: jest.Mock;
    createUser: jest.Mock;
    updatePassword: jest.Mock;
  };
  let tenantRepo: {
    findDefault: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
    verify: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
    getOrThrow: jest.Mock;
  };

  beforeEach(async () => {
    userAuthRepo = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      updatePassword: jest.fn(),
    };

    tenantRepo = {
      findDefault: jest
        .fn()
        .mockResolvedValue({ id: 'tenant-1', name: 'Default' }),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
      verify: jest.fn(),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        const values: Record<string, string> = {
          'config.defaultPassword': '123456',
          'config.jwt.expiresIn': '15m',
          'config.jwt.refreshExpiresIn': '7d',
        };
        return values[key];
      }),
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        const values: Record<string, string> = {
          'config.jwt.secret': 'access-secret',
          'config.jwt.refreshSecret': 'refresh-secret',
          'config.environment': 'development',
        };
        return values[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserAuthRepository, useValue: userAuthRepo },
        { provide: TenantsRepository, useValue: tenantRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed-password',
        isActive: true,
        tenantId: 'tenant-1',
        deletedAt: null,
      };

      userAuthRepo.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // password check
        .mockResolvedValueOnce(false); // default password check

      const result = await service.login({
        username: 'testuser',
        password: 'Password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('isDefaultPassword');
      expect(result.user.id).toBe('user-1');
      expect(result.user.username).toBe('testuser');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      userAuthRepo.findByUsername.mockResolvedValue(null);

      await expect(
        service.login({ username: 'wronguser', password: 'Password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        passwordHash: 'hashed-password',
        isActive: true,
        deletedAt: null,
      };
      userAuthRepo.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ username: 'testuser', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        passwordHash: 'hashed-password',
        isActive: false,
        deletedAt: null,
      };
      userAuthRepo.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ username: 'testuser', password: 'Password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should detect default password', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed-default',
        isActive: true,
        tenantId: 'tenant-1',
        deletedAt: null,
      };

      userAuthRepo.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // password check
        .mockResolvedValueOnce(true); // default password check

      configService.get.mockImplementation((key: string) => {
        if (key === 'config.defaultPassword') return 'Default123';
        return undefined;
      });

      const result = await service.login({
        username: 'testuser',
        password: 'Default123',
      });

      expect(result.isDefaultPassword).toBe(true);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createdUser = {
        id: 'user-2',
        username: 'newuser',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        passwordHash: 'hashed-password',
        tenantId: 'tenant-1',
      };

      userAuthRepo.findByUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      userAuthRepo.createUser.mockResolvedValue(createdUser);

      const result = await service.register({
        username: 'newuser',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe('user-2');
      expect(result.user.username).toBe('newuser');
      expect(userAuthRepo.createUser).toHaveBeenCalled();
    });

    it('should throw ConflictException if username already exists', async () => {
      userAuthRepo.findByUsername.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          username: 'existinguser',
          email: 'new@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      userAuthRepo.findByUsername.mockResolvedValue(null);
      tenantRepo.findDefault.mockResolvedValue(null);

      await expect(
        service.register({
          username: 'newuser',
          email: 'new@example.com',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens for valid refresh token', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        tenantId: 'tenant-1',
      };
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      userAuthRepo.findById.mockResolvedValue(user);

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'refresh-secret',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jwtService.verify.mockReturnValue({ sub: 'nonexistent-user' });
      userAuthRepo.findById.mockResolvedValue(null);

      await expect(service.refreshTokens('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        passwordHash: 'old-hash',
      };
      userAuthRepo.findById.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // current password valid
        .mockResolvedValueOnce(false); // different from new
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      await service.changePassword('user-1', {
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword1',
      });

      expect(userAuthRepo.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'new-hash',
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      userAuthRepo.findById.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistent', {
          currentPassword: 'OldPassword1',
          newPassword: 'NewPassword1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid current password', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        passwordHash: 'old-hash',
      };
      userAuthRepo.findById.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'WrongPassword1',
          newPassword: 'NewPassword1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new password same as current', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        passwordHash: 'old-hash',
      };
      userAuthRepo.findById.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'SamePassword1',
          newPassword: 'SamePassword1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('restorePassword', () => {
    it('should restore password to default successfully', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        passwordHash: 'old-hash',
      };
      userAuthRepo.findById.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('default-hash');

      const result = await service.restorePassword({ userId: 'user-1' });

      expect(result).toEqual({
        success: true,
        message: 'Contraseña de usuario testuser restaurada correctamente',
      });
      expect(userAuthRepo.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'default-hash',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 12);
    });

    it('should throw NotFoundException if user not found', async () => {
      userAuthRepo.findById.mockResolvedValue(null);

      await expect(
        service.restorePassword({ userId: 'nonexistent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use config defaultPassword when available', async () => {
      const user = {
        id: 'user-1',
        username: 'testuser',
        passwordHash: 'old-hash',
      };
      userAuthRepo.findById.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('custom-hash');

      configService.get.mockImplementation((key: string) => {
        if (key === 'config.defaultPassword') return 'CustomPass1';
        return undefined;
      });

      const result = await service.restorePassword({ userId: 'user-1' });

      expect(result.success).toBe(true);
      expect(bcrypt.hash).toHaveBeenCalledWith('CustomPass1', 12);
    });
  });

  describe('validateUser', () => {
    it('should return user by id', async () => {
      const user = { id: 'user-1', username: 'testuser' };
      userAuthRepo.findById.mockResolvedValue(user);

      const result = await service.validateUser('user-1');

      expect(result).toEqual(user);
      expect(userAuthRepo.findById).toHaveBeenCalledWith('user-1');
    });

    it('should return null for nonexistent user', async () => {
      userAuthRepo.findById.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent');

      expect(result).toBeNull();
    });
  });
});
