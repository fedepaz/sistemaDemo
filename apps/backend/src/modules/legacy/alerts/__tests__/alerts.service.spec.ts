import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from '../alerts.service';
import { AlertsRepository } from '../repositories/alerts.repository';
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: AlertsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    repository = module.get(AlertsRepository);
    jest.clearAllMocks();
  });

  describe('getSiembraRetrasada', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacySiembraRetrasada = {
        partida: 1045,
        ano: 2026,
        indice: 1,
        espvar: 'EUC01',
        nombre: 'Eucalipto Grandis',
        injerto: 'I001',
        nrocont: '48',
        contenedor: 'Ban Plastico',
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
        contenedor: 'Ban Plastico',
        semSiembra: '24-2026',
        fechaSugeridaSiembra: '2026-06-01',
        fSiembra: 0,
        semEntrega: '28-2026 1',
        fEnt: '2026-07-15',
        estado: 'PENDIENTE',
      });
    });

    it('returns empty array when no data', async () => {
      repository.findSiembraRetrasada.mockResolvedValue([]);
      const result = await service.getSiembraRetrasada();
      expect(result).toEqual([]);
    });
  });

  describe('getFaltaGerminacion', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacyFaltaGerminacion = {
        partida: 1050,
        ano: 2026,
        indice: 1,
        espvar: 'ROS01',
        nombre: 'Rosa Hybrid Tea',
        injerto: 'I002',
        nrocont: '104',
        contenedor: 'Bandeja 104',
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
        contenedor: 'Bandeja 104',
        fPrimer: '2026-07-01',
        pr: '0',
      });
    });

    it('keeps pr as string (decimal precision)', async () => {
      const legacyRow: LegacyFaltaGerminacion = {
        partida: 1051,
        ano: 2026,
        indice: 1,
        espvar: 'EUC01',
        nombre: 'Eucalipto',
        injerto: 'I001',
        nrocont: '48',
        contenedor: 'Ban Plastico',
        f_primer: '2026-07-01',
        pr: '85.5',
      } as LegacyFaltaGerminacion;

      repository.findFaltaGerminacion.mockResolvedValue([legacyRow]);

      const result = await service.getFaltaGerminacion();

      expect(result[0].pr).toBe('85.5');
      expect(typeof result[0].pr).toBe('string');
    });
  });

  describe('getFaltantePlantas', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacyFaltantePlantas = {
        hai: 'A',
        partida: 1048,
        ano: 2026,
        indice: 1,
        espvar: 'EUC01',
        nombre: 'Eucalipto Grandis',
        nrocont: '500',
        contenedor: 'Ban Plastico',
        solicito: 500,
        f_primer: '2026-06-15',
        pr: '85.5',
        st_ini_pr: '4',
        porPr: 171,
      } as LegacyFaltantePlantas;

      repository.findFaltantePlantas.mockResolvedValue([legacyRow]);

      const result = await service.getFaltantePlantas();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        hai: 'A',
        partidaId: 1048,
        anio: 2026,
        indice: 1,
        codigoEspecie: 'EUC01',
        nombreEspecie: 'Eucalipto Grandis',
        nrocont: '500',
        contenedor: 'Ban Plastico',
        solicito: 500,
        fPrimer: '2026-06-15',
        pr: '85.5',
        stIniPr: '4',
        porPr: 171,
      });
    });

    it('keeps pr and stIniPr as strings', async () => {
      const legacyRow: LegacyFaltantePlantas = {
        hai: 'A',
        partida: 1049,
        ano: 2026,
        indice: 1,
        espvar: 'ROS01',
        nombre: 'Rosa',
        nrocont: '100',
        contenedor: 'Bandeja',
        solicito: 200,
        f_primer: '2026-06-15',
        pr: '92.3',
        st_ini_pr: '2',
        porPr: 184,
      } as LegacyFaltantePlantas;

      repository.findFaltantePlantas.mockResolvedValue([legacyRow]);

      const result = await service.getFaltantePlantas();

      expect(result[0].pr).toBe('92.3');
      expect(result[0].stIniPr).toBe('2');
      expect(typeof result[0].pr).toBe('string');
      expect(typeof result[0].stIniPr).toBe('string');
    });
  });

  describe('getFaltaPreExpedicion', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacyFaltaPreExpedicion = {
        partida: 1052,
        ano: 2026,
        indice: 1,
        espvar: 'LIM02',
        nombre: 'Limonero Volkameriano',
        injerto: 'I003',
        nrocont: '96',
        contenedor: 'Ban Plastico',
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
        contenedor: 'Ban Plastico',
        fPreexp: '2026-07-20',
        pe: 0,
      });
    });

    it('returns empty array when no data', async () => {
      repository.findFaltaPreExpedicion.mockResolvedValue([]);
      const result = await service.getFaltaPreExpedicion();
      expect(result).toEqual([]);
    });
  });
});
