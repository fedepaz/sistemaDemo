// src/modules/legacy/siembra/services/siembra.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { LegacySiembra } from './interfaces/siembra.interface';
import { SiembraDto } from '@vivero/shared';
import { SiembraRepository } from './repositories/siembra.repository';

@Injectable()
export class SiembraService {
  private readonly logger = new Logger(SiembraService.name);
  constructor(private readonly siembraRepo: SiembraRepository) {}

  private validateHeaderFields(row: Record<string, any>): void {
    const requiredFields = [
      'partidaId',
      'anio',
      'indice',
      'codigoEspecie',
      'nombreEspecie',
    ];
    const missingFields = requiredFields.filter(
      (field) => row[field] === undefined || row[field] === null,
    );

    if (missingFields.length > 0) {
      this.logger.error('Header validation failed for siembra', {
        missingFields,
        availableFields: Object.keys(row),
      });
    }
  }
  private mapToDto(row: LegacySiembra): SiembraDto {
    const mappedRow = {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.planta,
      nombreEspecie: row.nombre,
    };

    this.validateHeaderFields(mappedRow);

    return {
      partidaId: mappedRow.partidaId,
      anio: mappedRow.anio,
      indice: mappedRow.indice,
      codigoEspecie: mappedRow.codigoEspecie,
      nombreEspecie: mappedRow.nombreEspecie,

      propiedad: row.propiedad,
      injerto: row.injerto,
      nrocont: row.nrocont,
      sem_siembra: row.sem_siembra,
      fechaSugeridaSiembra: row.f_siem,
      fechaSiembraReal: row.f_siembra,
      lote: row.lote,
      anoLote: row.ano_lote,
      item: row.item,
      semxgr: row.semxgr,
      c: row.c,
      g: row.g,
    };
  }

  async getAllSiembra(): Promise<SiembraDto[]> {
    const rows = await this.siembraRepo.findAllSiembra();
    return rows.map((row) => this.mapToDto(row));
  }
}
