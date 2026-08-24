// src/modules/sustratos/sustratos.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { SustratosRepository } from './repositories/sustratos.repository';

export type Sustratos = {
  id: string;
  nombre: string;
  createdAt: Date;
};

@Injectable()
export class SustratosService {
  private readonly logger = new Logger(SustratosService.name);
  constructor(private readonly repo: SustratosRepository) {}

  async getAllSustratos(requesterId: string) {
    return this.repo.findAll(requesterId);
  }

  async getSustratoById(requesterId: string, id: string) {
    return this.repo.findById(id, requesterId);
  }

  async createSustrato(data: { nombre: string }) {
    return this.repo.create(data);
  }

  async updateSustrato(id: string, data: Record<string, unknown>) {
    return this.repo.update(id, data);
  }
}
