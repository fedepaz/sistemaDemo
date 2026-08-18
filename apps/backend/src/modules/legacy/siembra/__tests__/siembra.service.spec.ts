import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SiembraService } from '../siembra.service';
import { SiembraRepository } from '../repositories/siembra.repository';

describe('SiembraService', () => {
  let service: SiembraService;
  let siembraRepo: {
    findAllSiembra: jest.Mock;
    asignarUbicacionSiembra: jest.Mock;
  };

  beforeEach(async () => {
    siembraRepo = {
      findAllSiembra: jest.fn(),
      asignarUbicacionSiembra: jest.fn(),
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
          hai: 'HAI-1',
          con: '100',
          planta: 'PIN',
          nombre: 'Pino',
          injerto: 'No',
          f_siem: '2024-01-15',
          f_siembra: '',
        },
      ];
      siembraRepo.findAllSiembra.mockResolvedValue(rows);

      const result = await service.getAllSiembra();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        partidaId: 1,
        anio: 2024,
        indice: 1,
        hai: 'HAI-1',
        con: '100',
        codigoEspecie: 'PIN',
        nombreEspecie: 'Pino',
        injerto: 'No',
        fechaSugeridaSiembra: '2024-01-15',
        fechaSiembraReal: '',
      });
    });

    it('should return empty array when no data', async () => {
      siembraRepo.findAllSiembra.mockResolvedValue([]);

      const result = await service.getAllSiembra();

      expect(result).toEqual([]);
    });
  });

  describe('asignarUbicacionSiembra', () => {
    it('should assign location successfully', async () => {
      siembraRepo.asignarUbicacionSiembra.mockResolvedValue(undefined);

      await service.asignarUbicacionSiembra({
        partida: 1,
        ano: 2024,
        indice: 1,
        edita: 'S',
        ubicacion: 100,
        stock_ini: 50,
        baja: 0,
        detalle: '',
        extendido: '',
      });

      expect(siembraRepo.asignarUbicacionSiembra).toHaveBeenCalled();
    });

    it('should throw BadRequestException when edita is N', async () => {
      await expect(
        service.asignarUbicacionSiembra({
          partida: 1,
          ano: 2024,
          indice: 1,
          edita: 'N',
          ubicacion: 100,
          stock_ini: 50,
          baja: 0,
          detalle: '',
          extendido: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when ubicacion is 0', async () => {
      await expect(
        service.asignarUbicacionSiembra({
          partida: 1,
          ano: 2024,
          indice: 1,
          edita: 'S',
          ubicacion: 0,
          stock_ini: 50,
          baja: 0,
          detalle: '',
          extendido: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when ubicacion is null', async () => {
      await expect(
        service.asignarUbicacionSiembra({
          partida: 1,
          ano: 2024,
          indice: 1,
          edita: 'S',
          ubicacion: null as unknown as number,
          stock_ini: 50,
          baja: 0,
          detalle: '',
          extendido: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
