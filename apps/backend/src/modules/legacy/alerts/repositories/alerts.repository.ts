import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import {
  LegacySiembraRetrasada,
  LegacyFaltaGerminacion,
  LegacyFaltantePlantas,
  LegacyFaltaPreExpedicion,
} from '../interfaces/alerts.interface';

@Injectable()
export class AlertsRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findSiembraRetrasada(): Promise<LegacySiembraRetrasada[]> {
    return this.legacyDb.query<LegacySiembraRetrasada[]>(
      `SELECT partidas.partida, partidas.ano, partidas.indice, CONCAT(partidas.espvar,partidas.contenedor) AS planta, articulo.nombre,
		partidas.injerto, partidas.nrocont, partidas.propiedad, 
		CONCAT(partidas.sem_siem,'-',partidas.ano_siem) AS semSiembra,
        partidas.f_siem, partidas.f_siembra,
        CONCAT(partidas.sem_ent,'-',partidas.ano_ent,' ',partidas.i_f) AS semEntrega,
		partidas.f_ent, partidas.estado
	FROM partidas
	LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
	WHERE estado <> 'ANULADA' AND f_siembra=0 AND partidas.hai<>'A' 
	AND partidas.sem_siem=WEEK(CURRENT_DATE()) AND partidas.ano>2025
	ORDER BY partidas.ano, partidas.partida`,
    );
  }

  async findFaltaGerminacion(): Promise<LegacyFaltaGerminacion[]> {
    return this.legacyDb.query<LegacyFaltaGerminacion[]>(
      `SELECT partidas.partida, partidas.ano, partidas.indice, CONCAT(partidas.espvar,partidas.contenedor) AS planta, articulo.nombre,
	partidas.injerto, partidas.nrocont, partidas.f_primer, partidas.pr
	FROM partidas
	LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
	WHERE partidas.f_primer<=CURRENT_DATE() AND estado <> 'ANULADA' AND pr=0 AND partidas.hai<>'A' AND partidas.ano>2025 
	ORDER BY partidas.ano, partidas.partida`,
    );
  }

  async findFaltantePlantas(): Promise<LegacyFaltantePlantas[]> {
    return this.legacyDb.query<LegacyFaltantePlantas[]>(
      `SELECT partidas.hai, partidas.partida, partidas.ano, partidas.indice, CONCAT(partidas.espvar,partidas.contenedor) AS planta, articulo.nombre,
	partidas.nrocont, partidas.solicito, partidas.f_primer, partidas.pr, partidas.st_ini_pr,
        FLOOR(partidas.pr*partidas.cant_s/100)*partidas.st_ini_pr AS porPr
	FROM partidas
	LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
	WHERE estado <> 'ANULADA' AND pr<>0 AND pe=0
        AND partidas.solicito>FLOOR(partidas.pr*partidas.cant_s/100)*partidas.st_ini_pr
        AND partidas.hai<>'A' AND partidas.ano>2025
      ORDER BY partidas.ano, partidas.partida, partidas.indice`,
    );
  }

  async findFaltaPreExpedicion(): Promise<LegacyFaltaPreExpedicion[]> {
    return this.legacyDb.query<LegacyFaltaPreExpedicion[]>(
      `SELECT partidas.partida, partidas.ano, partidas.indice, CONCAT(partidas.espvar,partidas.contenedor) AS planta, articulo.nombre,
	partidas.injerto, partidas.nrocont, partidas.f_preexp, partidas.pe
	FROM partidas
	LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
	WHERE partidas.f_preexp<=CURRENT_DATE() AND estado <> 'ANULADA' AND pe=0 AND partidas.hai<>'A' AND partidas.ano>2025 
	ORDER BY partidas.ano, partidas.partida
`,
    );
  }
}
