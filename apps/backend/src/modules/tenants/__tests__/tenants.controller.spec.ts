// src/modules/tenants/__tests__/tenants.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from '../tenants.controller';
import { TenantsService } from '../tenants.service';

describe('TenantsController', () => {
  let controller: TenantsController;
  let service: {
    getAllTenants: jest.Mock;
    getTenantById: jest.Mock;
    softDeleteById: jest.Mock;
    recoverById: jest.Mock;
  };

  const mockUser = { id: 'user-1', username: 'admin', tenantId: 'tenant-1' };
  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    isActive: true,
    createdAt: '2026-01-15T00:00:00.000Z',
  };

  beforeEach(async () => {
    service = {
      getAllTenants: jest.fn(),
      getTenantById: jest.fn(),
      softDeleteById: jest.fn(),
      recoverById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [{ provide: TenantsService, useValue: service }],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllTenants', () => {
    it('delegates to service with user id', async () => {
      service.getAllTenants.mockResolvedValue([mockTenant]);

      const result = await controller.getAllTenants(mockUser);

      expect(result).toEqual([mockTenant]);
      expect(service.getAllTenants).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when none exist', async () => {
      service.getAllTenants.mockResolvedValue([]);

      const result = await controller.getAllTenants(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('getTenantById', () => {
    it('delegates to service with tenantId and user id', async () => {
      service.getTenantById.mockResolvedValue(mockTenant);

      const result = await controller.getTenantById('tenant-1', mockUser);

      expect(result).toEqual(mockTenant);
      expect(service.getTenantById).toHaveBeenCalledWith('tenant-1', 'user-1');
    });
  });

  describe('softDeleteById', () => {
    it('delegates to service', async () => {
      service.softDeleteById.mockResolvedValue(mockTenant);

      const result = await controller.softDeleteById('tenant-1', mockUser);

      expect(result).toEqual(mockTenant);
      expect(service.softDeleteById).toHaveBeenCalledWith('tenant-1', 'user-1');
    });
  });

  describe('recoverById', () => {
    it('delegates to service', async () => {
      service.recoverById.mockResolvedValue(mockTenant);

      const result = await controller.recoverById('tenant-1', mockUser);

      expect(result).toEqual(mockTenant);
      expect(service.recoverById).toHaveBeenCalledWith('tenant-1', 'user-1');
    });
  });
});
