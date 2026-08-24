// src/modules/mezcla/__tests__/mezcla.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { MezclaRepository } from '../repositories/mezcla.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('MezclaRepository', () => {
  let repository: MezclaRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MezclaRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    repository = module.get<MezclaRepository>(MezclaRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
