import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { UsersRepository } from '../repositories/users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findByUsername: jest.Mock;
    findByTenantId: jest.Mock;
    softDelete: jest.Mock;
    softDeleteByUsername: jest.Mock;
    updateProfile: jest.Mock;
    recover: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
      findByTenantId: jest.fn(),
      softDelete: jest.fn(),
      softDeleteByUsername: jest.fn(),
      updateProfile: jest.fn(),
      recover: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useValue: repo }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: 'user-1', username: 'test' }];
      repo.findAll.mockResolvedValue(users);

      const result = await service.getAllUsers('requester-1');

      expect(result).toEqual(users);
      expect(repo.findAll).toHaveBeenCalledWith('requester-1');
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = { id: 'user-1', username: 'test' };
      repo.findById.mockResolvedValue(user);

      const result = await service.getUserById('user-1', 'requester-1');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.getUserById('nonexistent', 'requester-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = { id: 'user-1', username: 'test' };
      repo.findById.mockResolvedValue(user);

      const result = await service.getProfile('user-1', 'requester-1');

      expect(result).toEqual(user);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const user = { id: 'user-1', username: 'test' };
      repo.findByUsername.mockResolvedValue(user);
      repo.updateProfile.mockResolvedValue({ ...user, firstName: 'Updated' });

      const result = await service.updateProfile('test', {
        firstName: 'Updated',
      });

      expect(result).toEqual({ ...user, firstName: 'Updated' });
      expect(repo.updateProfile).toHaveBeenCalledWith('user-1', {
        firstName: 'Updated',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findByUsername.mockResolvedValue(null);

      await expect(
        service.updateProfile('nonexistent', { firstName: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserByUsername', () => {
    it('should return user by username', async () => {
      const user = { id: 'user-1', username: 'test' };
      repo.findByUsername.mockResolvedValue(user);

      const result = await service.getUserByUsername('test');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findByUsername.mockResolvedValue(null);

      await expect(service.getUserByUsername('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserByTenantId', () => {
    it('should return users by tenant id', async () => {
      const users = [{ id: 'user-1', tenantId: 'tenant-1' }];
      repo.findByTenantId.mockResolvedValue(users);

      const result = await service.getUserByTenantId('tenant-1');

      expect(result).toEqual(users);
    });

    it('should throw NotFoundException if users not found', async () => {
      repo.findByTenantId.mockResolvedValue(null);

      await expect(service.getUserByTenantId('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softRemoveById', () => {
    it('should soft delete user by id', async () => {
      const user = { id: 'user-1', deletedAt: new Date() };
      repo.softDelete.mockResolvedValue(user);

      const result = await service.softRemoveById('user-1', 'admin-1');

      expect(result).toEqual(user);
      expect(repo.softDelete).toHaveBeenCalledWith('user-1', 'admin-1');
    });
  });

  describe('softRemoveUserByUsername', () => {
    it('should soft delete user by username', async () => {
      const user = { id: 'user-1', username: 'test' };
      repo.findByUsername.mockResolvedValue(user);
      repo.softDeleteByUsername.mockResolvedValue({ ...user, isActive: false });

      const result = await service.softRemoveUserByUsername('test', 'admin-1');

      expect(result).toBeDefined();
      expect(repo.softDeleteByUsername).toHaveBeenCalledWith('test', 'admin-1');
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findByUsername.mockResolvedValue(null);

      await expect(
        service.softRemoveUserByUsername('nonexistent', 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('recoverUserById', () => {
    it('should recover user', async () => {
      const user = { id: 'user-1', isActive: true };
      repo.recover.mockResolvedValue(user);

      const result = await service.recoverUserById('user-1', 'dev-1');

      expect(result).toEqual(user);
    });
  });
});
