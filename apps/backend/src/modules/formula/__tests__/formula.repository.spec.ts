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
      create: jest.Mock;
    };
  };

  const mockRecordWithRelations = {
    id: 'formula-1',
    producto1Id: 'sust-1',
    producto1: { nombre: 'Turba' },
    porcentaje1: 60,
    producto2Id: 'sust-2',
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

  const mockDto = {
    id: 'formula-1',
    producto1Id: 'sust-1',
    producto1Nombre: 'Turba',
    porcentaje1: 60,
    producto2Id: 'sust-2',
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
  };

  beforeEach(async () => {
    prisma = {
      formula: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
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
    it('returns mapped DTOs with producto names', async () => {
      prisma.formula.findMany.mockResolvedValue([mockRecordWithRelations]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([mockDto]);
      expect(prisma.formula.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: {
          producto1: { select: { nombre: true } },
          producto2: { select: { nombre: true } },
          producto3: { select: { nombre: true } },
          producto4: { select: { nombre: true } },
        },
      });
    });

    it('returns empty array when no records exist', async () => {
      prisma.formula.findMany.mockResolvedValue([]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('returns mapped DTO when found', async () => {
      prisma.formula.findUnique.mockResolvedValue(mockRecordWithRelations);

      const result = await repository.findById('formula-1', 'user-1');

      expect(result).toEqual(mockDto);
      expect(prisma.formula.findUnique).toHaveBeenCalledWith({
        where: { id: 'formula-1' },
        include: {
          producto1: { select: { nombre: true } },
          producto2: { select: { nombre: true } },
          producto3: { select: { nombre: true } },
          producto4: { select: { nombre: true } },
        },
      });
    });

    it('returns null when not found', async () => {
      prisma.formula.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });

    it('returns null when record is deleted', async () => {
      prisma.formula.findUnique.mockResolvedValue({
        ...mockRecordWithRelations,
        deletedAt: new Date(),
      });

      const result = await repository.findById('formula-1', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates record', async () => {
      prisma.formula.create.mockResolvedValue(mockRecordWithRelations);

      const result = await repository.create({
        producto1Id: 'sust-1',
        porcentaje1: 60,
        producto2Id: 'sust-2',
        porcentaje2: 40,
        producto3Id: null,
        porcentaje3: null,
        producto4Id: null,
        porcentaje4: null,
      });

      expect(result).toEqual(mockRecordWithRelations);
      expect(prisma.formula.create).toHaveBeenCalledWith({
        data: {
          producto1Id: 'sust-1',
          porcentaje1: 60,
          producto2Id: 'sust-2',
          porcentaje2: 40,
          producto3Id: null,
          porcentaje3: null,
          producto4Id: null,
          porcentaje4: null,
        },
      });
    });
  });
});
