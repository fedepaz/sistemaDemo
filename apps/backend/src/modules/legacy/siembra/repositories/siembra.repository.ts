// src/modules/legacy/siembra/repositories/siembra.repository.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacySiembra } from '../interfaces/siembra.interface';

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
  p.partida, p.ano, p.indice,
    CONCAT(p.espvar,p.contenedor) AS planta, articulo.nombre,
    p.propiedad,
    p.injerto, 
    p.nrocont,
    CONCAT(p.sem_siem,'-',p.ano_siem) AS sem_siembra, 
    p.f_siem,
    p.f_siembra,
    p.item,
    l.lote,
    l.ano_lote,
    l.indice,
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
  WHERE p.estado <> 'ANULADA'
    AND p.hai<>'A'
    AND p.ano>=2025
    AND (p.f_siembra=0
      OR (p.f_siembra<>0
        AND p.f_siembra IS NOT NULL
        AND p2.partida IS NULL))
  ORDER BY sem_siembra, p.ano, p.partida, p.indice
  `;
    return this.legacyDb.query<LegacySiembra[]>(sql);
  }
}
