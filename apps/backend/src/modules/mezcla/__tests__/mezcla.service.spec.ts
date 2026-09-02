// src/modules/mezcla/__tests__/mezcla.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { MezclaService } from '../mezcla.service';
import { MezclaRepository } from '../repositories/mezcla.repository';
import { NotFoundException } from '@nestjs/common';

describe('MezclaService', () => {
  let service: MezclaService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };

  const mockMezcla = {
    id: 'mezcla-1',
    sustrato1Id: 'sust-1',
    porcentaje1: 60,
    sustrato2Id: 'sust-2',
    porcentaje2: 40,
    sustrato3Id: null,
    porcentaje3: null,
    sustrato4Id: null,
    porcentaje4: null,
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
      providers: [MezclaService, { provide: MezclaRepository, useValue: repo }],
    }).compile();

    service = module.get<MezclaService>(MezclaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllMezcla', () => {
    it('returns results from repository', async () => {
      repo.findAll.mockResolvedValue([mockMezcla]);

      const result = await service.getAllMezcla('user-1');

      expect(result).toEqual([mockMezcla]);
      expect(repo.findAll).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when none exist', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.getAllMezcla('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getMezclaById', () => {
    it('returns entity when found', async () => {
      repo.findById.mockResolvedValue(mockMezcla);

      const result = await service.getMezclaById('mezcla-1', 'user-1');

      expect(result).toEqual(mockMezcla);
      expect(repo.findById).toHaveBeenCalledWith('mezcla-1', 'user-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.getMezclaById('nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createMezcla', () => {
    it('delegates to repository create', async () => {
      repo.create.mockResolvedValue(mockMezcla);

      const data = {
        sustrato1Id: 'sust-1',
        porcentaje1: 60,
        sustrato2Id: 'sust-2',
        porcentaje2: 40,
        sustrato3Id: null,
        porcentaje3: null,
        sustrato4Id: null,
        porcentaje4: null,
      };
      const result = await service.createMezcla(data);

      expect(result).toEqual(mockMezcla);
      expect(repo.create).toHaveBeenCalledWith(data);
    });
  });
});
