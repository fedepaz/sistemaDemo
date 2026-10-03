/* eslint-disable @typescript-eslint/unbound-method */
// src/modules/entities/__tests__/entities.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { REQUIRE_PERMISSION_KEY } from '../../permissions/decorators/require-permission.decorator';
import { EntitiesController } from '../entities.controller';
import { EntitiesService } from '../entities.service';

describe('EntitiesController', () => {
  let controller: EntitiesController;
  let service: {
    getAllTables: jest.Mock;
    getTableByName: jest.Mock;
    getTableById: jest.Mock;
    createEntity: jest.Mock;
    updateEntity: jest.Mock;
    softRemove: jest.Mock;
  };

  const mockUser = { id: 'user-1', username: 'admin', tenantId: 'tenant-1' };
  const mockEntity = {
    id: 'entity-1',
    name: 'products',
    label: 'Productos',
    isActive: true,
    permissionType: 'CRUD',
  };

  beforeEach(async () => {
    service = {
      getAllTables: jest.fn(),
      getTableByName: jest.fn(),
      getTableById: jest.fn(),
      createEntity: jest.fn(),
      updateEntity: jest.fn(),
      softRemove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntitiesController],
      providers: [{ provide: EntitiesService, useValue: service }],
    }).compile();

    controller = module.get<EntitiesController>(EntitiesController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getTableById', () => {
    it('returns an entity by id for the user', async () => {
      service.getTableById.mockResolvedValue(mockEntity);

      const result = await controller.getTableById(mockUser, 'entity-1');

      expect(result).toEqual(mockEntity);
      expect(service.getTableById).toHaveBeenCalledWith('user-1', 'entity-1');
    });
  });

  describe('updateEntity', () => {
    it('delegates to the service with id, data and user id', async () => {
      const updated = { ...mockEntity, label: 'Productos Nuevos' };
      service.updateEntity.mockResolvedValue(updated);

      const result = await controller.updateEntity(mockUser, 'entity-1', {
        label: 'Productos Nuevos',
      });

      expect(result).toEqual(updated);
      expect(service.updateEntity).toHaveBeenCalledWith(
        'entity-1',
        { label: 'Productos Nuevos' },
        'user-1',
      );
    });
  });

  describe('softDelete', () => {
    it('delegates to the service with id and user id', async () => {
      service.softRemove.mockResolvedValue({ ...mockEntity, isActive: false });

      const result = await controller.softDelete('entity-1', mockUser);

      expect(result).toBeDefined();
      expect(service.softRemove).toHaveBeenCalledWith('entity-1', 'user-1');
    });
  });

  describe('permission metadata', () => {
    it('GET /entities/tables requires entities:read', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        EntitiesController.prototype.getAllTables,
      );

      expect(meta).toEqual({
        tableName: 'entities',
        action: 'read',
        scope: 'ALL',
      });
    });

    it('GET /entities/table/:tableName requires entities:read', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        EntitiesController.prototype.getTableByName,
      );

      expect(meta).toEqual({
        tableName: 'entities',
        action: 'read',
        scope: 'ALL',
      });
    });

    it('GET /entities/:id requires entities:read', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        EntitiesController.prototype.getTableById,
      );

      expect(meta).toEqual({
        tableName: 'entities',
        action: 'read',
        scope: 'ALL',
      });
    });

    it('POST /entities/entity requires entities:create', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        EntitiesController.prototype.createEntity,
      );

      expect(meta).toEqual({
        tableName: 'entities',
        action: 'create',
        scope: 'ALL',
      });
    });

    it('PATCH /entities/:id requires entities:update', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        EntitiesController.prototype.updateEntity,
      );

      expect(meta).toEqual({
        tableName: 'entities',
        action: 'update',
        scope: 'ALL',
      });
    });

    it('DELETE /entities/:id requires entities:delete', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        EntitiesController.prototype.softDelete,
      );

      expect(meta).toEqual({
        tableName: 'entities',
        action: 'delete',
        scope: 'ALL',
      });
    });
  });
});
