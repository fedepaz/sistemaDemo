// src/modules/legacy/especie/repositories/especie.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacyEspecie } from '../interfaces/especie.interface';

@Injectable()
export class EspecieRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAll(): Promise<LegacyEspecie[]> {
    const rows = await this.legacyDb.query<LegacyEspecie[]>(
      'SELECT * FROM especie',
    );
    return rows.map((row) => ({ ...row, nombre: row.nombre.trim() }));
  }

  async findOne(codigo: string): Promise<LegacyEspecie> {
    const row = await this.legacyDb.query<LegacyEspecie[]>(
      'SELECT * FROM especie WHERE codigo = ?',
      [codigo],
    );
    const rows = row[0];
    return { ...rows, nombre: rows.nombre.trim() };
  }
}
