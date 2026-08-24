// src/modules/mezcla/mezcla.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { MezclaRepository } from './repositories/mezcla.repository';
import { CreateMezclaDto, MezclaDto } from '@vivero/shared';

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
  constructor(private readonly repo: MezclaRepository) {}

  async getAllMezcla(requesterId: string): Promise<MezclaDto[]> {
    return this.repo.findAll(requesterId);
  }

  async getMezclaById(id: string, requesterId: string): Promise<MezclaDto> {
    const mezcla = await this.repo.findById(id, requesterId);
    if (!mezcla) throw new NotFoundException('Mezcla not found');
    return mezcla;
  }

  async createMezcla(data: CreateMezclaDto) {
    return this.repo.create(data);
  }
}
