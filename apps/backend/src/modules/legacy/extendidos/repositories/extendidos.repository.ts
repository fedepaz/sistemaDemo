// src/modules/legacy/extendidos/repositories/extendidos.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import {
  LegacyExtendido,
  LegacyExtendidosFecha,
} from '../interfaces/extendidos.interface';

@Injectable()
export class ExtendidosRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findExtendidosByFecha(fechaEgreso: string): Promise<LegacyExtendido[]> {
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
        AND DATE_ADD(p.f_siembra, INTERVAL p1.camara DAY) = ?
    `;
    return this.legacyDb.query<LegacyExtendido[]>(sql, [fechaEgreso]);
  }

  async findAllExtendidos(): Promise<LegacyExtendido[]> {
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
    return this.legacyDb.query<LegacyExtendido[]>(sql);
  }

  async findAvailableExtendidoDates(): Promise<LegacyExtendidosFecha[]> {
    const sql = `
    SELECT DISTINCT 
      DATE_ADD(p.f_siembra, INTERVAL p1.camara DAY) AS fechaEgreso
    FROM partidas p
    LEFT JOIN partidas1 p1 
      ON p.ano = p1.ano AND p.partida = p1.partida AND p.indice = p1.indice
    WHERE p.f_siembra <> '0000-00-00'
      AND p1.camara IS NOT NULL
      AND DATE_ADD(p.f_siembra, INTERVAL p1.camara DAY) IS NOT NULL
    ORDER BY fechaEgreso ASC
  `;
    const rows = await this.legacyDb.query<LegacyExtendidosFecha[]>(sql);
    return rows;
  }
  async findExtendidosEnCamara(): Promise<LegacyExtendido[]> {
    const sql = `
   SELECT 
      p.partida, p.ano, p.indice, 
      CONCAT(p.espvar,p.contenedor) AS planta, articulo.nombre,
      p.hai, p.con,
      p.injerto, p.contenedor, p.cg, p.f_siembra,p.f_siem,
      p1.camara AS diasCamara,
      DATE_ADD(p.f_siembra, INTERVAL p1.camara DAY) AS fechaEgresoCamara,
      p.extendido,
      p2.ubicacion, p2.stock_ini, p2.detalle, p2.baja
    FROM partidas p
    LEFT JOIN articulo ON articulo.codigo=CONCAT(p.espvar,p.contenedor)
    LEFT JOIN partidas1 p1 
      ON p.ano = p1.ano AND p.partida = p1.partida AND p.indice = p1.indice
    LEFT JOIN partidas2 p2 
      ON p.ano = p2.ano AND p.partida = p2.partida AND p.indice = p2.indice
    LEFT JOIN especie e ON e.codigo = p.espvar
    WHERE p.f_siembra IS NOT NULL 
  AND p.f_siembra <> '0000-00-00' 
  AND p.f_siembra >= DATE_SUB(CURDATE(), INTERVAL 10 DAY)
      AND p1.camara IS NOT NULL
      AND p2.ubicacion IS NULL
    ORDER BY fechaEgresoCamara ASC, p.partida
  `;
    return this.legacyDb.query<LegacyExtendido[]>(sql);
  }
}
