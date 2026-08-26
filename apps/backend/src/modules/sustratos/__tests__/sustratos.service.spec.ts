// src/modules/sustratos/__tests__/sustratos.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SustratosService } from '../sustratos.service';
import { SustratosRepository } from '../repositories/sustratos.repository';

describe('SustratosService', () => {
  let service: SustratosService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
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

  const mockDto = {
    id: 'sust-1',
    nombre: 'Turba',
    createdAt: new Date('2026-01-15'),
  };

  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SustratosService,
        { provide: SustratosRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<SustratosService>(SustratosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllSustratos', () => {
    it('returns mapped DTOs from repository', async () => {
      repo.findAll.mockResolvedValue([mockSustrato]);

      const result = await service.getAllSustratos('user-1');

      expect(result).toEqual([mockDto]);
      expect(repo.findAll).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when no sustratos exist', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.getAllSustratos('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getSustratoById', () => {
    it('returns mapped DTO when found', async () => {
      repo.findById.mockResolvedValue(mockSustrato);

      const result = await service.getSustratoById('user-1', 'sust-1');

      expect(result).toEqual(mockDto);
      expect(repo.findById).toHaveBeenCalledWith('sust-1', 'user-1');
    });

    it('returns null when not found', async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.getSustratoById('user-1', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createSustrato', () => {
    it('creates sustrato with nombre', async () => {
      repo.create.mockResolvedValue(mockSustrato);

      const result = await service.createSustrato({ nombre: 'Turba' });

      expect(result).toEqual(mockSustrato);
      expect(repo.create).toHaveBeenCalledWith({ nombre: 'Turba' });
    });
  });

  describe('updateSustrato', () => {
    it('updates sustrato nombre', async () => {
      const updated = { ...mockSustrato, nombre: 'Perlita' };
      repo.update.mockResolvedValue(updated);

      const result = await service.updateSustrato('user-1', 'sust-1', {
        nombre: 'Perlita',
      });

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith('sust-1', {
        nombre: 'Perlita',
      });
    });

    it('updates sustrato with partial data', async () => {
      const updated = { ...mockSustrato, nombre: 'Actualizado' };
      repo.update.mockResolvedValue(updated);

      const result = await service.updateSustrato('user-1', 'sust-1', {
        nombre: 'Actualizado',
      });

      expect(result.nombre).toBe('Actualizado');
    });
  });
});
