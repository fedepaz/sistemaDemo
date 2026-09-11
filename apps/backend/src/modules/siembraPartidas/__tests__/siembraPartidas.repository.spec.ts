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
    stockLote: 42,
    stockAnio: 2026,
    stockEntradasAntes: 1000,
    stockSalidasAntes: 200,
    stockEntradasDespues: 1000,
    stockSalidasDespues: 200,
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
      expect(prisma.siembraPartidas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletedAt: null,
            isActive: true,
            id: { notIn: [] },
            profundidadSemilla: { not: 0 },
          },
        }),
      );
    });

    it('returns all records for dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.siembraPartidas.findMany.mockResolvedValue([mockRecord]);

      const result = await repository.findAll('dev-1');

      expect(result).toEqual([mockRecord]);
      expect(prisma.siembraPartidas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletedAt: null,
            isActive: true,
            profundidadSemilla: { not: 0 },
          },
        }),
      );
    });
  });

  describe('findById', () => {
    it('returns record by id', async () => {
      prisma.siembraPartidas.findFirst.mockResolvedValue(mockRecord);

      const result = await repository.findById('sp-1', 'user-1');

      expect(result).toEqual(mockRecord);
      expect(prisma.siembraPartidas.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sp-1' },
        }),
      );
    });

    it('returns null when not found', async () => {
      prisma.siembraPartidas.findFirst.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates record with provided data including stock fields', async () => {
      prisma.siembraPartidas.create.mockResolvedValue(mockRecord);

      const result = await repository.create({
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        mezclaId: 'mezcla-1',
        userId: 'user-1',
        stockLote: 42,
        stockAnio: 2026,
        stockEntradasAntes: 1000 as never,
        stockSalidasAntes: 200 as never,
        stockEntradasDespues: 1000 as never,
        stockSalidasDespues: 200 as never,
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
          stockLote: 42,
          stockAnio: 2026,
          stockEntradasAntes: 1000,
          stockSalidasAntes: 200,
          stockEntradasDespues: 1000,
          stockSalidasDespues: 200,
        },
      });
    });

    it('creates record without stock fields when undefined', async () => {
      const recordWithoutStock = {
        ...mockRecord,
        stockLote: null,
        stockAnio: null,
        stockEntradasAntes: null,
        stockSalidasAntes: null,
        stockEntradasDespues: null,
        stockSalidasDespues: null,
      };
      prisma.siembraPartidas.create.mockResolvedValue(recordWithoutStock);

      const result = await repository.create({
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        mezclaId: 'mezcla-1',
        userId: 'user-1',
      });

      expect(result).toEqual(recordWithoutStock);
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
