// src/modules/legacy/agentes/repositories/agentes.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacyAgent } from '../interfaces/agentes.interface';

@Injectable()
export class AgentesRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAll(): Promise<LegacyAgent[]> {
    const rows = await this.legacyDb.query<LegacyAgent[]>(
      'SELECT codigo, nombre FROM agentes',
    );
    // trim padding from legacy database
    return rows.map((row) => ({ ...row, nombre: row.nombre.trim() }));
  }

  async findOne(codigo: number): Promise<LegacyAgent> {
    const rows = await this.legacyDb.query<LegacyAgent[]>(
      'SELECT codigo, nombre FROM agentes WHERE codigo = ?',
      [codigo],
    );
    const row = rows[0];
    return { ...row, nombre: row.nombre.trim() };
  }
}
