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
}
