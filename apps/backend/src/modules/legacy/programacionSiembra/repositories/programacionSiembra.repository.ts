// src/modules/legacy/siembra/repositories/siembra.repository.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacyProgramacionSiembra } from '../interfaces/programacionSiembra.interface';

@Injectable()
export class ProgramacionSiembraRepository {
  private readonly logger = new Logger(ProgramacionSiembraRepository.name);

  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAllProgramacionSiembra(): Promise<LegacyProgramacionSiembra[]> {
    const sql = `
    SELECT
  p.partida, p.ano, p.indice,
    CONCAT(p.espvar,p.contenedor) AS planta, articulo.nombre,
    p.propiedad,
    p.injerto, 
    p.nrocont,
    CONCAT(p.sem_siem,'-',p.ano_siem) AS sem_siembra, 
    p.f_siem,
    p.f_siembra,
    CONCAT(p.sem_ent,'-',p.ano_ent,' ',p.i_f) AS semEntrega,
    p.item,
    p.f_ent,
    p.estado,
    l.lote,
    l.ano_lote,
    l.semxgr,
    l.c,
    l.g
  FROM partidas p
  LEFT JOIN articulo ON articulo.codigo=CONCAT(p.espvar,p.contenedor)  
  LEFT JOIN partidas1 l
      ON p.partida=l.partida
      AND p.ano=l.ano
      AND p.indice=l.indice
  LEFT JOIN partidas2 p2
      ON p.partida=p2.partida
      AND p.ano=p2.ano
      AND p.indice=p2.indice
  WHERE p.estado <> 'ANULADA' AND p.f_siembra=0 AND p.hai<>'A' 
	AND p.sem_siem<=WEEK(CURRENT_DATE()) AND p.ano>2025
	ORDER BY p.ano, p.partida
  `;
    return this.legacyDb.query<LegacyProgramacionSiembra[]>(sql);
  }
}
