// src/modules/legacy/siembra/repositories/siembra.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacySiembra } from '../interfaces/siembra.interface';

@Injectable()
export class SiembraRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAllSiembra(): Promise<LegacySiembra[]> {
    const sql = `
    SELECT 
      p.partida, p.ano, p.indice, p.hai, p.con,
      p.espvar, e.nombre AS especieNombre,
      p.injerto, p.contenedor, p.cg, p.f_siembra,
      p1.camara AS diasCamara,
      DATE_ADD(p.f_siembra, INTERVAL p1.camara DAY) AS fechaEgresoCamara,
      p.extendido,
      p2.ubicacion, d.nombre AS nomubicacion, p2.stock_ini, p2.detalle, p2.baja
    FROM partidas p
    LEFT JOIN partidas1 p1 
      ON p.ano = p1.ano AND p.partida = p1.partida AND p.indice = p1.indice
    LEFT JOIN partidas2 p2 
      ON p.ano = p2.ano AND p.partida = p2.partida AND p.indice = p2.indice
    LEFT JOIN especie e ON e.codigo = p.espvar
    LEFT JOIN depositos d ON d.codigo = p2.ubicacion
    WHERE p.f_siembra <> '0000-00-00'
      AND p1.camara IS NOT NULL
    ORDER BY fechaEgresoCamara DESC, p.partida
  `;
    return this.legacyDb.query<LegacySiembra[]>(sql);
  }
}
