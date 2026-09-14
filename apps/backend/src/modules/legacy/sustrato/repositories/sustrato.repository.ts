import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacySustrato } from '../interfaces/sustrato.interface';

@Injectable()
export class SustratoRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAll(): Promise<LegacySustrato[]> {
    const rows = await this.legacyDb.query<LegacySustrato[]>(
      'SELECT codigo, nombre, unidad FROM articulo WHERE rubro = ?',
      ['10.02'],
    );
    return rows.map((row) => ({
      ...row,
      nombre: row.nombre.trim(),
      unidad: row.unidad.trim(),
    }));
  }

  async findOne(codigo: string): Promise<LegacySustrato | null> {
    const rows = await this.legacyDb.query<LegacySustrato[]>(
      'SELECT codigo, nombre, unidad FROM articulo WHERE rubro = ? AND codigo = ?',
      ['10.02', codigo],
    );
    if (!rows.length) return null;
    const row = rows[0];
    return { ...row, nombre: row.nombre.trim(), unidad: row.unidad.trim() };
  }
}
