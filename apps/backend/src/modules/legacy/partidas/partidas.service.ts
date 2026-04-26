// src/modules/legacy/partidas/partidas.service.ts

import { Injectable } from '@nestjs/common';
import { PartidasRepository } from './repositories/partidas.repository';

@Injectable()
export class PartidasService {
  constructor(private readonly partidasRepository: PartidasRepository) {}

  async getAllPartidas() {
    const partidas = await this.partidasRepository.findAll();

    return partidas;
  }
}
