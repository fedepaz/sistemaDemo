// src/modules/sustratos/__tests__/sustratos.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SustratosService } from '../sustratos.service';
import { SustratosRepository } from '../repositories/sustratos.repository';

describe('SustratosService', () => {
  let service: SustratosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SustratosService,
        { provide: SustratosRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<SustratosService>(SustratosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
