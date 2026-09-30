// src/modules/formula/__tests__/formula.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { FormulaService } from '../formula.service';
import { FormulaRepository } from '../repositories/formula.repository';
import { NotFoundException } from '@nestjs/common';

describe('FormulaService', () => {
  let service: FormulaService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };

  const mockFormula = {
    id: 'formula-1',
    producto1Id: 'sust-1',
    producto1Nombre: 'Turba',
    porcentaje1: 60,
    producto2Id: 'sust-2',
    producto2Nombre: 'Perlita',
    porcentaje2: 40,
    producto3Id: null,
    porcentaje3: null,
    producto4Id: null,
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
      providers: [
        FormulaService,
        { provide: FormulaRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<FormulaService>(FormulaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllFormula', () => {
    it('returns results from repository', async () => {
      repo.findAll.mockResolvedValue([mockFormula]);

      const result = await service.getAllFormula('user-1');

      expect(result).toEqual([mockFormula]);
      expect(repo.findAll).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when none exist', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.getAllFormula('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getFormulaById', () => {
    it('returns entity when found', async () => {
      repo.findById.mockResolvedValue(mockFormula);

      const result = await service.getFormulaById('formula-1', 'user-1');

      expect(result).toEqual(mockFormula);
      expect(repo.findById).toHaveBeenCalledWith('formula-1', 'user-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.getFormulaById('nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createFormula', () => {
    it('delegates to repository create', async () => {
      repo.create.mockResolvedValue(mockFormula);

      const data = {
        producto1Id: 'sust-1',
        porcentaje1: 60,
        producto2Id: 'sust-2',
        porcentaje2: 40,
        producto3Id: null,
        porcentaje3: null,
        producto4Id: null,
        porcentaje4: null,
      };
      const result = await service.createFormula(data);

      expect(result).toEqual(mockFormula);
      expect(repo.create).toHaveBeenCalledWith(data);
    });
  });
});
