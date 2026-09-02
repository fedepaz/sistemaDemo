// src/modules/siembraPartidas/__tests__/siembraPartidas.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SiembraPartidasRepository } from '../repositories/siembraPartidas.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('SiembraPartidasRepository', () => {
  let repository: SiembraPartidasRepository;
  let prisma: {
    siembraPartidas: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
  };

  const mockRecord = {
    id: 'sp-1',
    partidaId: 100,
    anio: 2026,
    indice: 1,
    metodoMaquina: true,
    mezclaId: 'mezcla-1',
    userId: 'user-1',
    isActive: true,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    deletedByUserId: null,
  };

  beforeEach(async () => {
    prisma = {
      siembraPartidas: {
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
        SiembraPartidasRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<SiembraPartidasRepository>(
      SiembraPartidasRepository,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns active non-deleted records for non-dev users', async () => {
      prisma.siembraPartidas.findMany.mockResolvedValue([mockRecord]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([mockRecord]);
      expect(prisma.siembraPartidas.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, isActive: true, id: { notIn: [] } },
      });
    });

    it('returns all records for dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.siembraPartidas.findMany.mockResolvedValue([mockRecord]);

      const result = await repository.findAll('dev-1');

      expect(result).toEqual([mockRecord]);
      expect(prisma.siembraPartidas.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findById', () => {
    it('returns record by id for non-dev users', async () => {
      prisma.siembraPartidas.findFirst.mockResolvedValue(mockRecord);

      const result = await repository.findById('sp-1', 'user-1');

      expect(result).toEqual(mockRecord);
      expect(prisma.siembraPartidas.findFirst).toHaveBeenCalledWith({
        where: { id: 'sp-1', deletedAt: null, isActive: true },
      });
    });

    it('returns null when not found', async () => {
      prisma.siembraPartidas.findFirst.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });

    it('returns record for dev users without filters', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.siembraPartidas.findFirst.mockResolvedValue(mockRecord);

      const result = await repository.findById('sp-1', 'dev-1');

      expect(result).toEqual(mockRecord);
      expect(prisma.siembraPartidas.findFirst).toHaveBeenCalledWith({
        where: { id: 'sp-1' },
      });
    });
  });

  describe('create', () => {
    it('creates record with provided data', async () => {
      prisma.siembraPartidas.create.mockResolvedValue(mockRecord);

      const result = await repository.create({
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        mezclaId: 'mezcla-1',
        userId: 'user-1',
      });

      expect(result).toEqual(mockRecord);
      expect(prisma.siembraPartidas.create).toHaveBeenCalledWith({
        data: {
          partidaId: 100,
          anio: 2026,
          indice: 1,
          metodoMaquina: true,
          mezclaId: 'mezcla-1',
          userId: 'user-1',
        },
      });
    });
  });
});
