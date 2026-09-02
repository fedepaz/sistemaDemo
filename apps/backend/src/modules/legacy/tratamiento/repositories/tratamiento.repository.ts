// src/modules/legacy/tratamiento/repositories/tratamiento.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacyTratamiento } from '../interfaces/tratamiento.interface';

@Injectable()
export class TratamientoRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAll(): Promise<LegacyTratamiento[]> {
    const rows = await this.legacyDb.query<LegacyTratamiento[]>(
      'SELECT codigo, nombre FROM st_tratamien',
    );
    // trim padding from legacy database
    return rows.map((row) => ({ ...row, nombre: row.nombre.trim() }));
  }

  async findOne(codigo: string): Promise<LegacyTratamiento | null> {
    const rows = await this.legacyDb.query<LegacyTratamiento[]>(
      'SELECT codigo, nombre FROM st_tratamien WHERE codigo = ?',
      [codigo],
    );
    if (!rows.length) return null;
    const row = rows[0];
    return { ...row, nombre: row.nombre.trim() };
  }
}
