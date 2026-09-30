// src/modules/productos/__tests__/productos.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ProductosRepository } from '../repositories/productos.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('ProductosRepository', () => {
  let repository: ProductosRepository;
  let prisma: {
    producto: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
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

  beforeEach(async () => {
    prisma = {
      producto: {
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
        ProductosRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<ProductosRepository>(ProductosRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns active non-deleted productos for non-dev users', async () => {
      prisma.producto.findMany.mockResolvedValue([mockProducto]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([mockProducto]);
      expect(prisma.producto.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          isActive: true,
          id: { notIn: [] },
        },
      });
    });

    it('returns all productos for dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.producto.findMany.mockResolvedValue([mockProducto]);

      const result = await repository.findAll('dev-1');

      expect(result).toEqual([mockProducto]);
      expect(prisma.producto.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findById', () => {
    it('returns producto by id for non-dev users', async () => {
      prisma.producto.findFirst.mockResolvedValue(mockProducto);

      const result = await repository.findById('sust-1', 'user-1');

      expect(result).toEqual(mockProducto);
      expect(prisma.producto.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'sust-1',
          deletedAt: null,
          isActive: true,
        },
      });
    });

    it('returns null when not found', async () => {
      prisma.producto.findFirst.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });

    it('returns producto by id for dev users without filters', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.producto.findFirst.mockResolvedValue(mockProducto);

      const result = await repository.findById('sust-1', 'dev-1');

      expect(result).toEqual(mockProducto);
      expect(prisma.producto.findFirst).toHaveBeenCalledWith({
        where: { id: 'sust-1' },
      });
    });
  });

  describe('create', () => {
    it('creates producto with timestamps', async () => {
      prisma.producto.create.mockResolvedValue(mockProducto);

      const result = await repository.create({ nombre: 'Turba' });

      expect(result).toEqual(mockProducto);
      expect(prisma.producto.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Turba',
        },
      });
    });
  });

  describe('update', () => {
    it('updates producto nombre with timestamp', async () => {
      const updated = { ...mockProducto, nombre: 'Perlita' };
      prisma.producto.update.mockResolvedValue(updated);

      const result = await repository.update('sust-1', { nombre: 'Perlita' });

      expect(result).toEqual(updated);
      expect(prisma.producto.update).toHaveBeenCalledWith({
        where: { id: 'sust-1', deletedAt: null, isActive: true },
        data: {
          nombre: 'Perlita',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('propagates errors from prisma', async () => {
      prisma.producto.update.mockRejectedValue(new Error('Record not found'));

      await expect(
        repository.update('nonexistent', { nombre: 'Test' }),
      ).rejects.toThrow('Record not found');
    });
  });
});
