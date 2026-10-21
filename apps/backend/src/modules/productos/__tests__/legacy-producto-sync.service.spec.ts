// src/modules/productos/__tests__/legacy-producto-sync.service.spec.ts
import { LegacyProductoSyncService } from '../legacy-producto-sync.service';

describe('LegacyProductoSyncService', () => {
  let service: LegacyProductoSyncService;
  let prismaMock: {
    producto: { findMany: jest.Mock; update: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  };
  const legacyMock = { getAllProductos: jest.fn() };

  const legacyItem = (codigo: string, nombre: string) => ({
    codigo,
    nombre,
    unidad: 'u',
  });

  const prismaRow = (
    id: string,
    nombre: string,
    legacyCodigo: string | null = null,
    deletedAt: Date | null = null,
  ) => ({ id, nombre, legacyCodigo, deletedAt });

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock = {
      producto: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    service = new LegacyProductoSyncService(
      prismaMock as never,
      legacyMock as never,
    );
  });

  describe('happy paths', () => {
    it('creates a Prisma row for an unmatched legacy producto', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
      ]);

      await service.sync();

      expect(prismaMock.producto.create).toHaveBeenCalledWith({
        data: { nombre: 'Perlita', legacyCodigo: 'L001' },
      });
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('adopts an existing active unlinked row by nombre', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita'),
      ]);

      await service.sync();

      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { legacyCodigo: 'L001' },
      });
      expect(prismaMock.producto.create).not.toHaveBeenCalled();
    });

    it('deduplicates legacy rows sharing a codigo', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
        legacyItem('L001', 'Perlita'),
      ]);

      await service.sync();

      expect(prismaMock.producto.create).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the legacy list is empty', async () => {
      legacyMock.getAllProductos.mockResolvedValue([]);

      await service.sync();

      expect(prismaMock.producto.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('writes nothing when linked rows already match (steady state)', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita', 'L001'),
      ]);

      await service.sync();

      expect(prismaMock.producto.create).not.toHaveBeenCalled();
      expect(prismaMock.producto.update).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('renames, skips and resilience', () => {
    it('renames a linked row when the legacy name drifted', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita Plus'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita', 'L001'),
      ]);

      await service.sync();

      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { nombre: 'Perlita Plus' },
      });
    });

    it('skips the rename when the target name is taken by another row', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita Plus'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita', 'L001'),
        prismaRow('p2', 'Perlita Plus'),
      ]);

      await service.sync();

      expect(prismaMock.producto.update).not.toHaveBeenCalled();
      expect(prismaMock.producto.create).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('skips a soft-deleted name match without resurrecting or inserting', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita', null, new Date('2026-01-01')),
      ]);

      await service.sync();

      expect(prismaMock.producto.update).not.toHaveBeenCalled();
      expect(prismaMock.producto.create).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('skips a second legacy producto whose name is already taken', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
        legacyItem('L002', 'Perlita'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([]);

      await service.sync();

      expect(prismaMock.producto.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.producto.update).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('survives a legacy DB failure without throwing or writing', async () => {
      legacyMock.getAllProductos.mockRejectedValue(new Error('legacy down'));

      await expect(service.sync()).resolves.toBeUndefined();

      expect(prismaMock.producto.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('does not touch isActive/deletedAt when renaming', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita Plus'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita', 'L001'),
      ]);

      await service.sync();

      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { nombre: 'Perlita Plus' },
      });
      const updateCalls = prismaMock.producto.update.mock.calls as Array<
        [{ data: Record<string, unknown> }]
      >;
      const dataArg = updateCalls[0][0].data;
      expect(dataArg).not.toHaveProperty('isActive');
      expect(dataArg).not.toHaveProperty('deletedAt');
    });
  });
});
