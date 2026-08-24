// src/modules/mezcla/__tests__/mezcla.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { MezclaService } from '../mezcla.service';
import { MezclaRepository } from '../repositories/mezcla.repository';

describe('MezclaService', () => {
  let service: MezclaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MezclaService, { provide: MezclaRepository, useValue: {} }],
    }).compile();

    service = module.get<MezclaService>(MezclaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
