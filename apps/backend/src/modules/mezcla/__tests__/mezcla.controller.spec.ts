// src/modules/mezcla/__tests__/mezcla.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { MezclaController } from '../mezcla.controller';
import { MezclaService } from '../mezcla.service';

describe('MezclaController', () => {
  let controller: MezclaController;
  let service: {
    getAllMezcla: jest.Mock;
    getMezclaById: jest.Mock;
    createMezcla: jest.Mock;
  };

  const mockUser = { id: 'user-1', username: 'admin', tenantId: 'tenant-1' };
  const mockDto = {
    id: 'mezcla-1',
    sustrato1Id: 'sust-1',
    porcentaje1: 60,
    sustrato2Id: 'sust-2',
    porcentaje2: 40,
    sustrato3Id: null,
    porcentaje3: null,
    sustrato4Id: null,
    porcentaje4: null,
  };

  beforeEach(async () => {
    service = {
      getAllMezcla: jest.fn(),
      getMezclaById: jest.fn(),
      createMezcla: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MezclaController],
      providers: [{ provide: MezclaService, useValue: service }],
    }).compile();

    controller = module.get<MezclaController>(MezclaController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllMezcla', () => {
    it('delegates to service with user id', async () => {
      service.getAllMezcla.mockResolvedValue([mockDto]);

      const result = await controller.getAllMezcla(mockUser as any);

      expect(result).toEqual([mockDto]);
      expect(service.getAllMezcla).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getMezcla', () => {
    it('delegates to service with id and user id', async () => {
      service.getMezclaById.mockResolvedValue(mockDto);

      const result = await controller.getMezcla(mockUser as any, 'mezcla-1');

      expect(result).toEqual(mockDto);
      expect(service.getMezclaById).toHaveBeenCalledWith('user-1', 'mezcla-1');
    });
  });

  describe('createMezcla', () => {
    it('delegates to service with data', async () => {
      service.createMezcla.mockResolvedValue(mockDto);

      const data = {
        sustrato1Id: 'sust-1',
        porcentaje1: 60,
        sustrato2Id: 'sust-2',
        porcentaje2: 40,
        sustrato3Id: null,
        porcentaje3: null,
        sustrato4Id: null,
        porcentaje4: null,
      };
      const result = await controller.createMezcla(data);

      expect(result).toEqual(mockDto);
      expect(service.createMezcla).toHaveBeenCalledWith(data);
    });
  });
});
