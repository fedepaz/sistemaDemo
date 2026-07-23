// src/modules/legacy/siembra/repositories/siembra.repository.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacySiembra } from '../interfaces/siembra.interface';
import { AsignarUbiSiembraDto } from '@vivero/shared';

@Injectable()
export class SiembraRepository {
  private readonly logger = new Logger(SiembraRepository.name);

  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAllSiembra(): Promise<LegacySiembra[]> {
    const sql = `
    SELECT 
      p.partida, p.ano, p.indice, p.con, p.espvar,
      e.nombre AS especieNombre, p.injerto, p.contenedor,
      p.f_siem,
      p.f_siembra
    FROM partidas p
    LEFT JOIN especie e ON e.codigo = p.espvar
    LEFT JOIN partidas1 p1 
    ON p.ano = p1.ano AND p.partida = p1.partida AND p.indice = p1.indice
    LEFT JOIN partidas2 p2 
    ON p.ano = p2.ano AND p.partida = p2.partida AND p.indice = p2.indice
    AND p1.camara IS NULL
    AND p2.ubicacion IS NULL
    WHERE (p.f_siembra IS NULL OR p.f_siembra = '0000-00-00')
    ORDER BY p.partida, p.indice
  `;
    return this.legacyDb.query<LegacySiembra[]>(sql);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async asignarUbicacionSiembra(_data: AsignarUbiSiembraDto): Promise<void> {
    // TODO: Implement legacy MySQL write
    this.logger.warn('asignarUbicacionSiembra not yet implemented');
  }
}
