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

      hai: row.hai,
      injerto: row.injerto,

      fechaSugeridaSiembra: row.f_siem,
      propiedad: row.propiedad,
      solicito: row.solicito,
      nrocont: row.nrocont,
      extendido: row.extendido,
      germin: row.germin,
    };
  }

  async getAllSiembra(): Promise<SiembraDto[]> {
    const rows = await this.siembraRepo.findAllSiembra();
    return rows.map((row) => this.mapToDto(row));
  }
}
