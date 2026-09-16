// src/modules/legacy/programacionSiembra/programacionSiembra.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { LegacyProgramacionSiembra } from './interfaces/programacionSiembra.interface';
import { ProgramacionSiembraDto } from '@vivero/shared';
import { ProgramacionSiembraRepository } from './repositories/programacionSiembra.repository';

@Injectable()
export class ProgramacionSiembraService {
  private readonly logger = new Logger(ProgramacionSiembraService.name);
  constructor(
    private readonly programacionSiembraRepo: ProgramacionSiembraRepository,
  ) {}

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
      this.logger.error('Header validation failed for programacion siembra', {
        missingFields,
        availableFields: Object.keys(row),
      });
    }
  }
  private mapToDto(row: LegacyProgramacionSiembra): ProgramacionSiembraDto {
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
      semEntrega: row.semEntrega,
      lote: row.lote,
      anoLote: row.ano_lote,
      item: row.item,
      semxgr: row.semxgr,
      c: row.c,
      g: row.g,
    };
  }

  async getAllProgramacionSiembra(): Promise<ProgramacionSiembraDto[]> {
    const rows =
      await this.programacionSiembraRepo.findAllProgramacionSiembra();
    return rows.map((row) => this.mapToDto(row));
  }
}
