// src/modules/legacy/partidas/repositories/partidas.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import type { PoolConnection } from 'mysql2/promise';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacyPartidas } from '../interfaces/partidas.interface';

@Injectable()
export class PartidasRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAll(): Promise<LegacyPartidas[]> {
    const rows = await this.legacyDb.query<LegacyPartidas[]>(
      'SELECT * FROM partidas',
    );
    return rows;
  }
  async findOne(partida: number): Promise<LegacyPartidas | null> {
    const rows = await this.legacyDb.query<LegacyPartidas[]>(
      'SELECT * FROM partidas WHERE partida = ?',
      [partida],
    );
    if (!rows.length) return null;

    return rows[0];
  }

  async findByComposite(
    partida: number,
    ano: number,
    indice: number,
  ): Promise<LegacyPartidas | null> {
    const rows = await this.legacyDb.query<LegacyPartidas[]>(
      `SELECT p.*, articulo.nombre AS nombreEspecie, l.g
       FROM partidas p
       LEFT JOIN articulo ON articulo.codigo = CONCAT(p.espvar, p.contenedor)
       LEFT JOIN partidas1 l
          ON p.partida=l.partida
          AND p.ano=l.ano
          AND p.indice=l.indice
       WHERE p.partida = ? AND p.ano = ? AND p.indice = ?`,
      [partida, ano, indice],
    );
    if (!rows.length) return null;
    return rows[0];
  }

  async findByFecha(fecha: string): Promise<LegacyPartidas[]> {
    const rows = await this.legacyDb.query<LegacyPartidas[]>(
      'SELECT * FROM partidas WHERE fecha = ?',
      [fecha],
    );
    return rows;
  }

  async findByFechaRange(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<LegacyPartidas[]> {
    const rows = await this.legacyDb.query<LegacyPartidas[]>(
      'SELECT * FROM partidas WHERE fecha BETWEEN ? AND ?',
      [fechaInicio, fechaFin],
    );
    return rows;
  }

  async findByAno(ano: number): Promise<LegacyPartidas[]> {
    const rows = await this.legacyDb.query<LegacyPartidas[]>(
      'SELECT * FROM partidas WHERE ano = ?',
      [ano],
    );
    return rows;
  }

  async findByCamara(camara: number): Promise<LegacyPartidas[]> {
    const rows = await this.legacyDb.query<LegacyPartidas[]>(
      'SELECT * FROM partidas WHERE cg = ?',
      [camara],
    );
    return rows;
  }

  async asignarExtendido(data: {
    partida: number;
    ano: number;
    indice: number;
    ubicacion: number;
    stock_ini: number;
    detalle?: string;
    baja?: number;
    extendido: string; // valor para partidas.extendido
  }): Promise<void> {
    await this.legacyDb.transaction(async (conn) => {
      const now = new Date().toISOString().slice(0, 10);
      const baja = data.baja ?? 0;
      const saldo = data.stock_ini - baja; // stock (saldo)

      await conn.query(
        `INSERT INTO partidas2 (
        partida, ano, indice, fecha, ubicacion, stock_ini,
        concepto, detalle, baja, stock,
        f_pr, pr, stxpr, repique, pl_repique,
        f_re, f_pe, pe, stxcont, fin
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.partida,
          data.ano,
          data.indice,
          now,
          data.ubicacion,
          data.stock_ini,
          0,
          data.detalle,
          baja,
          saldo,
          '0000-00-00',
          '0.00',
          0,
          0,
          0,
          '0000-00-00',
          '0000-00-00',
          '0.00',
          0,
          '',
        ],
      );

      await conn.query(
        `UPDATE partidas SET extendido = ? WHERE partida = ? AND ano = ? AND indice = ?`,
        [data.extendido, data.partida, data.ano, data.indice],
      );
    });
  }

  async asignarSiembra(
    data: {
      partida: number;
      ano: number;
      indice: number;
      f_siembra: Date;
      cg: number;
      cantidaNroCont: number;
      g: number;
      c: number;
      detalle?: string;
    },
    conn?: PoolConnection,
  ): Promise<void> {
    const parsedDate = new Date(data.f_siembra);

    const updatePartidasSql = `UPDATE partidas SET f_siembra = ?, cg = ?, con = ?, extendido = ? WHERE partida = ? AND ano = ? AND indice = ?`;
    const updatePartidas1Sql = `UPDATE partidas1 SET c = ?, g = ? WHERE partida = ? AND ano = ? AND indice = ?`;

    const statements: Array<[string, unknown[]]> = [
      [
        updatePartidasSql,
        [
          parsedDate.toISOString().slice(0, 10),
          data.cg,
          data.cantidaNroCont,
          data.detalle,
          data.partida,
          data.ano,
          data.indice,
        ],
      ],
      [
        updatePartidas1Sql,
        [data.c, data.g, data.partida, data.ano, data.indice],
      ],
    ];

    if (conn) {
      for (const [sql, params] of statements) {
        await conn.query(sql, params);
      }
      return;
    }

    await this.legacyDb.transaction(async (txConn) => {
      for (const [sql, params] of statements) {
        await txConn.query(sql, params);
      }
    });
  }
}
