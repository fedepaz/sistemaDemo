// src/modules/siembraPartidas/__tests__/siembraPartidas.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SiembraPartidasService } from '../siembraPartidas.service';
import { SiembraPartidasRepository } from '../repositories/siembraPartidas.repository';
import { NotFoundException } from '@nestjs/common';

describe('SiembraPartidasService', () => {
  let service: SiembraPartidasService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };

  const mockSiembraPartida = {
    id: 'sp-1',
    partidaId: 100,
    anio: 2026,
    indice: 1,
    metodoMaquina: true,
    mezclaId: 'mezcla-1',
    userId: 'user-1',
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    deletedByUserId: null,
  };

  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiembraPartidasService,
        { provide: SiembraPartidasRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<SiembraPartidasService>(SiembraPartidasService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllSiembraPartidas', () => {
    it('returns results from repository', async () => {
      repo.findAll.mockResolvedValue([mockSiembraPartida]);

      const result = await service.getAllSiembraPartidas('user-1');

      expect(result).toEqual([mockSiembraPartida]);
      expect(repo.findAll).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when none exist', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.getAllSiembraPartidas('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getSiembraPartidaById', () => {
    it('returns entity when found', async () => {
      repo.findById.mockResolvedValue(mockSiembraPartida);

      const result = await service.getSiembraPartidaById('sp-1', 'user-1');

      expect(result).toEqual(mockSiembraPartida);
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
    it('delegates to repository create', async () => {
      repo.create.mockResolvedValue(mockSiembraPartida);

      const data = {
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        mezclaId: 'mezcla-1',
        userId: 'user-1',
      };
      const result = await service.createSiembraPartida(data);

      expect(result).toEqual(mockSiembraPartida);
      expect(repo.create).toHaveBeenCalledWith(data);
    });
  });
});
