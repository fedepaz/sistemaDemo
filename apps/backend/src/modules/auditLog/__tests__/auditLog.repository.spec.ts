import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogRepository } from '../repositories/auditLog.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('AuditLogRepository', () => {
  let repository: AuditLogRepository;
  let prisma: {
    auditLog: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      auditLog: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      devAccount: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<AuditLogRepository>(AuditLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all audit logs with user include', async () => {
      const logs = [
        {
          id: '1',
          action: 'CREATE',
          user: { id: 'user-1', username: 'test' },
        },
      ];
      prisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await repository.findAll();

      expect(result).toEqual(logs);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, isActive: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      });
    });
  });

  describe('findAllByTenantName', () => {
    it('should return paginated logs by tenant name', async () => {
      const logs = [{ id: '1', action: 'CREATE' }];
      prisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await repository.findAllByTenantName('Default', 0, 10);

      expect(result).toEqual(logs);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          tenant: { name: 'Default' },
          deletedAt: null,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: { timestamp: 'desc' },
      });
    });
  });

  describe('findAllByUserId', () => {
    it('should return logs by user id', async () => {
      const logs = [{ id: '1', userId: 'user-1' }];
      prisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await repository.findAllByUserId('user-1');

      expect(result).toEqual(logs);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          deletedAt: null,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    });
  });

  describe('createAuditLog', () => {
    it('should create audit log', async () => {
      const data = {
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'CREATE' as const,
        entityType: 'USER' as const,
        entityId: 'entity-1',
        changes: { name: 'new' },
      };
      const created = { id: '1', ...data };
      prisma.auditLog.create.mockResolvedValue(created);

      const result = await repository.createAuditLog(data);

      expect(result).toEqual(created);
      expect(prisma.auditLog.create).toHaveBeenCalledWith({ data });
    });

    it('should throw on create error', async () => {
      prisma.auditLog.create.mockRejectedValue(new Error('DB error'));

      await expect(
        repository.createAuditLog({
          tenantId: 'tenant-1',
          userId: 'user-1',
          action: 'CREATE',
          entityType: 'USER',
          entityId: 'entity-1',
          changes: {},
        }),
      ).rejects.toThrow();
    });
  });
});
