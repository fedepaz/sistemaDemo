// src/modules/tenants/__tests__/tenants.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TenantsRepository } from '../repositories/tenants.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('TenantsRepository', () => {
  let repository: TenantsRepository;
  let prisma: {
    tenant: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
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
    prisma = {
      tenant: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      devAccount: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<TenantsRepository>(TenantsRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findDefault', () => {
    it('queries for Default Organization', async () => {
      prisma.tenant.findFirst.mockResolvedValue(mockTenant);

      const result = await repository.findDefault();

      expect(result).toEqual(mockTenant);
      expect(prisma.tenant.findFirst).toHaveBeenCalledWith({
        where: { name: 'Default Organization' },
      });
    });

    it('returns null when default tenant not found', async () => {
      prisma.tenant.findFirst.mockResolvedValue(null);

      const result = await repository.findDefault();

      expect(result).toBeNull();
    });
  });

  describe('findAll (inherited)', () => {
    it('returns active non-deleted tenants for non-dev users', async () => {
      prisma.tenant.findMany.mockResolvedValue([mockTenant]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([mockTenant]);
      expect(prisma.tenant.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          isActive: true,
          id: { notIn: [] },
        },
      });
    });

    it('returns all tenants for dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.tenant.findMany.mockResolvedValue([mockTenant]);

      const result = await repository.findAll('dev-1');

      expect(result).toEqual([mockTenant]);
      expect(prisma.tenant.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findById (inherited)', () => {
    it('returns tenant by id for non-dev users', async () => {
      prisma.tenant.findFirst.mockResolvedValue(mockTenant);

      const result = await repository.findById('tenant-1', 'user-1');

      expect(result).toEqual(mockTenant);
      expect(prisma.tenant.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'tenant-1',
          deletedAt: null,
          isActive: true,
        },
      });
    });

    it('returns null when not found', async () => {
      prisma.tenant.findFirst.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });

    it('returns tenant by id for dev users without filters', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.tenant.findFirst.mockResolvedValue(mockTenant);

      const result = await repository.findById('tenant-1', 'dev-1');

      expect(result).toEqual(mockTenant);
      expect(prisma.tenant.findFirst).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
      });
    });
  });

  describe('softDelete (inherited)', () => {
    it('soft deletes tenant', async () => {
      prisma.tenant.update.mockResolvedValue(mockTenant);

      const result = await repository.softDelete('tenant-1', 'user-1');

      expect(result).toEqual(mockTenant);
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: {
          deletedAt: expect.any(Date),
          deletedByUserId: 'user-1',
          isActive: false,
        },
      });
    });
  });

  describe('recover (inherited)', () => {
    it('recovers tenant for dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.tenant.update.mockResolvedValue(mockTenant);

      const result = await repository.recover('tenant-1', 'dev-1');

      expect(result).toEqual(mockTenant);
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: {
          deletedAt: null,
          isActive: true,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('throws ForbiddenException for non-dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([]);

      await expect(repository.recover('tenant-1', 'user-1')).rejects.toThrow(
        'Only dev accounts can recover records',
      );
    });
  });
});
