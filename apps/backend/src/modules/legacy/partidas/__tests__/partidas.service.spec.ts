// src/modules/legacy/partidas/__tests__/partidas.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import type { AsignarUbiSiembraCompletaDto } from '@vivero/shared';
import { PartidasService } from '../partidas.service';
import { PartidasRepository } from '../repositories/partidas.repository';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { SiembraPartidasService } from '../../../siembraPartidas/siembraPartidas.service';
import { TaskShiftsService } from '../../../taskShifts/taskShifts.service';
import { LegacyStockService } from '../../stock/stock.service';
import { AuditEventEmitter } from '../../../auditLog/events/audit-event.emitter';

describe('PartidasService', () => {
  let service: PartidasService;
  let partidasRepoMock: { asignarSiembra: jest.Mock };
  let legacyMysqlMock: { transaction: jest.Mock };
  let siembraPartidasMock: { createSiembraPartida: jest.Mock };
  let taskShiftsMock: { createTaskShift: jest.Mock };
  let stockMock: { updateStock: jest.Mock };
  let auditMock: { emitCrud: jest.Mock };

  const connMock = {};

  const dto = {
    partidaId: 100,
    anio: 2026,
    indice: 1,
    cg: 5,
    cantidaNroCont: 12,
    lote: 29,
    anoLote: 2022,
    item: 1,
    semxgr: 243,
    cantidadGrs: 2.58,
    detalleExtendido: '',
    edita: 'S',
    metodoMaquina: true,
    prensadoSustrato: 2,
    profundidadSemilla: '1.5',
    tratamientoSemilla: '',
    sustrato: 'sustrato1',
  } as AsignarUbiSiembraCompletaDto;

  beforeEach(async () => {
    partidasRepoMock = {
      asignarSiembra: jest.fn().mockResolvedValue(undefined),
    };
    legacyMysqlMock = {
      transaction: jest
        .fn()
        .mockImplementation(async (fn: (c: unknown) => Promise<unknown>) =>
          fn(connMock),
        ),
    };
    siembraPartidasMock = { createSiembraPartida: jest.fn() };
    taskShiftsMock = {
      createTaskShift: jest.fn().mockResolvedValue(undefined),
    };
    stockMock = {
      updateStock: jest.fn().mockResolvedValue({ entradas: 0, salidas: 0 }),
    };
    auditMock = { emitCrud: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartidasService,
        { provide: PartidasRepository, useValue: partidasRepoMock },
        { provide: LegacyMysqlService, useValue: legacyMysqlMock },
        { provide: SiembraPartidasService, useValue: siembraPartidasMock },
        { provide: TaskShiftsService, useValue: taskShiftsMock },
        { provide: LegacyStockService, useValue: stockMock },
        { provide: AuditEventEmitter, useValue: auditMock },
      ],
    }).compile();

    service = module.get<PartidasService>(PartidasService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('completarSiembraLegacy', () => {
    it('writes g = cantidadGrs and c = floor(cantidadGrs * semxgr) to partidas1', async () => {
      await service.completarSiembraLegacy(dto, 'user-1', 'tenant-1');

      expect(partidasRepoMock.asignarSiembra).toHaveBeenCalledWith(
        {
          partida: 100,
          ano: 2026,
          indice: 1,
          f_siembra: expect.any(Date),
          cg: 5,
          cantidaNroCont: 12,
          g: 2.58,
          c: 626,
          detalle: '',
        },
        connMock,
      );
    });

    it('calls updateStock with lote/anoLote/item AFTER writing partidas1', async () => {
      await service.completarSiembraLegacy(dto, 'user-1', 'tenant-1');

      expect(stockMock.updateStock).toHaveBeenCalledWith(29, 2022, 1, connMock);
      expect(
        partidasRepoMock.asignarSiembra.mock.invocationCallOrder[0],
      ).toBeLessThan(stockMock.updateStock.mock.invocationCallOrder[0]);
    });

    it('throws BadRequestException when edita is N', async () => {
      await expect(
        service.completarSiembraLegacy(
          { ...dto, edita: 'N' },
          'user-1',
          'tenant-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when cg is 0', async () => {
      await expect(
        service.completarSiembraLegacy({ ...dto, cg: 0 }, 'user-1', 'tenant-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a task shift when startTime and endTime are present', async () => {
      await service.completarSiembraLegacy(
        {
          ...dto,
          startTime: '2026-09-15T08:00:00.000-03:00',
          endTime: '2026-09-15T12:00:00.000-03:00',
          entityId: 'cltaskshiftpayload0000000',
          employeeUserIds: [],
        },
        'user-1',
        'tenant-1',
      );

      expect(taskShiftsMock.createTaskShift).toHaveBeenCalledWith(
        expect.objectContaining({ partidaId: 100, anio: 2026, indice: 1 }),
        'user-1',
      );
    });

    it('skips task shift when times are absent', async () => {
      await service.completarSiembraLegacy(dto, 'user-1', 'tenant-1');

      expect(taskShiftsMock.createTaskShift).not.toHaveBeenCalled();
    });

    it('propagates updateStock failure without creating a task shift', async () => {
      stockMock.updateStock.mockRejectedValueOnce(new Error('stock failed'));

      await expect(
        service.completarSiembraLegacy(
          {
            ...dto,
            startTime: '2026-09-15T08:00:00.000-03:00',
            endTime: '2026-09-15T12:00:00.000-03:00',
            entityId: 'cltaskshiftpayload0000000',
            employeeUserIds: [],
          },
          'user-1',
          'tenant-1',
        ),
      ).rejects.toThrow('stock failed');

      expect(taskShiftsMock.createTaskShift).not.toHaveBeenCalled();
    });

    it('emits a SIEMBRA CRUD audit event after a successful completar', async () => {
      await service.completarSiembraLegacy(dto, 'user-1', 'tenant-1');

      expect(auditMock.emitCrud).toHaveBeenCalledTimes(1);
      expect(auditMock.emitCrud).toHaveBeenCalledWith({
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'UPDATE',
        entityType: 'SIEMBRA',
        entityId: 'partida:100|ano:2026|indice:1',
        timestamp: expect.any(Date),
        changes: {
          requestId: 'unknown',
          endpoint: '/l-partidas/asignar-siembra',
          method: 'PATCH',
          params: {},
          query: {},
          body: {
            lote: 29,
            anoLote: 2022,
            item: 1,
            cantidadGrs: 2.58,
            semxgr: 243,
            c: 626,
            cg: 5,
            cantidaNroCont: 12,
          },
          affected: null,
          durationMs: 0,
        },
      });
    });

    it('does not emit a CRUD audit event when the legacy transaction fails', async () => {
      stockMock.updateStock.mockRejectedValueOnce(new Error('stock failed'));

      await expect(
        service.completarSiembraLegacy(dto, 'user-1', 'tenant-1'),
      ).rejects.toThrow('stock failed');

      expect(auditMock.emitCrud).not.toHaveBeenCalled();
    });

    it('emits the CRUD audit event even when the task shift fails', async () => {
      taskShiftsMock.createTaskShift.mockRejectedValueOnce(
        new Error('taskshift failed'),
      );

      await expect(
        service.completarSiembraLegacy(
          {
            ...dto,
            startTime: '2026-09-15T08:00:00.000-03:00',
            endTime: '2026-09-15T12:00:00.000-03:00',
            entityId: 'cltaskshiftpayload0000000',
            employeeUserIds: [],
          },
          'user-1',
          'tenant-1',
        ),
      ).rejects.toThrow('taskshift failed');

      expect(auditMock.emitCrud).toHaveBeenCalledTimes(1);
    });

    it('throws BadRequestException when semxgr is 0', async () => {
      await expect(
        service.completarSiembraLegacy(
          { ...dto, semxgr: 0 },
          'user-1',
          'tenant-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
