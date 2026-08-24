// src/modules/alertSolved/siembraPartidas.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { SiembraPartidasRepository } from './repositories/siembraPartidas.repository';

export type SiembraPartidas = {
  id: string;
  partidaId: number;
  anio: number;
  indice: number;
  metodoMaquina: boolean;
  mezclaId: string;
  userId: string;
  user: { username: string };
  createdAt: Date;
};

@Injectable()
export class SiembraPartidasService {
  private readonly logger = new Logger(SiembraPartidasService.name);
  constructor(private readonly repo: SiembraPartidasRepository) {}

  async getAllSiembraPartidas(requesterId: string) {
    return this.repo.findAll(requesterId);
  }
}
