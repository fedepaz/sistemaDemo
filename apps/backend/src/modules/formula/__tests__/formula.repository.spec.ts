// src/modules/formula/__tests__/formula.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { FormulaRepository } from '../repositories/formula.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('FormulaRepository', () => {
  let repository: FormulaRepository;
  let prisma: {
    formula: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
    user: {
      findMany: jest.Mock;
    };
  };

  const mockRecordWithRelations = {
    id: 'formula-1',
    producto1Id: 'prod-1',
    producto1: { nombre: 'Turba' },
    porcentaje1: 60,
    producto2Id: 'prod-2',
    producto2: { nombre: 'Perlita' },
    porcentaje2: 40,
    producto3Id: null,
    producto3: null,
    porcentaje3: null,
    producto4Id: null,
    producto4: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    deletedByUserId: null,
  };

  const expectedDto = {
    id: 'formula-1',
    producto1Id: 'prod-1',
    producto1Nombre: 'Turba',
    porcentaje1: 60,
    producto2Id: 'prod-2',
    producto2Nombre: 'Perlita',
    porcentaje2: 40,
    producto3Id: null,
    producto3Nombre: null,
    porcentaje3: null,
    producto4Id: null,
    producto4Nombre: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    deletedByUserId: null,
    deletedByUsername: null,
  };

  const productoInclude = {
    producto1: { select: { nombre: true } },
    producto2: { select: { nombre: true } },
    producto3: { select: { nombre: true } },
    producto4: { select: { nombre: true } },
  };

  beforeEach(async () => {
    prisma = {
      formula: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      devAccount: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormulaRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<FormulaRepository>(FormulaRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('common user: only active, non-deleted, excluding dev accounts', async () => {
      prisma.formula.findMany.mockResolvedValue([mockRecordWithRelations]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([expectedDto]);
      expect(prisma.formula.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, isActive: true, id: { notIn: [] } },
        include: productoInclude,
      });
    });

    it('common user: excludes dev-account ids from the where clause', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.formula.findMany.mockResolvedValue([]);

      await repository.findAll('user-1');

      expect(prisma.formula.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, isActive: true, id: { notIn: ['dev-1'] } },
        include: productoInclude,
      });
    });

    it('dev user: returns all rows including inactive and soft-deleted', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      const inactive = { ...mockRecordWithRelations, isActive: false };
      const deleted = {
        ...mockRecordWithRelations,
        id: 'formula-2',
        deletedAt: new Date('2026-08-02'),
      };
      prisma.formula.findMany.mockResolvedValue([inactive, deleted]);

      const result = await repository.findAll('dev-1');

      expect(result).toHaveLength(2);
      expect(result[0].isActive).toBe(false);
      expect(result[1].deletedAt).toEqual(new Date('2026-08-02'));
      expect(prisma.formula.findMany).toHaveBeenCalledWith({
        where: {},
        include: productoInclude,
      });
    });

    it('returns empty array when no records exist', async () => {
      prisma.formula.findMany.mockResolvedValue([]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([]);
    });

    it('dev user: resolves deleter username on deleted rows', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.formula.findMany.mockResolvedValue([
        {
          ...mockRecordWithRelations,
          isActive: false,
          deletedAt: new Date('2026-08-02'),
          deletedByUserId: 'u1',
        },
      ]);
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', username: 'admin' }]);

      const result = await repository.findAll('dev-1');

      expect(result[0].deletedByUsername).toBe('admin');
    });
  });

  describe('findById', () => {
    it('common user: returns mapped DTO when active', async () => {
      prisma.formula.findUnique.mockResolvedValue(mockRecordWithRelations);

      const result = await repository.findById('formula-1', 'user-1');

      expect(result).toEqual(expectedDto);
      expect(prisma.formula.findUnique).toHaveBeenCalledWith({
        where: { id: 'formula-1' },
        include: productoInclude,
      });
    });

    it('common user: returns null for soft-deleted record', async () => {
      prisma.formula.findUnique.mockResolvedValue({
        ...mockRecordWithRelations,
        deletedAt: new Date('2026-08-02'),
      });

      const result = await repository.findById('formula-1', 'user-1');

      expect(result).toBeNull();
    });

    it('common user: returns null for inactive record', async () => {
      prisma.formula.findUnique.mockResolvedValue({
        ...mockRecordWithRelations,
        isActive: false,
      });

      const result = await repository.findById('formula-1', 'user-1');

      expect(result).toBeNull();
    });

    it('dev user: returns soft-deleted record', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.formula.findUnique.mockResolvedValue({
        ...mockRecordWithRelations,
        deletedAt: new Date('2026-08-02'),
      });

      const result = await repository.findById('formula-1', 'dev-1');

      expect(result).not.toBeNull();
      expect(result?.deletedAt).toEqual(new Date('2026-08-02'));
    });

    it('returns null when not found', async () => {
      prisma.formula.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });

    it('resolves deleter username for a deleted record found by id', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.formula.findUnique.mockResolvedValue({
        ...mockRecordWithRelations,
        isActive: false,
        deletedAt: new Date('2026-08-02'),
        deletedByUserId: 'u1',
      });
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', username: 'admin' }]);

      const result = await repository.findById('formula-1', 'dev-1');

      expect(result?.deletedByUsername).toBe('admin');
    });
  });

  describe('create', () => {
    it('re-reads the created row and returns the mapped DTO with producto names', async () => {
      prisma.formula.create.mockResolvedValue({ id: 'formula-1' });
      prisma.formula.findUnique.mockResolvedValue(mockRecordWithRelations);

      const result = await repository.create({
        producto1Id: 'prod-1',
        porcentaje1: 60,
        producto2Id: 'prod-2',
        porcentaje2: 40,
        producto3Id: null,
        porcentaje3: null,
        producto4Id: null,
        porcentaje4: null,
      });

      expect(prisma.formula.create).toHaveBeenCalledWith({
        data: {
          producto1Id: 'prod-1',
          porcentaje1: 60,
          producto2Id: 'prod-2',
          porcentaje2: 40,
          producto3Id: null,
          porcentaje3: null,
          producto4Id: null,
          porcentaje4: null,
        },
      });
      expect(prisma.formula.findUnique).toHaveBeenCalledWith({
        where: { id: 'formula-1' },
        include: productoInclude,
      });
      expect(result).toEqual(expectedDto);
      expect(result).not.toHaveProperty('producto1');
      expect(result.producto1Nombre).toBe('Turba');
      expect(result.producto2Nombre).toBe('Perlita');
      expect(result.producto3Nombre).toBeNull();
      expect(result.producto4Nombre).toBeNull();
    });
  });
});
