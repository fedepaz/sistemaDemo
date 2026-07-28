import { Test, TestingModule } from '@nestjs/testing';
import { AlertsController } from '../alerts.controller';
import { AlertsService } from '../alerts.service';

describe('AlertsController', () => {
  let controller: AlertsController;
  let _service: jest.Mocked<AlertsService>;

  const mockService = {
    getSiembraRetrasada: jest.fn(),
    getFaltaGerminacion: jest.fn(),
    getFaltantePlantas: jest.fn(),
    getFaltaPreExpedicion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [{ provide: AlertsService, useValue: mockService }],
    }).compile();

    controller = module.get<AlertsController>(AlertsController);
    _service = module.get(AlertsService);
    jest.clearAllMocks();
  });

  describe('GET /l-alerts/siembra-retrasada', () => {
    it('returns siembra retrasada alerts', async () => {
      const mockData = [
        {
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
        },
      ];
      mockService.getSiembraRetrasada.mockResolvedValue(mockData);

      const result = await controller.getSiembraRetrasada();

      expect(result).toEqual(mockData);
      expect(mockService.getSiembraRetrasada).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /l-alerts/falta-germinacion', () => {
    it('returns falta germinacion alerts', async () => {
      const mockData = [
        {
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
        },
      ];
      mockService.getFaltaGerminacion.mockResolvedValue(mockData);

      const result = await controller.getFaltaGerminacion();

      expect(result).toEqual(mockData);
      expect(mockService.getFaltaGerminacion).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /l-alerts/faltante-plantas', () => {
    it('returns faltante plantas alerts', async () => {
      const mockData = [
        {
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
        },
      ];
      mockService.getFaltantePlantas.mockResolvedValue(mockData);

      const result = await controller.getFaltantePlantas();

      expect(result).toEqual(mockData);
      expect(mockService.getFaltantePlantas).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /l-alerts/falta-pre-expedicion', () => {
    it('returns falta pre-expedicion alerts', async () => {
      const mockData = [
        {
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
        },
      ];
      mockService.getFaltaPreExpedicion.mockResolvedValue(mockData);

      const result = await controller.getFaltaPreExpedicion();

      expect(result).toEqual(mockData);
      expect(mockService.getFaltaPreExpedicion).toHaveBeenCalledTimes(1);
    });
  });
});
