// src/modules/legacy/stock/repositories/stock.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { StockTotal } from '../interfaces/stock.interface';

@Injectable()
export class StockRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async stockTotal(
    lote: number,
    anio: number,
    item: number,
  ): Promise<StockTotal[]> {
    const totalesSql = `
        SELECT 
            SUM(tot_ent) AS total_entradas, 
            SUM(tot_sal) AS total_salidas
        FROM (
            SELECT 
                COALESCE(SUM(entrada), 0) AS tot_ent, 
                COALESCE(SUM(salida), 0) AS tot_sal 
            FROM st_sem_movim
            WHERE lote = ? AND ano = ? AND item = ?
            UNION ALL
            SELECT 
                0 AS tot_ent, 
                COALESCE(SUM(c), 0) AS tot_sal 
            FROM partidas1
            WHERE lote = ? AND ano_lote = ? AND item = ?
        ) AS unificado
      `;
    return this.legacyDb.query<StockTotal[]>(totalesSql, [
      lote,
      anio,
      item,
      lote,
      anio,
      item,
    ]);
  }

  async updateStock(
    lote: number,
    anio: number,
    item: number,
    StockTotal: StockTotal,
  ): Promise<void> {
    const updateItemSql = `
        UPDATE st_sem_item 
        SET entrada = ?, salida = ? 
        WHERE lote = ? AND ano = ? AND item = ?
      `;

    await this.legacyDb.query(updateItemSql, [
      StockTotal.total_entradas,
      StockTotal.total_salidas,
      lote,
      anio,
      item,
    ]);
  }

  async updateStockTotal(
    lote: number,
    anio: number,
    item: number,
    StockTotal: StockTotal,
  ): Promise<void> {
    const updateSemSql = `
        UPDATE st_sem 
        SET entrada = ?, salida = ? 
        WHERE lote = ? AND ano = ? AND item = ? 
      `;
    await this.legacyDb.query(updateSemSql, [
      StockTotal.total_entradas,
      StockTotal.total_salidas,
      lote,
      anio,
      item,
    ]);
  }
}
