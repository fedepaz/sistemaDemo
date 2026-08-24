// src/modules/sustratos/sustratos.service.ts

import { Injectable, Logger } from '@nestjs/common';

import { SustratosRepository } from './repositories/sustratos.repository';
import {
  CreateSustratoDto,
  SustratoDto,
  UpdateSustratoDto,
} from '@vivero/shared';

export type Sustratos = {
  id: string;
  nombre: string;
  createdAt: Date;
};

@Injectable()
export class SustratosService {
  private readonly logger = new Logger(SustratosService.name);
  constructor(private readonly repo: SustratosRepository) {}

  async getAllSustratos(requesterId: string): Promise<SustratoDto[]> {
    const rows = await this.repo.findAll(requesterId);
    return rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getSustratoById(
    requesterId: string,
    id: string,
  ): Promise<SustratoDto | null> {
    const row = await this.repo.findById(id, requesterId);
    if (!row) return null;
    return {
      id: row.id,
      nombre: row.nombre,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async createSustrato(data: CreateSustratoDto) {
    return this.repo.create({
      nombre: data.nombre,
    });
  }

  async updateSustrato(id: string, data: UpdateSustratoDto) {
    return this.repo.update(id, {
      nombre: data.nombre,
    });
  }
}
