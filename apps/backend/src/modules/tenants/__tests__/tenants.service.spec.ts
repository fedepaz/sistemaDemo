// src/modules/tenants/__tests__/tenants.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TenantsService } from '../tenants.service';
import { TenantsRepository } from '../repositories/tenants.repository';
import { NotFoundException } from '@nestjs/common';

describe('TenantsService', () => {
  let service: TenantsService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    softDelete: jest.Mock;
    recover: jest.Mock;
  };

  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    isActive: true,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    deletedAt: null,
    deletedByUserId: null,
  };

  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      softDelete: jest.fn(),
      recover: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: TenantsRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllTenants', () => {
    it('delegates to repository with requesterId', async () => {
      repo.findAll.mockResolvedValue([mockTenant]);

      const result = await service.getAllTenants('user-1');

      expect(result).toEqual([mockTenant]);
      expect(repo.findAll).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when no tenants exist', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.getAllTenants('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getTenantById', () => {
    it('returns tenant when found', async () => {
      repo.findById.mockResolvedValue(mockTenant);

      const result = await service.getTenantById('tenant-1', 'user-1');

      expect(result).toEqual(mockTenant);
      expect(repo.findById).toHaveBeenCalledWith('tenant-1', 'user-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.getTenantById('nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDeleteById', () => {
    it('delegates to repository', async () => {
      repo.softDelete.mockResolvedValue(mockTenant);

      const result = await service.softDeleteById('tenant-1', 'user-1');

      expect(result).toEqual(mockTenant);
      expect(repo.softDelete).toHaveBeenCalledWith('tenant-1', 'user-1');
    });
  });

  describe('recoverById', () => {
    it('delegates to repository', async () => {
      repo.recover.mockResolvedValue(mockTenant);

      const result = await service.recoverById('tenant-1', 'dev-1');

      expect(result).toEqual(mockTenant);
      expect(repo.recover).toHaveBeenCalledWith('tenant-1', 'dev-1');
    });
  });
});
