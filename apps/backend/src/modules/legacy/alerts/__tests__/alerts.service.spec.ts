import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from '../alerts.service';
import { AlertsRepository } from '../repositories/alerts.repository';
import { AlertCommentsRepository } from '../../../alertComments/repositories/alertComments.repository';
import { AlertSolvedService } from '../../../alertSolved/alertSolved.service';
import {
  LegacySiembraRetrasada,
  LegacyFaltaGerminacion,
  LegacyFaltantePlantas,
  LegacyFaltaPreExpedicion,
} from '../interfaces/alerts.interface';

describe('AlertsService', () => {
  let service: AlertsService;
  let repository: jest.Mocked<AlertsRepository>;

  const mockRepository = {
    findSiembraRetrasada: jest.fn(),
    findFaltaGerminacion: jest.fn(),
    findFaltantePlantas: jest.fn(),
    findFaltaPreExpedicion: jest.fn(),
  };

  const mockAlertCommentsRepo = {
    getCommentCounts: jest.fn().mockResolvedValue(new Map()),
  };

  const mockAlertSolvedService = {
    getSolvedAlerts: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: AlertsRepository, useValue: mockRepository },
        { provide: AlertCommentsRepository, useValue: mockAlertCommentsRepo },
        { provide: AlertSolvedService, useValue: mockAlertSolvedService },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    repository = module.get(AlertsRepository);
    jest.clearAllMocks();
    mockAlertCommentsRepo.getCommentCounts.mockResolvedValue(new Map());
    mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([]);
  });

  describe('getSiembraRetrasada', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacySiembraRetrasada = {
        partida: 1045,
        ano: 2026,
        indice: 1,
        planta: 'EUC01',
        nombre: 'Eucalipto Grandis',
        injerto: 'I001',
        nrocont: '48',
        semSiembra: '24-2026',
        f_siem: '2026-06-01',
        f_siembra: 0,
        semEntrega: '28-2026 1',
        f_ent: '2026-07-15',
        estado: 'PENDIENTE',
      } as LegacySiembraRetrasada;

      repository.findSiembraRetrasada.mockResolvedValue([legacyRow]);

      const result = await service.getSiembraRetrasada();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        partidaId: 1045,
        anio: 2026,
        indice: 1,
        codigoEspecie: 'EUC01',
        nombreEspecie: 'Eucalipto Grandis',
        injerto: 'I001',
        nrocont: '48',
        semSiembra: '24-2026',
        fechaSugeridaSiembra: '2026-06-01',
        fSiembra: 0,
        semEntrega: '28-2026 1',
        fEnt: '2026-07-15',
        estado: 'PENDIENTE',
        commentCount: 0,
      });
    });

    it('returns empty array when no data', async () => {
      repository.findSiembraRetrasada.mockResolvedValue([]);
      const result = await service.getSiembraRetrasada();
      expect(result).toEqual([]);
    });

    it('merges commentCount from AlertCommentsRepository', async () => {
      const legacyRow: LegacySiembraRetrasada = {
        partida: 1045,
        ano: 2026,
        indice: 1,
        planta: 'EUC01',
        nombre: 'Eucalipto Grandis',
        injerto: 'I001',
        nrocont: '48',
        semSiembra: '24-2026',
        f_siem: '2026-06-01',
        f_siembra: 0,
        semEntrega: '28-2026 1',
        f_ent: '2026-07-15',
        estado: 'PENDIENTE',
      } as LegacySiembraRetrasada;

      repository.findSiembraRetrasada.mockResolvedValue([legacyRow]);
      const countsMap = new Map([['1045-2026-1', 3]]);
      mockAlertCommentsRepo.getCommentCounts.mockResolvedValue(countsMap);

      const result = await service.getSiembraRetrasada();

      expect(result[0].commentCount).toBe(3);
      expect(mockAlertCommentsRepo.getCommentCounts).toHaveBeenCalledWith(
        'SIEMBRA_RETRASADA',
        expect.arrayContaining([
          expect.objectContaining({ partidaId: 1045, anio: 2026, indice: 1 }),
        ]),
      );
    });

    it('filters out solved alerts', async () => {
      const legacyRows: LegacySiembraRetrasada[] = [
        {
          partida: 1045,
          ano: 2026,
          indice: 1,
          planta: 'EUC01',
          nombre: 'Eucalipto Grandis',
          injerto: 'I001',
          nrocont: '48',
          semSiembra: '24-2026',
          f_siem: '2026-06-01',
          f_siembra: 0,
          semEntrega: '28-2026 1',
          f_ent: '2026-07-15',
          estado: 'PENDIENTE',
        } as LegacySiembraRetrasada,
        {
          partida: 1046,
          ano: 2026,
          indice: 1,
          planta: 'ROS01',
          nombre: 'Rosa',
          injerto: 'I002',
          nrocont: '50',
          semSiembra: '24-2026',
          f_siem: '2026-06-01',
          f_siembra: 0,
          semEntrega: '28-2026 1',
          f_ent: '2026-07-15',
          estado: 'PENDIENTE',
        } as LegacySiembraRetrasada,
      ];

      repository.findSiembraRetrasada.mockResolvedValue(legacyRows);
      mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([
        {
          id: 'solved-1',
          partidaId: 1045,
          anio: 2026,
          indice: 1,
          userId: 'user-1',
          userName: 'admin',
          createdAt: '2026-08-13T00:00:00.000Z',
        },
      ]);

      const result = await service.getSiembraRetrasada();

      expect(result).toHaveLength(1);
      expect(result[0].partidaId).toBe(1046);
      expect(mockAlertSolvedService.getSolvedAlerts).toHaveBeenCalledWith(
        '',
        true,
      );
    });

    it('returns all alerts when none are solved', async () => {
      const legacyRows: LegacySiembraRetrasada[] = [
        {
          partida: 1045,
          ano: 2026,
          indice: 1,
          planta: 'EUC01',
          nombre: 'Eucalipto Grandis',
          injerto: 'I001',
          nrocont: '48',
          semSiembra: '24-2026',
          f_siem: '2026-06-01',
          f_siembra: 0,
          semEntrega: '28-2026 1',
          f_ent: '2026-07-15',
          estado: 'PENDIENTE',
        } as LegacySiembraRetrasada,
      ];

      repository.findSiembraRetrasada.mockResolvedValue(legacyRows);
      mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([]);

      const result = await service.getSiembraRetrasada();

      expect(result).toHaveLength(1);
    });

    it('defaults commentCount to 0 when no comments exist', async () => {
      const legacyRow: LegacySiembraRetrasada = {
        partida: 1045,
        ano: 2026,
        indice: 1,
        planta: 'EUC01',
        nombre: 'Eucalipto Grandis',
        injerto: 'I001',
        nrocont: '48',
        semSiembra: '24-2026',
        f_siem: '2026-06-01',
        f_siembra: 0,
        semEntrega: '28-2026 1',
        f_ent: '2026-07-15',
        estado: 'PENDIENTE',
      } as LegacySiembraRetrasada;

      repository.findSiembraRetrasada.mockResolvedValue([legacyRow]);

      const result = await service.getSiembraRetrasada();
      expect(result[0].commentCount).toBe(0);
    });
  });

  describe('getFaltaGerminacion', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacyFaltaGerminacion = {
        partida: 1050,
        ano: 2026,
        indice: 1,
        planta: 'ROS01',
        nombre: 'Rosa Hybrid Tea',
        injerto: 'I002',
        nrocont: '104',
        f_primer: '2026-07-01',
        pr: '0',
      } as LegacyFaltaGerminacion;

      repository.findFaltaGerminacion.mockResolvedValue([legacyRow]);

      const result = await service.getFaltaGerminacion();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        partidaId: 1050,
        anio: 2026,
        indice: 1,
        codigoEspecie: 'ROS01',
        nombreEspecie: 'Rosa Hybrid Tea',
        injerto: 'I002',
        nrocont: '104',
        fPrimer: '2026-07-01',
        pr: '0',
        commentCount: 0,
      });
    });

    it('keeps pr as string (decimal precision)', async () => {
      const legacyRow: LegacyFaltaGerminacion = {
        partida: 1051,
        ano: 2026,
        indice: 1,
        planta: 'EUC01',
        nombre: 'Eucalipto',
        injerto: 'I001',
        nrocont: '48',
        f_primer: '2026-07-01',
        pr: '85.5',
      } as LegacyFaltaGerminacion;

      repository.findFaltaGerminacion.mockResolvedValue([legacyRow]);

      const result = await service.getFaltaGerminacion();

      expect(result[0].pr).toBe('85.5');
      expect(typeof result[0].pr).toBe('string');
    });

    it('filters out solved alerts', async () => {
      const legacyRows: LegacyFaltaGerminacion[] = [
        {
          partida: 1050,
          ano: 2026,
          indice: 1,
          planta: 'ROS01',
          nombre: 'Rosa Hybrid Tea',
          injerto: 'I002',
          nrocont: '104',
          f_primer: '2026-07-01',
          pr: '0',
        } as LegacyFaltaGerminacion,
      ];

      repository.findFaltaGerminacion.mockResolvedValue(legacyRows);
      mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([
        {
          id: 'solved-2',
          partidaId: 1050,
          anio: 2026,
          indice: 1,
          userId: 'user-1',
          userName: 'admin',
          createdAt: '2026-08-13T00:00:00.000Z',
        },
      ]);

      const result = await service.getFaltaGerminacion();

      expect(result).toHaveLength(0);
      expect(mockAlertSolvedService.getSolvedAlerts).toHaveBeenCalledWith(
        '',
        true,
      );
    });
  });

  describe('getFaltantePlantas', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacyFaltantePlantas = {
        partida: 1048,
        ano: 2026,
        indice: 1,
        siembras: 3,
        planta: 'EUC01',
        nombre: 'Eucalipto Grandis',
        nrocont: '500',
        solicito: 500,
        producido: 342,
        diferencia: -158,
      } as unknown as LegacyFaltantePlantas;

      repository.findFaltantePlantas.mockResolvedValue([legacyRow]);

      const result = await service.getFaltantePlantas();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        partidaId: 1048,
        anio: 2026,
        indice: 1,
        siembras: 3,
        codigoEspecie: 'EUC01',
        nombreEspecie: 'Eucalipto Grandis',
        nrocont: '500',
        solicito: 500,
        producido: 342,
        diferencia: -158,
        commentCount: 0,
      });
    });

    it('converts aggregate numbers correctly', async () => {
      const legacyRow: LegacyFaltantePlantas = {
        partida: 1049,
        ano: 2026,
        indice: 2,
        siembras: 5,
        planta: 'ROS01',
        nombre: 'Rosa',
        nrocont: '100',
        solicito: 200,
        producido: 120,
        diferencia: -80,
      } as unknown as LegacyFaltantePlantas;

      repository.findFaltantePlantas.mockResolvedValue([legacyRow]);

      const result = await service.getFaltantePlantas();

      expect(typeof result[0].siembras).toBe('number');
      expect(typeof result[0].solicito).toBe('number');
      expect(typeof result[0].producido).toBe('number');
      expect(typeof result[0].diferencia).toBe('number');
      expect(result[0].siembras).toBe(5);
      expect(result[0].diferencia).toBe(-80);
    });

    it('filters out solved alerts', async () => {
      const legacyRows: LegacyFaltantePlantas[] = [
        {
          partida: 1048,
          ano: 2026,
          indice: 1,
          siembras: 3,
          planta: 'EUC01',
          nombre: 'Eucalipto Grandis',
          nrocont: '500',
          solicito: 500,
          producido: 342,
          diferencia: -158,
        } as unknown as LegacyFaltantePlantas,
      ];

      repository.findFaltantePlantas.mockResolvedValue(legacyRows);
      mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([
        {
          id: 'solved-3',
          partidaId: 1048,
          anio: 2026,
          indice: 1,
          userId: 'user-1',
          userName: 'admin',
          createdAt: '2026-08-13T00:00:00.000Z',
        },
      ]);

      const result = await service.getFaltantePlantas();

      expect(result).toHaveLength(0);
      expect(mockAlertSolvedService.getSolvedAlerts).toHaveBeenCalledWith(
        '',
        true,
      );
    });
  });

  describe('getFaltaPreExpedicion', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacyFaltaPreExpedicion = {
        partida: 1052,
        ano: 2026,
        indice: 1,
        planta: 'LIM02',
        nombre: 'Limonero Volkameriano',
        injerto: 'I003',
        nrocont: '96',
        f_preexp: '2026-07-20',
        pe: 0,
      } as LegacyFaltaPreExpedicion;

      repository.findFaltaPreExpedicion.mockResolvedValue([legacyRow]);

      const result = await service.getFaltaPreExpedicion();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        partidaId: 1052,
        anio: 2026,
        indice: 1,
        codigoEspecie: 'LIM02',
        nombreEspecie: 'Limonero Volkameriano',
        injerto: 'I003',
        nrocont: '96',
        fPreexp: '2026-07-20',
        pe: 0,
        commentCount: 0,
      });
    });

    it('returns empty array when no data', async () => {
      repository.findFaltaPreExpedicion.mockResolvedValue([]);
      const result = await service.getFaltaPreExpedicion();
      expect(result).toEqual([]);
    });

    it('filters out solved alerts', async () => {
      const legacyRows: LegacyFaltaPreExpedicion[] = [
        {
          partida: 1052,
          ano: 2026,
          indice: 1,
          planta: 'LIM02',
          nombre: 'Limonero Volkameriano',
          injerto: 'I003',
          nrocont: '96',
          f_preexp: '2026-07-20',
          pe: 0,
        } as LegacyFaltaPreExpedicion,
      ];

      repository.findFaltaPreExpedicion.mockResolvedValue(legacyRows);
      mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([
        {
          id: 'solved-4',
          partidaId: 1052,
          anio: 2026,
          indice: 1,
          userId: 'user-1',
          userName: 'admin',
          createdAt: '2026-08-13T00:00:00.000Z',
        },
      ]);

      const result = await service.getFaltaPreExpedicion();

      expect(result).toHaveLength(0);
      expect(mockAlertSolvedService.getSolvedAlerts).toHaveBeenCalledWith(
        '',
        true,
      );
    });
  });

  describe('validateHeaderFields', () => {
    it('should log error for missing header fields but not throw', () => {
      const row = {
        partidaId: 123,
        anio: 2024,
        indice: 1,
        // Missing codigoEspecie and nombreEspecie
      };

      // Should not throw - validation is logging only for legacy data resilience
      expect(() => service.validateHeaderFields(row, 'alerts')).not.toThrow();
    });

    it('should not throw for valid header fields', () => {
      const row = {
        partidaId: 123,
        anio: 2024,
        indice: 1,
        codigoEspecie: 'ESP001',
        nombreEspecie: 'Especie Test',
      };

      expect(() => service.validateHeaderFields(row, 'alerts')).not.toThrow();
    });

    it('should log error when partidaId is null but not throw', () => {
      const row = {
        partidaId: null,
        anio: 2024,
        indice: 1,
        codigoEspecie: 'ESP001',
        nombreEspecie: 'Especie Test',
      };

      // Should not throw - validation is logging only for legacy data resilience
      expect(() => service.validateHeaderFields(row, 'alerts')).not.toThrow();
    });

    it('should log error when all header fields are missing but not throw', () => {
      const row = {};

      // Should not throw - validation is logging only for legacy data resilience
      expect(() => service.validateHeaderFields(row, 'alerts')).not.toThrow();
    });
  });
});
