/* eslint-disable @typescript-eslint/unbound-method */
// src/modules/productos/__tests__/productos.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { REQUIRE_PERMISSION_KEY } from '../../permissions/decorators/require-permission.decorator';
import { ProductosController } from '../productos.controller';
import { ProductosService } from '../productos.service';

describe('ProductosController', () => {
  let controller: ProductosController;
  let service: {
    getAllProductos: jest.Mock;
    getProductoById: jest.Mock;
    createProducto: jest.Mock;
    updateProducto: jest.Mock;
    deleteProducto: jest.Mock;
  };

  const mockUser = { id: 'user-1', username: 'admin', tenantId: 'tenant-1' };
  const mockDto = {
    id: 'sust-1',
    nombre: 'Turba',
    createdAt: '2026-01-15T00:00:00.000Z',
  };

  beforeEach(async () => {
    service = {
      getAllProductos: jest.fn(),
      getProductoById: jest.fn(),
      createProducto: jest.fn(),
      updateProducto: jest.fn(),
      deleteProducto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [{ provide: ProductosService, useValue: service }],
    }).compile();

    controller = module.get<ProductosController>(ProductosController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllProductos', () => {
    it('returns all productos for the user', async () => {
      service.getAllProductos.mockResolvedValue([mockDto]);

      const result = await controller.getAllProductos(mockUser);

      expect(result).toEqual([mockDto]);
      expect(service.getAllProductos).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when none exist', async () => {
      service.getAllProductos.mockResolvedValue([]);

      const result = await controller.getAllProductos(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('getProducto', () => {
    it('returns a producto by id', async () => {
      service.getProductoById.mockResolvedValue(mockDto);

      const result = await controller.getProducto(mockUser, 'sust-1');

      expect(result).toEqual(mockDto);
      expect(service.getProductoById).toHaveBeenCalledWith('user-1', 'sust-1');
    });

    it('returns null when not found', async () => {
      service.getProductoById.mockResolvedValue(null);

      const result = await controller.getProducto(mockUser, 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createProducto', () => {
    it('creates a producto with nombre', async () => {
      service.createProducto.mockResolvedValue(mockDto);

      const result = await controller.createProducto({ nombre: 'Turba' });

      expect(result).toEqual(mockDto);
      expect(service.createProducto).toHaveBeenCalledWith({ nombre: 'Turba' });
    });
  });

  describe('updateProducto', () => {
    it('updates a producto by id', async () => {
      const updated = { ...mockDto, nombre: 'Perlita' };
      service.updateProducto.mockResolvedValue(updated);

      const result = await controller.updateProducto(mockUser, 'sust-1', {
        nombre: 'Perlita',
      });

      expect(result).toEqual(updated);
      expect(service.updateProducto).toHaveBeenCalledWith('user-1', 'sust-1', {
        nombre: 'Perlita',
      });
    });
  });

  describe('deleteProducto', () => {
    it('delegates to service with user id and id', async () => {
      service.deleteProducto.mockResolvedValue(mockDto);

      const result = await controller.deleteProducto(mockUser, 'sust-1');

      expect(result).toEqual(mockDto);
      expect(service.deleteProducto).toHaveBeenCalledWith('user-1', 'sust-1');
    });
  });

  describe('permission metadata', () => {
    it('DELETE /productos/:id requires productos:delete', () => {
      const meta = Reflect.getMetadata(
        REQUIRE_PERMISSION_KEY,
        ProductosController.prototype.deleteProducto,
      );

      expect(meta).toEqual({
        tableName: 'productos',
        action: 'delete',
        scope: 'ALL',
      });
    });
  });
});
