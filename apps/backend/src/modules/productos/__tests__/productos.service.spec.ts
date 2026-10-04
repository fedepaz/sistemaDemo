// src/modules/productos/__tests__/productos.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductosService } from '../productos.service';
import { ProductosRepository } from '../repositories/productos.repository';

describe('ProductosService', () => {
  let service: ProductosService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
  };

  const mockProducto = {
    id: 'sust-1',
    nombre: 'Turba',
    isActive: true,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    deletedAt: null,
    deletedByUserId: null,
    deletedByUsername: null,
  };

  const mockDto = {
    id: 'sust-1',
    nombre: 'Turba',
    isActive: true,
    createdAt: new Date('2026-01-15'),
    deletedAt: null,
    deletedByUserId: null,
    deletedByUsername: null,
  };

  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
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

    it('passes deletion info through to the DTO', async () => {
      repo.findAll.mockResolvedValue([
        {
          ...mockProducto,
          isActive: false,
          deletedAt: new Date('2026-10-01'),
          deletedByUserId: 'u1',
          deletedByUsername: 'admin',
        },
      ]);

      const result = await service.getAllProductos('dev-1');

      expect(result[0].deletedAt).toEqual(new Date('2026-10-01'));
      expect(result[0].deletedByUserId).toBe('u1');
      expect(result[0].deletedByUsername).toBe('admin');
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

      expect(result).toEqual({
        id: 'sust-1',
        nombre: 'Turba',
        isActive: true,
        createdAt: new Date('2026-01-15'),
        deletedAt: null,
        deletedByUserId: null,
        deletedByUsername: null,
      });
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

      expect(result).toEqual({
        id: 'sust-1',
        nombre: 'Perlita',
        isActive: true,
        createdAt: new Date('2026-01-15'),
        deletedAt: null,
        deletedByUserId: null,
        deletedByUsername: null,
      });
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

  describe('deleteProducto', () => {
    it('soft-deletes when found', async () => {
      repo.findById.mockResolvedValue(mockProducto);
      repo.softDelete.mockResolvedValue(mockProducto);

      const result = await service.deleteProducto('user-1', 'sust-1');

      expect(result).toEqual(mockProducto);
      expect(repo.findById).toHaveBeenCalledWith('sust-1', 'user-1');
      expect(repo.softDelete).toHaveBeenCalledWith('sust-1', 'user-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteProducto('user-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.softDelete).not.toHaveBeenCalled();
    });
  });
});
