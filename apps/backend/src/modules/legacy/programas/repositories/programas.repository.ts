// src/modules/legacy/programas/repositories/programas.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacyProgramas } from '../interfaces/programas.interface';

@Injectable()
export class ProgramasRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async finadAll(): Promise<LegacyProgramas[]> {
    const rows = await this.legacyDb.query<LegacyProgramas[]>(
      'SELECT * FROM programas',
    );
    return rows.map((row) => ({ ...row, nombre: row.nombre.trim() }));
  }
}
