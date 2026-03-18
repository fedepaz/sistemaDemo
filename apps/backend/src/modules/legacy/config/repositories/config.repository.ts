// src/modules/legacy/config/repositories/config.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from 'src/infra/legacy-mysql/legacy-mysql.service';
import { LegacyConfig } from '../interfaces/config.interface';

@Injectable()
export class ConfigRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAll(): Promise<LegacyConfig[]> {
    const rows = await this.legacyDb.query<LegacyConfig[]>(
      'SELECT codigo, nombre FROM config',
    );
    return rows.map((row) => ({ ...row, nombre: row.nombre.trim() }));
  }

  async findOne(codigo: string): Promise<LegacyConfig> {
    const rows = await this.legacyDb.query<LegacyConfig[]>(
      'SELECT codigo, nombre FROM config WHERE codigo = ?',
      [codigo],
    );
    const row = rows[0];
    return { ...row, nombre: row.nombre.trim() };
  }
}
