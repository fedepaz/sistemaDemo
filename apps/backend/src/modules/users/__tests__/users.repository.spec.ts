import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      devAccount: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const user = {
        id: 'user-1',
        username: 'test',
        deletedAt: null,
        isActive: true,
      };
      prisma.user.findFirst.mockResolvedValue(user);

      const result = await repository.findByUsername('test');

      expect(result).toEqual(user);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          username: 'test',
          deletedAt: null,
          isActive: true,
        },
        omit: { passwordHash: true },
      });
    });

    it('should return null if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await repository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByTenantId', () => {
    it('should return users by tenant id', async () => {
      const users = [{ id: 'user-1', tenantId: 'tenant-1' }];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await repository.findByTenantId('tenant-1');

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          deletedAt: null,
          isActive: true,
        },
        omit: { passwordHash: true },
      });
    });

    it('should return empty array when no users', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      const result = await repository.findByTenantId('tenant-1');

      expect(result).toEqual([]);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const user = { id: 'user-1', firstName: 'Updated' };
      prisma.user.update.mockResolvedValue(user);

      const result = await repository.updateProfile('user-1', {
        firstName: 'Updated',
      });

      expect(result).toEqual(user);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { firstName: 'Updated', updatedAt: expect.any(Date) }, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        omit: { passwordHash: true },
      });
    });
  });

  describe('softDeleteByUsername', () => {
    it('should soft delete user by username', async () => {
      const user = { id: 'user-1', username: 'test', isActive: false };
      prisma.user.update.mockResolvedValue(user);

      const result = await repository.softDeleteByUsername('test', 'admin-1');

      expect(result).toEqual(user);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { username: 'test' },
        data: {
          deletedAt: expect.any(Date), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          deletedByUserId: 'admin-1',
          isActive: false,
        },
        omit: { passwordHash: true },
      });
    });
  });

  describe('findToActivate', () => {
    it('should return inactive users for non-dev requester', async () => {
      const users = [{ id: 'user-1', username: 'pending', isActive: false }];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await repository.findToActivate('requester-1');

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          isActive: false,
          id: { notIn: [] },
        },
        omit: { passwordHash: true },
      });
    });

    it('should return all users for dev requester', async () => {
      const users = [{ id: 'user-1', username: 'dev', isActive: true }];
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.user.findMany.mockResolvedValue(users);

      const result = await repository.findToActivate('dev-1');

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          isActive: false,
        },
        omit: { passwordHash: true },
      });
    });
  });

  describe('activateById', () => {
    it('should set isActive to true', async () => {
      prisma.user.update.mockResolvedValue({ id: 'user-1', isActive: true });

      await repository.activateById('user-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isActive: true,
          updatedAt: expect.any(Date), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        },
        omit: { passwordHash: true },
      });
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      prisma.user.update.mockRejectedValue(new Error('DB error'));

      await expect(repository.activateById('user-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
