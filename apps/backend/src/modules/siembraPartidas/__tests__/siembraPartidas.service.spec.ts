// src/modules/siembraPartidas/__tests__/siembraPartidas.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SiembraPartidasService } from '../siembraPartidas.service';
import { SiembraPartidasRepository } from '../repositories/siembraPartidas.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { PartidasRepository } from '../../legacy/partidas/repositories/partidas.repository';
import { TaskShiftsRepository } from '../../taskShifts/repositories/taskShifts.repository';
import { LegacyTratamientoService } from '../../legacy/tratamiento/tratamiento.service';
import { LegacySustratoService } from '../../legacy/sustrato/sustrato.service';
import { NotFoundException } from '@nestjs/common';

describe('SiembraPartidasService', () => {
  let service: SiembraPartidasService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    createSiembraPartida: jest.Mock;
    update: jest.Mock;
  };
  let prismaMock: {
    sustratos: { upsert: jest.Mock };
    mezcla: { upsert: jest.Mock };
    siembraPartidas: { findFirst: jest.Mock };
  };
  let partidasRepoMock: { findByComposite: jest.Mock };
  let taskShiftsRepoMock: { findByPartidaComposite: jest.Mock };
  let tratamientoServiceMock: { getByCodigo: jest.Mock };
  let sustratoServiceMock: { getByCodigo: jest.Mock };

  const mockRow = {
    id: 'sp-1',
    partidaId: 100,
    anio: 2026,
    indice: 1,
    metodoMaquina: true,
    prensadoSustrato: { toNumber: () => 25 },
    profundidadSemilla: { toString: () => '1.525' },
    tratamientoSemilla: '',
    mezclaId: 'mezcla-1',
    userId: 'user-1',
    stockLote: 42,
    stockAnio: 2026,
    stockEntradasAntes: 1000,
    stockSalidasAntes: 200,
    stockEntradasDespues: 1000,
    stockSalidasDespues: 200,
    mezcla: {
      sustrato1: null,
      porcentaje1: null,
      sustrato2: null,
      porcentaje2: null,
      sustrato3: null,
      porcentaje3: null,
      sustrato4: null,
      porcentaje4: null,
    },
    user: { username: 'admin' },
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    deletedByUserId: null,
  };

  const mockDto = {
    id: 'sp-1',
    partidaId: 100,
    anio: 2026,
    indice: 1,
    codigoEspecie: '',
    nombreEspecie: '',
    metodoMaquina: true,
    prensadoSustrato: 25,
    profundidadSemilla: '1.525',
    tratamientoSemilla: '',
    mezclaId: 'mezcla-1',
    userId: 'user-1',
    mezclaNombre: 'Sin mezcla',
    usuarioNombre: 'admin',
    cg: undefined,
    fSiembra: undefined,
    lote: undefined,
    anoLote: undefined,
    item: undefined,
    semxgr: undefined,
    ajuste: undefined,
    cantidadGrs: undefined,
    cantidaNroCont: undefined,
    detalleExtendido: undefined,
    stockLote: 42,
    stockAnio: 2026,
    stockEntradasAntes: 1000,
    stockSalidasAntes: 200,
    stockEntradasDespues: 1000,
    stockSalidasDespues: 200,
    tratamientoNombre: undefined,
    entityId: undefined,
    entityNombre: undefined,
    startTime: undefined,
    endTime: undefined,
    empleados: undefined,
    createdAt: '2026-08-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      createSiembraPartida: jest.fn(),
      update: jest.fn(),
    };

    prismaMock = {
      sustratos: { upsert: jest.fn() },
      mezcla: { upsert: jest.fn() },
      siembraPartidas: { findFirst: jest.fn() },
    };

    partidasRepoMock = { findByComposite: jest.fn() };
    taskShiftsRepoMock = { findByPartidaComposite: jest.fn() };
    tratamientoServiceMock = { getByCodigo: jest.fn() };
    sustratoServiceMock = { getByCodigo: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiembraPartidasService,
        { provide: SiembraPartidasRepository, useValue: repo },
        { provide: PrismaService, useValue: prismaMock },
        { provide: PartidasRepository, useValue: partidasRepoMock },
        { provide: TaskShiftsRepository, useValue: taskShiftsRepoMock },
        { provide: LegacyTratamientoService, useValue: tratamientoServiceMock },
        { provide: LegacySustratoService, useValue: sustratoServiceMock },
      ],
    }).compile();

    service = module.get<SiembraPartidasService>(SiembraPartidasService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllSiembraPartidas', () => {
    it('returns mapped DTOs from repository', async () => {
      repo.findAll.mockResolvedValue([mockRow]);
      partidasRepoMock.findByComposite.mockResolvedValue(null);
      taskShiftsRepoMock.findByPartidaComposite.mockResolvedValue(null);

      const result = await service.getAllSiembraPartidas('user-1');

      expect(result).toEqual([mockDto]);
      expect(repo.findAll).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when none exist', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.getAllSiembraPartidas('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getSiembraPartidaById', () => {
    it('returns mapped DTO when found', async () => {
      repo.findById.mockResolvedValue(mockRow);
      partidasRepoMock.findByComposite.mockResolvedValue(null);
      taskShiftsRepoMock.findByPartidaComposite.mockResolvedValue(null);

      const result = await service.getSiembraPartidaById('sp-1', 'user-1');

      expect(result).toEqual(mockDto);
      expect(repo.findById).toHaveBeenCalledWith('sp-1', 'user-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.getSiembraPartidaById('nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSiembraPartida', () => {
    it('delegates to repository createSiembraPartida with stock fields', async () => {
      repo.createSiembraPartida.mockResolvedValue(mockRow);
      repo.findById.mockResolvedValue(mockRow);
      partidasRepoMock.findByComposite.mockResolvedValue(null);
      taskShiftsRepoMock.findByPartidaComposite.mockResolvedValue(null);

      const data = {
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        prensadoSustrato: 25,
        profundidadSemilla: '1.525',
        tratamientoSemilla: '',
        mezclaId: 'mezcla-1',
        userId: 'user-1',
        stockLote: 42,
        stockAnio: 2026,
        stockEntradasAntes: 1000,
        stockSalidasAntes: 200,
        stockEntradasDespues: 1000,
        stockSalidasDespues: 200,
      };
      const result = await service.createSiembraPartida(data, 'user-1');

      expect(result).toEqual(mockDto);
      expect(repo.createSiembraPartida).toHaveBeenCalledWith({
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        prensadoSustrato: 25,
        profundidadSemilla: '1.525',
        tratamientoSemilla: '',
        stockLote: 42,
        stockAnio: 2026,
        stockEntradasAntes: 1000,
        stockSalidasAntes: 200,
        stockEntradasDespues: 1000,
        stockSalidasDespues: 200,
        mezcla: { connect: { id: 'mezcla-1' } },
        user: { connect: { id: 'user-1' } },
      });
    });

    it('delegates to repository without stock fields when undefined', async () => {
      const rowWithoutStock = {
        ...mockRow,
        stockLote: null,
        stockAnio: null,
        stockEntradasAntes: null,
        stockSalidasAntes: null,
        stockEntradasDespues: null,
        stockSalidasDespues: null,
      };
      repo.createSiembraPartida.mockResolvedValue(rowWithoutStock);
      repo.findById.mockResolvedValue(rowWithoutStock);
      partidasRepoMock.findByComposite.mockResolvedValue(null);
      taskShiftsRepoMock.findByPartidaComposite.mockResolvedValue(null);

      const data = {
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        prensadoSustrato: 25,
        profundidadSemilla: '1.525',
        tratamientoSemilla: '',
        mezclaId: 'mezcla-1',
      };
      await service.createSiembraPartida(data, 'user-1');

      expect(repo.createSiembraPartida).toHaveBeenCalledWith({
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        prensadoSustrato: 25,
        profundidadSemilla: '1.525',
        tratamientoSemilla: '',
        stockLote: undefined,
        stockAnio: undefined,
        stockEntradasAntes: undefined,
        stockSalidasAntes: undefined,
        stockEntradasDespues: undefined,
        stockSalidasDespues: undefined,
        mezcla: { connect: { id: 'mezcla-1' } },
        user: { connect: { id: 'user-1' } },
      });
    });
  });

  describe('autorizarSiembra', () => {
    const autorizarData = {
      partidaId: 100,
      anio: 2026,
      indice: 1,
    };

    it('creates a new row when no existing row', async () => {
      prismaMock.siembraPartidas.findFirst.mockResolvedValue(null);
      prismaMock.sustratos.upsert.mockResolvedValue({ id: 'sustrato-1' });
      prismaMock.mezcla.upsert.mockResolvedValue({ id: 'mezcla-1' });
      repo.createSiembraPartida.mockResolvedValue(mockRow);
      repo.findById.mockResolvedValue(mockRow);
      partidasRepoMock.findByComposite.mockResolvedValue(null);
      taskShiftsRepoMock.findByPartidaComposite.mockResolvedValue(null);

      const result = await service.autorizarSiembra(autorizarData, 'user-1');

      expect(result).toEqual(mockDto);
      expect(repo.createSiembraPartida).toHaveBeenCalled();
    });

    it('re-authorizes when row exists with isActive = false', async () => {
      const deactivatedRow = { ...mockRow, isActive: false };
      prismaMock.siembraPartidas.findFirst.mockResolvedValue(deactivatedRow);
      repo.update.mockResolvedValue({ ...mockRow, isActive: true });
      repo.findById.mockResolvedValue({ ...mockRow, isActive: true });
      partidasRepoMock.findByComposite.mockResolvedValue(null);
      taskShiftsRepoMock.findByPartidaComposite.mockResolvedValue(null);

      const result = await service.autorizarSiembra(autorizarData, 'user-1');

      expect(result).toEqual(mockDto);
      expect(repo.update).toHaveBeenCalledWith('sp-1', {
        isActive: true,
        profundidadSemilla: 0,
      });
    });

    it('throws ConflictException when row exists with isActive = true', async () => {
      const activeRow = { ...mockRow, isActive: true };
      prismaMock.siembraPartidas.findFirst.mockResolvedValue(activeRow);

      await expect(
        service.autorizarSiembra(autorizarData, 'user-1'),
      ).rejects.toThrow('Esta partida ya fue autorizada para siembra');
    });
  });

  describe('desautorizarSiembra', () => {
    it('sets isActive = false on an authorized row', async () => {
      const activeRow = {
        ...mockRow,
        isActive: true,
        profundidadSemilla: { toNumber: () => 0 },
      };
      repo.findById.mockResolvedValue(activeRow);
      repo.update.mockResolvedValue({ ...activeRow, isActive: false });
      const deactivatedRow = { ...activeRow, isActive: false };
      repo.findById
        .mockResolvedValueOnce(activeRow)
        .mockResolvedValueOnce(deactivatedRow);
      partidasRepoMock.findByComposite.mockResolvedValue(null);
      taskShiftsRepoMock.findByPartidaComposite.mockResolvedValue(null);

      const result = await service.desautorizarSiembra('sp-1', 'user-1');

      expect(repo.update).toHaveBeenCalledWith('sp-1', { isActive: false });
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when row not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.desautorizarSiembra('nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when profundidadSemilla > 0', async () => {
      const completedRow = {
        ...mockRow,
        isActive: true,
        profundidadSemilla: { toNumber: () => 1.5 },
      };
      repo.findById.mockResolvedValue(completedRow);

      await expect(
        service.desautorizarSiembra('sp-1', 'user-1'),
      ).rejects.toThrow('No se puede desautorizar una partida ya completada');
    });

    it('throws ConflictException when already de-authorized', async () => {
      const deactivatedRow = {
        ...mockRow,
        isActive: false,
        profundidadSemilla: { toNumber: () => 0 },
      };
      repo.findById.mockResolvedValue(deactivatedRow);

      await expect(
        service.desautorizarSiembra('sp-1', 'user-1'),
      ).rejects.toThrow('Esta partida ya fue desautorizada');
    });
  });
});
