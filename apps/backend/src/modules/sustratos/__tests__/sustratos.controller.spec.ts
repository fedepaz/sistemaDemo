// src/modules/sustratos/__tests__/sustratos.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SustratosController } from '../sustratos.controller';
import { SustratosService } from '../sustratos.service';

describe('SustratosController', () => {
  let controller: SustratosController;
  let service: {
    getAllSustratos: jest.Mock;
    getSustratoById: jest.Mock;
    createSustrato: jest.Mock;
    updateSustrato: jest.Mock;
  };

  const mockUser = { id: 'user-1', username: 'admin', tenantId: 'tenant-1' };
  const mockDto = {
    id: 'sust-1',
    nombre: 'Turba',
    createdAt: '2026-01-15T00:00:00.000Z',
  };

  beforeEach(async () => {
    service = {
      getAllSustratos: jest.fn(),
      getSustratoById: jest.fn(),
      createSustrato: jest.fn(),
      updateSustrato: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SustratosController],
      providers: [{ provide: SustratosService, useValue: service }],
    }).compile();

    controller = module.get<SustratosController>(SustratosController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllSustratos', () => {
    it('returns all sustratos for the user', async () => {
      service.getAllSustratos.mockResolvedValue([mockDto]);

      const result = await controller.getAllSustratos(mockUser);

      expect(result).toEqual([mockDto]);
      expect(service.getAllSustratos).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when none exist', async () => {
      service.getAllSustratos.mockResolvedValue([]);

      const result = await controller.getAllSustratos(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('getSustrato', () => {
    it('returns a sustrato by id', async () => {
      service.getSustratoById.mockResolvedValue(mockDto);

      const result = await controller.getSustrato(mockUser, 'sust-1');

      expect(result).toEqual(mockDto);
      expect(service.getSustratoById).toHaveBeenCalledWith('user-1', 'sust-1');
    });

    it('returns null when not found', async () => {
      service.getSustratoById.mockResolvedValue(null);

      const result = await controller.getSustrato(mockUser, 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createSustrato', () => {
    it('creates a sustrato with nombre', async () => {
      service.createSustrato.mockResolvedValue(mockDto);

      const result = await controller.createSustrato({ nombre: 'Turba' });

      expect(result).toEqual(mockDto);
      expect(service.createSustrato).toHaveBeenCalledWith({ nombre: 'Turba' });
    });
  });

  describe('updateSustrato', () => {
    it('updates a sustrato by id', async () => {
      const updated = { ...mockDto, nombre: 'Perlita' };
      service.updateSustrato.mockResolvedValue(updated);

      const result = await controller.updateSustrato(mockUser, 'sust-1', {
        nombre: 'Perlita',
      });

      expect(result).toEqual(updated);
      expect(service.updateSustrato).toHaveBeenCalledWith('user-1', 'sust-1', {
        nombre: 'Perlita',
      });
    });
  });
});
