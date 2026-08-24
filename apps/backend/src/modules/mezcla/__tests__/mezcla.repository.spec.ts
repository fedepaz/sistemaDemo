// src/modules/mezcla/__tests__/mezcla.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { MezclaRepository } from '../repositories/mezcla.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('MezclaRepository', () => {
  let repository: MezclaRepository;
  let prisma: {
    mezcla: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
  };

  const mockRecord = {
    id: 'mezcla-1',
    sustrato1Id: 'sust-1',
    porcentaje1: 60,
    sustrato2Id: 'sust-2',
    porcentaje2: 40,
    sustrato3Id: null,
    porcentaje3: null,
    sustrato4Id: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    deletedByUserId: null,
  };

  beforeEach(async () => {
    prisma = {
      mezcla: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      devAccount: {
        findMany: jest.fn().mockResolvedValue([]),
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
    it('returns active non-deleted records for non-dev users', async () => {
      prisma.mezcla.findMany.mockResolvedValue([mockRecord]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([mockRecord]);
      expect(prisma.mezcla.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, isActive: true, id: { notIn: [] } },
      });
    });

    it('returns all records for dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.mezcla.findMany.mockResolvedValue([mockRecord]);

      const result = await repository.findAll('dev-1');

      expect(result).toEqual([mockRecord]);
      expect(prisma.mezcla.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findById', () => {
    it('returns record by id for non-dev users', async () => {
      prisma.mezcla.findFirst.mockResolvedValue(mockRecord);

      const result = await repository.findById('mezcla-1', 'user-1');

      expect(result).toEqual(mockRecord);
      expect(prisma.mezcla.findFirst).toHaveBeenCalledWith({
        where: { id: 'mezcla-1', deletedAt: null, isActive: true },
      });
    });

    it('returns null when not found', async () => {
      prisma.mezcla.findFirst.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });

    it('returns record for dev users without filters', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.mezcla.findFirst.mockResolvedValue(mockRecord);

      const result = await repository.findById('mezcla-1', 'dev-1');

      expect(result).toEqual(mockRecord);
      expect(prisma.mezcla.findFirst).toHaveBeenCalledWith({
        where: { id: 'mezcla-1' },
      });
    });
  });

  describe('create', () => {
    it('creates record with timestamps', async () => {
      prisma.mezcla.create.mockResolvedValue(mockRecord);

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

      expect(result).toEqual(mockRecord);
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
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });
  });
});
