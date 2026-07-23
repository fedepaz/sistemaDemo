import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesRepository } from '../repositories/entities.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('EntitiesRepository', () => {
  let repository: EntitiesRepository;
  let prisma: {
    entity: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
    userPermission: {
      createMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      entity: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      devAccount: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      userPermission: {
        createMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitiesRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<EntitiesRepository>(EntitiesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByName', () => {
    it('should return entity by name', async () => {
      const entity = {
        id: '1',
        name: 'users',
        deletedAt: null,
        isActive: true,
      };
      prisma.entity.findFirst.mockResolvedValue(entity);

      const result = await repository.findByName('users');

      expect(result).toEqual(entity);
    });

    it('should throw if entity not found', async () => {
      prisma.entity.findFirst.mockResolvedValue(null);

      await expect(repository.findByName('nonexistent')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create entity and grant permissions to dev accounts', async () => {
      const entity = { id: '1', name: 'new_table', permissionType: 'CRUD' };
      prisma.entity.create.mockResolvedValue(entity);
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.userPermission.createMany.mockResolvedValue({ count: 1 });

      const result = await repository.create({
        name: 'new_table',
        label: 'New',
        permissionType: 'CRUD',
      });

      expect(result).toEqual(entity);
      expect(prisma.userPermission.createMany).toHaveBeenCalled();
    });

    it('should create entity without dev permissions when no dev accounts', async () => {
      const entity = { id: '1', name: 'new_table', permissionType: 'CRUD' };
      prisma.entity.create.mockResolvedValue(entity);
      prisma.devAccount.findMany.mockResolvedValue([]);

      const result = await repository.create({
        name: 'new_table',
        label: 'New',
        permissionType: 'CRUD',
      });

      expect(result).toEqual(entity);
      expect(prisma.userPermission.createMany).not.toHaveBeenCalled();
    });
  });
});
