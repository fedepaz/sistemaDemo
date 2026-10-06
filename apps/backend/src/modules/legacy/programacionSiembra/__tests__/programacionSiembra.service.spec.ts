import { Test, TestingModule } from '@nestjs/testing';
import { ProgramacionSiembraService } from '../programacionSiembra.service';
import { ProgramacionSiembraRepository } from '../repositories/programacionSiembra.repository';

describe('ProgramacionSiembraService', () => {
  let service: ProgramacionSiembraService;
  let programacionSiembraRepo: {
    findAllProgramacionSiembra: jest.Mock;
  };

  beforeEach(async () => {
    programacionSiembraRepo = {
      findAllProgramacionSiembra: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramacionSiembraService,
        {
          provide: ProgramacionSiembraRepository,
          useValue: programacionSiembraRepo,
        },
      ],
    }).compile();

    service = module.get<ProgramacionSiembraService>(
      ProgramacionSiembraService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProgramacionSiembra', () => {
    it('should return mapped siembra data', async () => {
      const rows = [
        {
          partida: 1,
          ano: 2024,
          indice: 1,
          planta: 'PIN',
          nombre: 'Pino',
          propiedad: 'Propiedad A',
          injerto: 'No',
          nrocont: '100',
          contenedor: 'C01',
          cantTipoCont: 120,
          sem_siembra: 'S1-2024',
          f_siem: '2024-01-15',
          f_siembra: '2024-01-16',
          lote: 'L001',
          ano_lote: '2024',
          semxgr: '2',
          c: '3',
          g: '4',
        },
      ];
      programacionSiembraRepo.findAllProgramacionSiembra.mockResolvedValue(
        rows,
      );

      const result = await service.getAllProgramacionSiembra();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        partidaId: 1,
        anio: 2024,
        indice: 1,
        codigoEspecie: 'PIN',
        nombreEspecie: 'Pino',
        propiedad: 'Propiedad A',
        injerto: 'No',
        nrocont: '100',
        tipocont: 'C01',
        cantTipoCont: 120,
        sem_siembra: 'S1-2024',
        fechaSugeridaSiembra: '2024-01-15',
        fechaSiembraReal: '2024-01-16',
        lote: 'L001',
        anoLote: '2024',
        semxgr: '2',
        c: '3',
        g: '4',
      });
    });

    it('should map a null cantTipoCont (LEFT JOIN miss) to undefined', async () => {
      const rows = [
        {
          partida: 2,
          ano: 2024,
          indice: 1,
          planta: 'PIN',
          nombre: 'Pino',
          propiedad: 'Propiedad A',
          injerto: 'No',
          nrocont: '100',
          contenedor: 'C99',
          cantTipoCont: null,
          sem_siembra: 'S1-2024',
          f_siem: '2024-01-15',
          f_siembra: '2024-01-16',
          lote: 'L001',
          ano_lote: '2024',
          semxgr: '2',
          c: '3',
          g: '4',
        },
      ];
      programacionSiembraRepo.findAllProgramacionSiembra.mockResolvedValue(
        rows,
      );

      const result = await service.getAllProgramacionSiembra();

      expect(result[0].cantTipoCont).toBeUndefined();
    });

    it('stringifies numeric nrocont coming from the legacy row', async () => {
      const rows = [
        {
          partida: 1,
          ano: 2024,
          indice: 1,
          planta: 'PIN',
          nombre: 'Pino',
          propiedad: 'Propiedad A',
          injerto: 'No',
          nrocont: 100,
          sem_siembra: 'S1-2024',
          f_siem: '2024-01-15',
          f_siembra: '2024-01-16',
          lote: 'L001',
          ano_lote: '2024',
          semxgr: '2',
          c: '3',
          g: '4',
        },
      ];
      programacionSiembraRepo.findAllProgramacionSiembra.mockResolvedValue(
        rows,
      );

      const result = await service.getAllProgramacionSiembra();

      expect(result[0].nrocont).toBe('100');
    });

    it('should return empty array when no data', async () => {
      programacionSiembraRepo.findAllProgramacionSiembra.mockResolvedValue([]);

      const result = await service.getAllProgramacionSiembra();

      expect(result).toEqual([]);
    });
  });
});
