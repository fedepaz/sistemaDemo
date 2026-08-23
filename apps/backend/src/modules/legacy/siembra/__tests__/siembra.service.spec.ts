import { Test, TestingModule } from '@nestjs/testing';
import { SiembraService } from '../siembra.service';
import { SiembraRepository } from '../repositories/siembra.repository';

describe('SiembraService', () => {
  let service: SiembraService;
  let siembraRepo: {
    findAllSiembra: jest.Mock;
  };

  beforeEach(async () => {
    siembraRepo = {
      findAllSiembra: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiembraService,
        { provide: SiembraRepository, useValue: siembraRepo },
      ],
    }).compile();

    service = module.get<SiembraService>(SiembraService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSiembra', () => {
    it('should return mapped siembra data', async () => {
      const rows = [
        {
          partida: 1,
          ano: 2024,
          indice: 1,
          planta: 'PIN',
          nombre: 'Pino',
          hai: 'H',
          injerto: 'No',
          f_siem: '2024-01-15',
          propiedad: 'Propiedad A',
          solicito: 'Juan',
          lote: 'L001',
          ano_lote: '2024',
          ajuste: '5.0',
          nrocont: '100',
          extendido: 'Notas',
          germin: '85',
        },
      ];
      siembraRepo.findAllSiembra.mockResolvedValue(rows);

      const result = await service.getAllSiembra();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        partidaId: 1,
        anio: 2024,
        indice: 1,
        codigoEspecie: 'PIN',
        nombreEspecie: 'Pino',
        hai: 'H',
        injerto: 'No',
        fechaSugeridaSiembra: '2024-01-15',
        propiedad: 'Propiedad A',
        solicito: 'Juan',
        lote: 'L001',
        anoLote: '2024',
        ajuste: '5.0',
        nrocont: '100',
        extendido: 'Notas',
        germin: '85',
      });
    });

    it('should return empty array when no data', async () => {
      siembraRepo.findAllSiembra.mockResolvedValue([]);

      const result = await service.getAllSiembra();

      expect(result).toEqual([]);
    });
  });
});
