import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from '../permissions.service';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { EntitiesRepository } from '../../entities/repositories/entities.repository';
import { UsersRepository } from '../../users/repositories/users.repository';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let permissionsRepo: {
    findManyByUserId: jest.Mock;
    findManyByEntityId: jest.Mock;
    upsert: jest.Mock;
    deleteByUserIdTableName: jest.Mock;
    deleteAllForUser: jest.Mock;
  };
  let entitiesRepo: {
    findAll: jest.Mock;
    findByName: jest.Mock;
  };
  let usersRepo: {
    findById: jest.Mock;
  };

  beforeEach(async () => {
    permissionsRepo = {
      findManyByUserId: jest.fn(),
      findManyByEntityId: jest.fn(),
      upsert: jest.fn(),
      deleteByUserIdTableName: jest.fn(),
      deleteAllForUser: jest.fn(),
    };

    entitiesRepo = {
      findAll: jest.fn(),
      findByName: jest.fn(),
    };

    usersRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PermissionsRepository, useValue: permissionsRepo },
        { provide: EntitiesRepository, useValue: entitiesRepo },
        { provide: UsersRepository, useValue: usersRepo },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPermissionsByUserId', () => {
    it('should return permissions map for user', async () => {
      permissionsRepo.findManyByUserId.mockResolvedValue([
        {
          entityName: 'users',
          entityId: '1',
          canCreate: true,
          canRead: true,
          canUpdate: false,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
      ]);

      const result = await service.getUserPermissionsByUserId('user-1');

      expect(result).toHaveProperty('users');
      expect(result.users.canCreate).toBe(true);
      expect(result.users.canRead).toBe(true);
      expect(result.users.canUpdate).toBe(false);
    });

    it('should return empty map when no permissions', async () => {
      permissionsRepo.findManyByUserId.mockResolvedValue([]);

      const result = await service.getUserPermissionsByUserId('user-1');

      expect(result).toEqual({});
    });
  });

  describe('canPerform', () => {
    it('should return true when user has permission', async () => {
      permissionsRepo.findManyByUserId.mockResolvedValue([
        {
          entityName: 'users',
          entityId: '1',
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
      ]);

      const result = await service.canPerform('user-1', {
        tableName: 'users',
        action: 'create',
        scope: 'ALL',
      });

      expect(result).toBe(true);
    });

    it('should return false when user has no permission for entity', async () => {
      permissionsRepo.findManyByUserId.mockResolvedValue([]);

      const result = await service.canPerform('user-1', {
        tableName: 'users',
        action: 'create',
        scope: 'ALL',
      });

      expect(result).toBe(false);
    });

    it('should return false when READ_ONLY and action is not read', async () => {
      permissionsRepo.findManyByUserId.mockResolvedValue([
        {
          entityName: 'users',
          entityId: '1',
          canCreate: false,
          canRead: true,
          canUpdate: false,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'READ_ONLY',
        },
      ]);

      const result = await service.canPerform('user-1', {
        tableName: 'users',
        action: 'create',
        scope: 'ALL',
      });

      expect(result).toBe(false);
    });

    it('should return true when READ_ONLY and action is read', async () => {
      permissionsRepo.findManyByUserId.mockResolvedValue([
        {
          entityName: 'users',
          entityId: '1',
          canCreate: false,
          canRead: true,
          canUpdate: false,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'READ_ONLY',
        },
      ]);

      const result = await service.canPerform('user-1', {
        tableName: 'users',
        action: 'read',
        scope: 'ALL',
      });

      expect(result).toBe(true);
    });

    it('should return false when scope ALL requested but user has OWN', async () => {
      permissionsRepo.findManyByUserId.mockResolvedValue([
        {
          entityName: 'users',
          entityId: '1',
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          scope: 'OWN',
          permissionType: 'CRUD',
        },
      ]);

      const result = await service.canPerform('user-1', {
        tableName: 'users',
        action: 'create',
        scope: 'ALL',
      });

      expect(result).toBe(false);
    });
  });

  describe('canAccessRecord', () => {
    it('should return true when scope is ALL', async () => {
      permissionsRepo.findManyByUserId.mockResolvedValue([
        {
          entityName: 'users',
          entityId: '1',
          canRead: true,
          scope: 'ALL',
        },
      ]);

      const result = await service.canAccessRecord(
        'user-1',
        'users',
        'read',
        'other-user',
      );

      expect(result).toBe(true);
    });

    it('should return true when scope is OWN and record belongs to user', async () => {
      permissionsRepo.findManyByUserId.mockResolvedValue([
        {
          entityName: 'users',
          entityId: '1',
          canRead: true,
          scope: 'OWN',
        },
      ]);

      const result = await service.canAccessRecord(
        'user-1',
        'users',
        'read',
        'user-1',
      );

      expect(result).toBe(true);
    });

    it('should return false when scope is OWN and record belongs to other', async () => {
      permissionsRepo.findManyByUserId.mockResolvedValue([
        {
          entityName: 'users',
          entityId: '1',
          canRead: true,
          scope: 'OWN',
        },
      ]);

      const result = await service.canAccessRecord(
        'user-1',
        'users',
        'read',
        'other-user',
      );

      expect(result).toBe(false);
    });
  });

  describe('grantPermission', () => {
    it('should upsert permission', async () => {
      permissionsRepo.upsert.mockResolvedValue(undefined);

      await service.grantPermission('user-1', 'entity-1', {
        canCreate: true,
        canRead: true,
        scope: 'ALL',
      });

      expect(permissionsRepo.upsert).toHaveBeenCalledWith(
        'user-1',
        'entity-1',
        {
          canCreate: true,
          canRead: true,
          scope: 'ALL',
        },
      );
    });
  });

  describe('revokeTablePermissions', () => {
    it('should delete permission', async () => {
      permissionsRepo.deleteByUserIdTableName.mockResolvedValue(undefined);

      await service.revokeTablePermissions('user-1', 'entity-1');

      expect(permissionsRepo.deleteByUserIdTableName).toHaveBeenCalledWith(
        'user-1',
        'entity-1',
      );
    });
  });
});
