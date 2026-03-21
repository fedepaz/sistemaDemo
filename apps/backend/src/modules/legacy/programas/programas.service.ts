// src/modules/legacy/programas/programas.service.ts

import { Injectable } from '@nestjs/common';
import { ProgramasRepository } from './repositories/programas.repository';

@Injectable()
export class LegacyProgramasService {
  constructor(private readonly repository: ProgramasRepository) {}

  async getAllProgramas() {
    const programas = await this.repository.finadAll();
    return programas;
  }
}
