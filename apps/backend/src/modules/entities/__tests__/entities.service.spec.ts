import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesService } from '../entities.service';
import { EntitiesRepository } from '../repositories/entities.repository';
import { PermissionsService } from '../../permissions/permissions.service';

describe('EntitiesService', () => {
  let service: EntitiesService;
  let entitiesRepo: {
    findAll: jest.Mock;
    findByName: jest.Mock;
    create: jest.Mock;
    softDelete: jest.Mock;
  };
  let permissionsService: {
    grantPermission: jest.Mock;
  };

  beforeEach(async () => {
    entitiesRepo = {
      findAll: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      softDelete: jest.fn(),
    };

    permissionsService = {
      grantPermission: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitiesService,
        { provide: EntitiesRepository, useValue: entitiesRepo },
        { provide: PermissionsService, useValue: permissionsService },
      ],
    }).compile();

    service = module.get<EntitiesService>(EntitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTables', () => {
    it('should return entities excluding system entities', async () => {
      const entities = [
        {
          id: '1',
          name: 'users',
          label: 'Users',
          isActive: true,
          permissionType: 'CRUD',
        },
        {
          id: '2',
          name: 'user_profile',
          label: 'Profile',
          isActive: true,
          permissionType: 'READ_ONLY',
        },
      ];
      entitiesRepo.findAll.mockResolvedValue(entities);

      const result = await service.getAllTables('requester-1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('users');
    });

    it('should return empty array when no entities', async () => {
      entitiesRepo.findAll.mockResolvedValue([]);

      const result = await service.getAllTables('requester-1');

      expect(result).toEqual([]);
    });
  });

  describe('getTableByName', () => {
    it('should return entity by name', async () => {
      const entity = {
        id: '1',
        name: 'users',
        label: 'Users',
        isActive: true,
        permissionType: 'CRUD',
      };
      entitiesRepo.findByName.mockResolvedValue(entity);

      const result = await service.getTableByName('users');

      expect(result).toEqual(entity);
    });

    it('should throw NotFoundException if entity not found', async () => {
      entitiesRepo.findByName.mockRejectedValue(new Error('not found'));

      await expect(service.getTableByName('nonexistent')).rejects.toThrow();
    });
  });

  describe('createEntity', () => {
    it('should create entity and grant permissions', async () => {
      const entity = {
        id: '1',
        name: 'new_table',
        label: 'New',
        isActive: true,
        permissionType: 'CRUD',
      };
      entitiesRepo.create.mockResolvedValue(entity);
      permissionsService.grantPermission.mockResolvedValue(undefined);

      const result = await service.createEntity(
        { name: 'new_table', label: 'New', permissionType: 'CRUD' },
        'creator-1',
      );

      expect(result).toEqual(entity);
      expect(permissionsService.grantPermission).toHaveBeenCalledWith(
        'creator-1',
        '1',
        expect.objectContaining({ canCreate: true, canRead: true }),
      );
    });
  });

  describe('softRemove', () => {
    it('should soft delete entity by name', async () => {
      const entity = { id: '1', name: 'users' };
      entitiesRepo.findByName.mockResolvedValue(entity);
      entitiesRepo.softDelete.mockResolvedValue({ ...entity, isActive: false });

      const result = await service.softRemove('users', 'admin-1');

      expect(result).toBeDefined();
      expect(entitiesRepo.softDelete).toHaveBeenCalledWith('1', 'admin-1');
    });

    it('should soft delete entity by id when name not found', async () => {
      entitiesRepo.findByName.mockRejectedValue(new Error('not found'));
      entitiesRepo.softDelete.mockResolvedValue({ id: '1', isActive: false });

      const result = await service.softRemove('1', 'admin-1');

      expect(result).toBeDefined();
      expect(entitiesRepo.softDelete).toHaveBeenCalledWith('1', 'admin-1');
    });
  });
});
