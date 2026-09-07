// src/modules/legacy/stock/repositories/stock.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { StockSnapshot, StockTotal } from '../interfaces/stock.interface';

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
  ): Promise<StockSnapshot> {
    const stockTotal = await this.stockTotal(lote, anio, item);
    const entradasAntes = Number(stockTotal[0].total_entradas);
    const salidasAntes = Number(stockTotal[0].total_salidas);

    const entradasDespues = entradasAntes;
    const salidasDespues = salidasAntes;

    const updateItemSql = `
        UPDATE st_sem_item
        SET entrada = ?, salida = ?
        WHERE lote = ? AND ano = ? AND item = ?
      `;
    const updateSemSql = `
          UPDATE st_sem
          SET entrada = ?, salida = ?
          WHERE lote = ? AND ano = ?
        `;
    await this.legacyDb.transaction(async (conn) => {
      await conn.query(updateItemSql, [
        entradasDespues,
        salidasDespues,
        lote,
        anio,
        item,
      ]);
      await conn.query(updateSemSql, [
        entradasDespues,
        salidasDespues,
        lote,
        anio,
      ]);
    });

    return {
      entradasAntes,
      salidasAntes,
      entradasDespues,
      salidasDespues,
    };
  }
}
