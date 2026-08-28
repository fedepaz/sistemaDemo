// src/modules/mezcla/__tests__/mezcla.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { MezclaRepository } from '../repositories/mezcla.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('MezclaRepository', () => {
  let repository: MezclaRepository;
  let prisma: {
    mezcla: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  const mockRecordWithRelations = {
    id: 'mezcla-1',
    sustrato1Id: 'sust-1',
    sustrato1: { nombre: 'Turba' },
    porcentaje1: 60,
    sustrato2Id: 'sust-2',
    sustrato2: { nombre: 'Perlita' },
    porcentaje2: 40,
    sustrato3Id: null,
    sustrato3: null,
    porcentaje3: null,
    sustrato4Id: null,
    sustrato4: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    deletedByUserId: null,
  };

  const mockDto = {
    id: 'mezcla-1',
    sustrato1Id: 'sust-1',
    sustrato1Nombre: 'Turba',
    porcentaje1: 60,
    sustrato2Id: 'sust-2',
    sustrato2Nombre: 'Perlita',
    porcentaje2: 40,
    sustrato3Id: null,
    sustrato3Nombre: null,
    porcentaje3: null,
    sustrato4Id: null,
    sustrato4Nombre: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date('2026-08-01'),
  };

  beforeEach(async () => {
    prisma = {
      mezcla: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MezclaRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<MezclaRepository>(MezclaRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns mapped DTOs with sustrato names', async () => {
      prisma.mezcla.findMany.mockResolvedValue([mockRecordWithRelations]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([mockDto]);
      expect(prisma.mezcla.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: {
          sustrato1: { select: { nombre: true } },
          sustrato2: { select: { nombre: true } },
          sustrato3: { select: { nombre: true } },
          sustrato4: { select: { nombre: true } },
        },
      });
    });

    it('returns empty array when no records exist', async () => {
      prisma.mezcla.findMany.mockResolvedValue([]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('returns mapped DTO when found', async () => {
      prisma.mezcla.findUnique.mockResolvedValue(mockRecordWithRelations);

      const result = await repository.findById('mezcla-1', 'user-1');

      expect(result).toEqual(mockDto);
      expect(prisma.mezcla.findUnique).toHaveBeenCalledWith({
        where: { id: 'mezcla-1' },
        include: {
          sustrato1: { select: { nombre: true } },
          sustrato2: { select: { nombre: true } },
          sustrato3: { select: { nombre: true } },
          sustrato4: { select: { nombre: true } },
        },
      });
    });

    it('returns null when not found', async () => {
      prisma.mezcla.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });

    it('returns null when record is deleted', async () => {
      prisma.mezcla.findUnique.mockResolvedValue({
        ...mockRecordWithRelations,
        deletedAt: new Date(),
      });

      const result = await repository.findById('mezcla-1', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates record', async () => {
      prisma.mezcla.create.mockResolvedValue(mockRecordWithRelations);

      const result = await repository.create({
        sustrato1Id: 'sust-1',
        porcentaje1: 60,
        sustrato2Id: 'sust-2',
        porcentaje2: 40,
        sustrato3Id: null,
        porcentaje3: null,
        sustrato4Id: null,
        porcentaje4: null,
      });

      expect(result).toEqual(mockRecordWithRelations);
      expect(prisma.mezcla.create).toHaveBeenCalledWith({
        data: {
          sustrato1Id: 'sust-1',
          porcentaje1: 60,
          sustrato2Id: 'sust-2',
          porcentaje2: 40,
          sustrato3Id: null,
          porcentaje3: null,
          sustrato4Id: null,
          porcentaje4: null,
        },
      });
    });
  });
});
