// src/modules/mezcla/mezcla.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { MezclaRepository } from './repositories/mezcla.repository';
import { CreateMezclaDto, MezclaDto } from '@vivero/shared';

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
