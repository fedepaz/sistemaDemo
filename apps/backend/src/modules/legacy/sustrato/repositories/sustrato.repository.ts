import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import {
  LegacyProducto,
  LegacySustrato,
} from '../interfaces/sustrato.interface';

@Injectable()
export class SustratoRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAllSustrato(): Promise<LegacySustrato[]> {
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

  async findOneSustrato(codigo: string): Promise<LegacySustrato | null> {
    const rows = await this.legacyDb.query<LegacySustrato[]>(
      'SELECT codigo, nombre, unidad FROM articulo WHERE rubro = ? AND codigo = ?',
      ['10.02', codigo],
    );
    if (!rows.length) return null;
    const row = rows[0];
    return { ...row, nombre: row.nombre.trim(), unidad: row.unidad.trim() };
  }

  async findAllProductos(): Promise<LegacyProducto[]> {
    const rows = await this.legacyDb.query<LegacyProducto[]>(
      'SELECT codigo, nombre, unidad FROM articulo WHERE hai = ? AND tipo = ?',
      ['0', 'PF'],
    );
    return rows.map((row) => ({
      ...row,
      nombre: row.nombre.trim(),
      unidad: row.unidad.trim(),
    }));
  }

  async findOneProducto(codigo: string): Promise<LegacyProducto | null> {
    const rows = await this.legacyDb.query<LegacyProducto[]>(
      'SELECT codigo, nombre, unidad FROM articulo WHERE hai = ? AND tipo = ? AND codigo = ?',
      ['0', 'PF', codigo],
    );
    if (!rows.length) return null;
    const row = rows[0];
    return { ...row, nombre: row.nombre.trim(), unidad: row.unidad.trim() };
  }
}
