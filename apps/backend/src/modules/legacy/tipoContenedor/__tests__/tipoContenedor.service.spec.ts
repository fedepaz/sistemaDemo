// apps/backend/src/modules/legacy/tipoContenedor/__tests__/tipoContenedor.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LegacyTipoContenedorService } from '../tipoContenedor.service';
import { TipoContenedorRepository } from '../repositories/tipoContenedor.repository';

describe('LegacyTipoContenedorService', () => {
  let service: LegacyTipoContenedorService;
  let repository: {
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  const mockTipo = {
    codigo: 'C01',
    nombre: 'Bandeja 10',
    cantidad: 120,
    semillas: 4000,
    siembra: 'Directa',
    entrega: 10,
    rubro: 'Maíz',
    stock: 'OK',
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn().mockResolvedValue([mockTipo]),
      findOne: jest.fn().mockResolvedValue(mockTipo),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyTipoContenedorService,
        { provide: TipoContenedorRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<LegacyTipoContenedorService>(
      LegacyTipoContenedorService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAll', () => {
    it('returns all tipo contenedor rows', async () => {
      const result = await service.getAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockTipo]);
    });
  });

  describe('getByCodigo', () => {
    it('returns the row when found', async () => {
      const result = await service.getByCodigo('C01');

      expect(repository.findOne).toHaveBeenCalledWith('C01');
      expect(result).toEqual(mockTipo);
    });

    it('throws NotFoundException when the codigo does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getByCodigo('missing')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getByCodigo('missing')).rejects.toThrow(
        'TipoContenedor not found',
      );
    });
  });
});
