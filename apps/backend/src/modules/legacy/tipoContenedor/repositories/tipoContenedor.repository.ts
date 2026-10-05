// src/modules/legacy/tipoContenedor/repositories/tipoContenedor.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacyTipoContenedor } from '../interfaces/tipoContenedor.interface';

@Injectable()
export class TipoContenedorRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAll(): Promise<LegacyTipoContenedor[]> {
    const rows = await this.legacyDb.query<LegacyTipoContenedor[]>(
      'SELECT codigo, nombre, cantidad, semillas, siembra, entrega, rubro, stock FROM tipo_contenedor',
    );
    // trim padding from legacy database
    return rows.map((row) => ({ ...row, nombre: row.nombre.trim() }));
  }

  async findOne(codigo: string): Promise<LegacyTipoContenedor | null> {
    const rows = await this.legacyDb.query<LegacyTipoContenedor[]>(
      'SELECT codigo, nombre, cantidad, semillas, siembra, entrega, rubro, stock FROM tipo_contenedor WHERE codigo = ?',
      [codigo],
    );
    if (!rows.length) return null;
    const row = rows[0];
    return { ...row, nombre: row.nombre.trim() };
  }
}
