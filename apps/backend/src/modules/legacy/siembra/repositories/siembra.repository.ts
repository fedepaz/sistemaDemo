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
      p.hai,
      p.f_siem,
      p.f_siembra,
      p.propiedad,
      p.solicito,
      p.lote,
      p.ano_lote,
      p.ajuste,
      p.nrocont,
      p.extendido,
      p.germin
	FROM partidas p
	LEFT JOIN articulo ON articulo.codigo=CONCAT(p.espvar,p.contenedor)
	  LEFT JOIN especie e 
    	ON e.codigo = p.espvar
    WHERE estado <> 'ANULADA' 
    	
    	AND p.hai<>'A'
    	AND p.con=0
    	
      AND p.ano=2026
    ORDER BY p.partida, p.indice
  `;
    return this.legacyDb.query<LegacySiembra[]>(sql);
  }
}
