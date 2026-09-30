// src/modules/productos/__tests__/productos.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from '../productos.service';
import { ProductosRepository } from '../repositories/productos.repository';

describe('ProductosService', () => {
  let service: ProductosService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };

  const mockProducto = {
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
        ProductosService,
        { provide: ProductosRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllProductos', () => {
    it('returns mapped DTOs from repository', async () => {
      repo.findAll.mockResolvedValue([mockProducto]);

      const result = await service.getAllProductos('user-1');

      expect(result).toEqual([mockDto]);
      expect(repo.findAll).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when no productos exist', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.getAllProductos('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getProductoById', () => {
    it('returns mapped DTO when found', async () => {
      repo.findById.mockResolvedValue(mockProducto);

      const result = await service.getProductoById('user-1', 'sust-1');

      expect(result).toEqual(mockDto);
      expect(repo.findById).toHaveBeenCalledWith('sust-1', 'user-1');
    });

    it('returns null when not found', async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.getProductoById('user-1', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createProducto', () => {
    it('creates producto with nombre', async () => {
      repo.create.mockResolvedValue(mockProducto);

      const result = await service.createProducto({ nombre: 'Turba' });

      expect(result).toEqual(mockProducto);
      expect(repo.create).toHaveBeenCalledWith({ nombre: 'Turba' });
    });
  });

  describe('updateProducto', () => {
    it('updates producto nombre', async () => {
      const updated = { ...mockProducto, nombre: 'Perlita' };
      repo.update.mockResolvedValue(updated);

      const result = await service.updateProducto('user-1', 'sust-1', {
        nombre: 'Perlita',
      });

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith('sust-1', {
        nombre: 'Perlita',
      });
    });

    it('updates producto with partial data', async () => {
      const updated = { ...mockProducto, nombre: 'Actualizado' };
      repo.update.mockResolvedValue(updated);

      const result = await service.updateProducto('user-1', 'sust-1', {
        nombre: 'Actualizado',
      });

      expect(result.nombre).toBe('Actualizado');
    });
  });
});
