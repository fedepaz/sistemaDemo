import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('PermissionsRepository', () => {
  let repository: PermissionsRepository;
  let prisma: {
    userPermission: {
      findMany: jest.Mock;
      upsert: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      userPermission: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      devAccount: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<PermissionsRepository>(PermissionsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findManyByUserId', () => {
    it('should return permissions for user', async () => {
      const records = [
        {
          userId: 'user-1',
          entityId: '1',
          entity: { name: 'users' },
          canCreate: true,
          canRead: true,
          canUpdate: false,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
          createdAt: new Date(),
        },
      ];
      prisma.userPermission.findMany.mockResolvedValue(records);

      const result = await repository.findManyByUserId('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].entityName).toBe('users');
    });

    it('should return empty array when no permissions', async () => {
      prisma.userPermission.findMany.mockResolvedValue([]);

      const result = await repository.findManyByUserId('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('upsert', () => {
    it('should upsert permission', async () => {
      prisma.userPermission.upsert.mockResolvedValue(undefined);

      await repository.upsert('user-1', 'entity-1', {
        canCreate: true,
        canRead: true,
        scope: 'ALL',
      });

      expect(prisma.userPermission.upsert).toHaveBeenCalledWith({
        where: { userId_entityId: { userId: 'user-1', entityId: 'entity-1' } },
        create: {
          userId: 'user-1',
          entityId: 'entity-1',
          canCreate: true,
          canRead: true,
          canUpdate: false,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
        update: { canCreate: true, canRead: true, scope: 'ALL' },
      });
    });
  });

  describe('deleteByUserIdTableName', () => {
    it('should delete permission', async () => {
      prisma.userPermission.delete.mockResolvedValue(undefined);

      await repository.deleteByUserIdTableName('user-1', 'entity-1');

      expect(prisma.userPermission.delete).toHaveBeenCalledWith({
        where: { userId_entityId: { userId: 'user-1', entityId: 'entity-1' } },
      });
    });
  });

  describe('deleteAllForUser', () => {
    it('should delete all permissions for user', async () => {
      prisma.userPermission.deleteMany.mockResolvedValue({ count: 3 });

      await repository.deleteAllForUser('user-1');

      expect(prisma.userPermission.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });
});
