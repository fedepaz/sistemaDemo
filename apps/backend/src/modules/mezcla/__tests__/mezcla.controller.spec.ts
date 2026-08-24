// src/modules/mezcla/__tests__/mezcla.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { MezclaController } from '../mezcla.controller';
import { MezclaService } from '../mezcla.service';

describe('MezclaController', () => {
  let controller: MezclaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MezclaController],
      providers: [{ provide: MezclaService, useValue: {} }],
    }).compile();

    controller = module.get<MezclaController>(MezclaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
