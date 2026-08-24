// src/modules/siembraPartidas/siembraPartidas.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { SiembraPartidasRepository } from './repositories/siembraPartidas.repository';
import { CreateSiembraPartidaDto, SiembraPartidaDto } from '@vivero/shared';

@Injectable()
export class SiembraPartidasService {
  constructor(private readonly repo: SiembraPartidasRepository) {}

  async getAllSiembraPartidas(requesterId: string) {
    return this.repo.findAll(requesterId);
  }

  async getSiembraPartidaById(
    id: string,
    requesterId: string,
  ): Promise<SiembraPartidaDto> {
    const siembraPartida = await this.repo.findById(id, requesterId);
    if (!siembraPartida)
      throw new NotFoundException('SiembraPartida not found');
    return siembraPartida;
  }

  async createSiembraPartida(data: CreateSiembraPartidaDto) {
    return this.repo.create(data);
  }
}
