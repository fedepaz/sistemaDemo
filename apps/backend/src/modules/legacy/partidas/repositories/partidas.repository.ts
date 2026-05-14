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
  // partidas.repository.ts (agrega este método)

  async asignarUbicacion(data: {
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
      const webAppTag = '[webApp]';

      // We append the tag to the detail if provided, or just use the tag
      const finalDetalle = data.detalle
        ? `${data.detalle} ${webAppTag}`.trim()
        : webAppTag;

      // We append the tag to the extendido field
      const finalExtendido = `${data.extendido} ${webAppTag}`.trim();

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
          finalDetalle,
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
        [finalExtendido, data.partida, data.ano, data.indice],
      );
    });
  }
}
