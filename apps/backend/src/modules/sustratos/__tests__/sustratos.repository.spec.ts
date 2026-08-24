// src/modules/sustratos/__tests__/sustratos.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SustratosRepository } from '../repositories/sustratos.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('SustratosRepository', () => {
  let repository: SustratosRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SustratosRepository,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    repository = module.get<SustratosRepository>(SustratosRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
