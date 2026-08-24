// src/modules/mezcla/mezcla.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { MezclaRepository } from './repositories/mezcla.repository';

export type Mezcla = {
  id: string;
  sustrato1Id: string;
  porcentaje1: number;
  sustrato2Id: string | null;
  porcentaje2: number | null;
  sustrato3Id: string | null;
  porcentaje3: number | null;
  sustrato4Id: string | null;
  porcentaje4: number | null;
  createdAt: Date;
};

@Injectable()
export class MezclaService {
  private readonly logger = new Logger(MezclaService.name);
  constructor(private readonly repo: MezclaRepository) {}

  async getAllMezcla(requesterId: string) {
    return this.repo.findAll(requesterId);
  }
}
