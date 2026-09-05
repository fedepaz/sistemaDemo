// src/modules/legacy/partidas/repositories/partidas.repository.ts

import { Inject, Injectable } from '@nestjs/common';
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

  async asignarSiembra(data: {
    partida: number;
    ano: number;
    indice: number;
    f_siembra: Date;
    cg: number;
    cantidaNroCont: number;
    tratamientoSemilla: string;
    ajuste: string;
    cantidadGrs: number;
    lote: number;
    anoLote: number;
    item: number;
    semxgr: number;
    detalle?: string;
  }): Promise<void> {
    await this.legacyDb.transaction(async (conn) => {
      const parsedDate = new Date(data.f_siembra);
      const resultC = data.cantidadGrs * data.semxgr;

      const updatePartidasSql = `UPDATE partidas SET f_siembra = ?, cg = ?, con = ?, extendido = ?, tratamien = ?, ajuste = ?, cantidad = ? WHERE partida = ? AND ano = ? AND indice = ?`;
      const updatePartidas1Sql = `UPDATE partidas1 SET c = ?, g = ? WHERE lote=?lote AND ano_lote=?ano_lote AND item=?item`;

      await conn.query(updatePartidasSql, [
        parsedDate.toISOString().slice(0, 10),
        data.cg,
        data.cantidaNroCont,
        data.detalle,
        data.tratamientoSemilla,
        data.ajuste,
        data.cantidadGrs,
        data.partida,
        data.ano,
        data.indice,
      ]);
      await conn.query(updatePartidas1Sql, [
        resultC,
        data.semxgr,
        data.lote,
        data.anoLote,
        data.item,
      ]);
    });
  }
}
