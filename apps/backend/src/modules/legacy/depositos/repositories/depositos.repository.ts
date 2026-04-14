// src/modules/legacy/depositos/repositories/depositos.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacyDeposito } from '../interfaces/depositos.interface';

@Injectable()
export class DepositosRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAll(): Promise<LegacyDeposito[]> {
    const rows = await this.legacyDb.query<LegacyDeposito[]>(
      'SELECT codigo, nombre, camara, bandejas FROM depositos',
    );
    // trim padding from legacy database
    return rows.map((row) => ({ ...row, nombre: row.nombre.trim() }));
  }
  async findOne(codigo: number): Promise<LegacyDeposito | null> {
    const rows = await this.legacyDb.query<LegacyDeposito[]>(
      'SELECT codigo, nombre, camara, bandejas FROM depositos WHERE codigo = ?',
      [codigo],
    );
    if (!rows.length) return null;
    const row = rows[0];
    return { ...row, nombre: row.nombre.trim() };
  }

  async findAllByCamara(): Promise<LegacyDeposito[]> {
    const camara = 'Si';
    const rows = await this.legacyDb.query<LegacyDeposito[]>(
      'SELECT codigo, nombre, camara, bandejas FROM depositos WHERE camara = ?',
      [camara],
    );
    // trim padding from legacy database
    return rows.map((row) => ({ ...row, nombre: row.nombre.trim() }));
  }
}
