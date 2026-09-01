// src/modules/siembraPartidas/__tests__/siembraPartidas.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SiembraPartidasService } from '../siembraPartidas.service';
import { SiembraPartidasRepository } from '../repositories/siembraPartidas.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SiembraPartidasService', () => {
  let service: SiembraPartidasService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    createSiembraPartida: jest.Mock;
  };
  let prismaMock: {
    sustratos: { upsert: jest.Mock };
    mezcla: { upsert: jest.Mock };
  };

  const mockRow = {
    id: 'sp-1',
    partidaId: 100,
    anio: 2026,
    indice: 1,
    metodoMaquina: true,
    presionSemilla: 25,
    profundidadSemilla: { toString: () => '1.525' },
    tratamientoSemilla: false,
    mezclaId: 'mezcla-1',
    userId: 'user-1',
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    deletedByUserId: null,
  };

  const mockDto = {
    id: 'sp-1',
    partidaId: 100,
    anio: 2026,
    indice: 1,
    metodoMaquina: true,
    presionSemilla: 25,
    profundidadSemilla: '1.525',
    tratamientoSemilla: false,
    mezclaId: 'mezcla-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      createSiembraPartida: jest.fn(),
    };

    prismaMock = {
      sustratos: { upsert: jest.fn() },
      mezcla: { upsert: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiembraPartidasService,
        { provide: SiembraPartidasRepository, useValue: repo },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<SiembraPartidasService>(SiembraPartidasService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllSiembraPartidas', () => {
    it('returns mapped DTOs from repository', async () => {
      repo.findAll.mockResolvedValue([mockRow]);

      const result = await service.getAllSiembraPartidas('user-1');

      expect(result).toEqual([mockDto]);
      expect(repo.findAll).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when none exist', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.getAllSiembraPartidas('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getSiembraPartidaById', () => {
    it('returns mapped DTO when found', async () => {
      repo.findById.mockResolvedValue(mockRow);

      const result = await service.getSiembraPartidaById('sp-1', 'user-1');

      expect(result).toEqual(mockDto);
      expect(repo.findById).toHaveBeenCalledWith('sp-1', 'user-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.getSiembraPartidaById('nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSiembraPartida', () => {
    it('delegates to repository createSiembraPartida', async () => {
      repo.createSiembraPartida.mockResolvedValue(mockRow);

      const data = {
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        presionSemilla: 25,
        profundidadSemilla: '1.525',
        tratamientoSemilla: false,
        mezclaId: 'mezcla-1',
        userId: 'user-1',
      };
      const result = await service.createSiembraPartida(data, 'user-1');

      expect(result).toEqual(mockDto);
      expect(repo.createSiembraPartida).toHaveBeenCalledWith({
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        presionSemilla: 25,
        profundidadSemilla: '1.525',
        tratamientoSemilla: false,
        mezcla: { connect: { id: 'mezcla-1' } },
        user: { connect: { id: 'user-1' } },
      });
    });
  });
});
