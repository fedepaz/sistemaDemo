import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesService } from '../entities.service';
import { EntitiesRepository } from '../repositories/entities.repository';
import { PermissionsService } from '../../permissions/permissions.service';

describe('EntitiesService', () => {
  let service: EntitiesService;
  let entitiesRepo: {
    findAll: jest.Mock;
    findByName: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    syncPermissionType: jest.Mock;
    softDelete: jest.Mock;
  };
  let permissionsService: {
    grantPermission: jest.Mock;
  };

  beforeEach(async () => {
    entitiesRepo = {
      findAll: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      syncPermissionType: jest.fn(),
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

  describe('getTableById', () => {
    it('should return entity by id', async () => {
      const entity = {
        id: '1',
        name: 'users',
        label: 'Users',
        isActive: true,
        permissionType: 'CRUD',
      };
      entitiesRepo.findById.mockResolvedValue(entity);

      const result = await service.getTableById('requester-1', '1');

      expect(result).toEqual(entity);
      expect(entitiesRepo.findById).toHaveBeenCalledWith('1', 'requester-1');
    });

    it('should throw NotFoundException if entity not found', async () => {
      entitiesRepo.findById.mockResolvedValue(null);

      await expect(
        service.getTableById('requester-1', 'missing'),
      ).rejects.toThrow('not found');
    });
  });

  describe('updateEntity', () => {
    const existing = {
      id: '1',
      name: 'products',
      label: 'Productos',
      isActive: true,
      permissionType: 'CRUD',
    };

    it('should update and return the mapped entity', async () => {
      entitiesRepo.findById.mockResolvedValue(existing);
      entitiesRepo.update.mockResolvedValue({
        ...existing,
        label: 'Productos Nuevos',
      });

      const result = await service.updateEntity(
        '1',
        { label: 'Productos Nuevos' },
        'requester-1',
      );

      expect(result).toEqual({
        ...existing,
        label: 'Productos Nuevos',
      });
      expect(entitiesRepo.update).toHaveBeenCalledWith('1', {
        label: 'Productos Nuevos',
      });
      expect(entitiesRepo.syncPermissionType).not.toHaveBeenCalled();
    });

    it('should sync permission rows when permissionType is sent', async () => {
      entitiesRepo.findById.mockResolvedValue(existing);
      entitiesRepo.update.mockResolvedValue({
        ...existing,
        permissionType: 'READ_ONLY',
      });
      entitiesRepo.syncPermissionType.mockResolvedValue(undefined);

      await service.updateEntity(
        '1',
        { permissionType: 'READ_ONLY' },
        'requester-1',
      );

      expect(entitiesRepo.syncPermissionType).toHaveBeenCalledWith(
        '1',
        'READ_ONLY',
      );
    });

    it('should throw NotFoundException when entity does not exist', async () => {
      entitiesRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateEntity('missing', { label: 'X' }, 'requester-1'),
      ).rejects.toThrow('not found');
      expect(entitiesRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for system entities', async () => {
      entitiesRepo.findById.mockResolvedValue({
        ...existing,
        id: 'sys-1',
        name: 'entities',
      });

      await expect(
        service.updateEntity('sys-1', { label: 'X' }, 'requester-1'),
      ).rejects.toThrow('system');
      expect(entitiesRepo.update).not.toHaveBeenCalled();
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
      entitiesRepo.findById.mockResolvedValue(null);
      entitiesRepo.softDelete.mockResolvedValue({ id: '1', isActive: false });

      const result = await service.softRemove('1', 'admin-1');

      expect(result).toBeDefined();
      expect(entitiesRepo.softDelete).toHaveBeenCalledWith('1', 'admin-1');
    });

    it('should throw ForbiddenException when deleting a system entity by name', async () => {
      entitiesRepo.findByName.mockResolvedValue({
        id: 'sys-1',
        name: 'audit_logs',
      });

      await expect(service.softRemove('audit_logs', 'admin-1')).rejects.toThrow(
        'system',
      );
      expect(entitiesRepo.softDelete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when deleting a system entity by id', async () => {
      entitiesRepo.findByName.mockRejectedValue(new Error('not found'));
      entitiesRepo.findById.mockResolvedValue({
        id: 'sys-1',
        name: 'user_profile',
      });

      await expect(service.softRemove('sys-1', 'admin-1')).rejects.toThrow(
        'system',
      );
      expect(entitiesRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
