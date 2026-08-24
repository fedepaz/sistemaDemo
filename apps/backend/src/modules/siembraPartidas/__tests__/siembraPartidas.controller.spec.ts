// src/modules/siembraPartidas/__tests__/siembraPartidas.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SiembraPartidasController } from '../siembraPartidas.controller';
import { SiembraPartidasService } from '../siembraPartidas.service';

describe('SiembraPartidasController', () => {
  let controller: SiembraPartidasController;
  let service: {
    getAllSiembraPartidas: jest.Mock;
    getSiembraPartidaById: jest.Mock;
    createSiembraPartida: jest.Mock;
  };

  const mockUser = { id: 'user-1', username: 'admin', tenantId: 'tenant-1' };
  const mockDto = {
    id: 'sp-1',
    partidaId: 100,
    anio: 2026,
    indice: 1,
    metodoMaquina: true,
    mezclaId: 'mezcla-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    service = {
      getAllSiembraPartidas: jest.fn(),
      getSiembraPartidaById: jest.fn(),
      createSiembraPartida: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiembraPartidasController],
      providers: [{ provide: SiembraPartidasService, useValue: service }],
    }).compile();

    controller = module.get<SiembraPartidasController>(
      SiembraPartidasController,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllSiembraPartidas', () => {
    it('delegates to service with user id', async () => {
      service.getAllSiembraPartidas.mockResolvedValue([mockDto]);

      const result = await controller.getAllSiembraPartidas(mockUser);

      expect(result).toEqual([mockDto]);
      expect(service.getAllSiembraPartidas).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getSiembraPartida', () => {
    it('delegates to service with id and user id', async () => {
      service.getSiembraPartidaById.mockResolvedValue(mockDto);

      const result = await controller.getSiembraPartida(mockUser, 'sp-1');

      expect(result).toEqual(mockDto);
      expect(service.getSiembraPartidaById).toHaveBeenCalledWith(
        'sp-1',
        'user-1',
      );
    });
  });

  describe('createSiembraPartida', () => {
    it('delegates to service with data', async () => {
      service.createSiembraPartida.mockResolvedValue(mockDto);

      const data = {
        partidaId: 100,
        anio: 2026,
        indice: 1,
        metodoMaquina: true,
        mezclaId: 'mezcla-1',
        userId: 'user-1',
      };
      const result = await controller.createSiembraPartida(data);

      expect(result).toEqual(mockDto);
      expect(service.createSiembraPartida).toHaveBeenCalledWith(data);
    });
  });
});
