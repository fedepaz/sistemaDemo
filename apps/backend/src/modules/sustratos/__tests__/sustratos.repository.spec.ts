// src/modules/sustratos/__tests__/sustratos.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SustratosRepository } from '../repositories/sustratos.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('SustratosRepository', () => {
  let repository: SustratosRepository;
  let prisma: {
    sustratos: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
  };

  const mockSustrato = {
    id: 'sust-1',
    nombre: 'Turba',
    isActive: true,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    deletedAt: null,
    deletedByUserId: null,
  };

  beforeEach(async () => {
    prisma = {
      sustratos: {
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
        SustratosRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<SustratosRepository>(SustratosRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns active non-deleted sustratos for non-dev users', async () => {
      prisma.sustratos.findMany.mockResolvedValue([mockSustrato]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([mockSustrato]);
      expect(prisma.sustratos.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          isActive: true,
          id: { notIn: [] },
        },
      });
    });

    it('returns all sustratos for dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.sustratos.findMany.mockResolvedValue([mockSustrato]);

      const result = await repository.findAll('dev-1');

      expect(result).toEqual([mockSustrato]);
      expect(prisma.sustratos.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findById', () => {
    it('returns sustrato by id for non-dev users', async () => {
      prisma.sustratos.findFirst.mockResolvedValue(mockSustrato);

      const result = await repository.findById('sust-1', 'user-1');

      expect(result).toEqual(mockSustrato);
      expect(prisma.sustratos.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'sust-1',
          deletedAt: null,
          isActive: true,
        },
      });
    });

    it('returns null when not found', async () => {
      prisma.sustratos.findFirst.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });

    it('returns sustrato by id for dev users without filters', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.sustratos.findFirst.mockResolvedValue(mockSustrato);

      const result = await repository.findById('sust-1', 'dev-1');

      expect(result).toEqual(mockSustrato);
      expect(prisma.sustratos.findFirst).toHaveBeenCalledWith({
        where: { id: 'sust-1' },
      });
    });
  });

  describe('create', () => {
    it('creates sustrato with timestamps', async () => {
      prisma.sustratos.create.mockResolvedValue(mockSustrato);

      const result = await repository.create({ nombre: 'Turba' });

      expect(result).toEqual(mockSustrato);
      expect(prisma.sustratos.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Turba',
        },
      });
    });
  });

  describe('update', () => {
    it('updates sustrato nombre with timestamp', async () => {
      const updated = { ...mockSustrato, nombre: 'Perlita' };
      prisma.sustratos.update.mockResolvedValue(updated);

      const result = await repository.update('sust-1', { nombre: 'Perlita' });

      expect(result).toEqual(updated);
      expect(prisma.sustratos.update).toHaveBeenCalledWith({
        where: { id: 'sust-1', deletedAt: null, isActive: true },
        data: {
          nombre: 'Perlita',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('propagates errors from prisma', async () => {
      prisma.sustratos.update.mockRejectedValue(new Error('Record not found'));

      await expect(
        repository.update('nonexistent', { nombre: 'Test' }),
      ).rejects.toThrow('Record not found');
    });
  });
});
