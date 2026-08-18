/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { ExtendidosService } from '../extendidos.service';
import { ExtendidosRepository } from '../repositories/extendidos.repository';
import { LegacyExtendido } from '../interfaces/extendidos.interface';

describe('ExtendidosService', () => {
  let service: ExtendidosService;

  const mockRepository = {
    findAllExtendidos: jest.fn(),
    findExtendidosByFecha: jest.fn(),
    findAvailableExtendidoDates: jest.fn(),
    findExtendidosEnCamara: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtendidosService,
        { provide: ExtendidosRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ExtendidosService>(ExtendidosService);
    jest.clearAllMocks();
  });

  describe('mapToDto', () => {
    it('should log error for missing header fields but not throw', () => {
      const row = {
        planta: 'ESP001',
      } as LegacyExtendido;

      const svc = service as any;
      // Should not throw - validation is logging only for legacy data resilience
      expect(() => svc.mapToDto(row)).not.toThrow();
    });

    it('should map SQL fields to header fields correctly', () => {
      const row = {
        constructor: { name: 'RowDataPacket' },
        partida: 123,
        ano: 2024,
        indice: 1,
        planta: 'ESP001',
        nombre: 'Especie Test',
        hai: 'HAI001',
        con: '100',
        injerto: 'Injerto Test',
        cg: 1,
        f_siem: '2024-01-01',
        f_siembra: '2024-01-02',
        diasCamara: 10,
        fechaEgresoCamara: '2024-01-10',
        extendido: 'Extendido Test',
        ubicacion: 1,
        nomubicacion: 'Ubicacion Test',
        stock_ini: 50,
        detalle: 'Detalle Test',
        baja: null,
      } as LegacyExtendido;

      const svc = service as any;
      const result = svc.mapToDto(row);
      expect(result).toMatchObject({
        codigoEspecie: 'ESP001',
        nombreEspecie: 'Especie Test',
        partidaId: 123,
        anio: 2024,
        indice: 1,
      });
    });
  });
});
