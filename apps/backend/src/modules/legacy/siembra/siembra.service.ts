// src/modules/legacy/siembra/services/siembra.service.ts

import { Injectable } from '@nestjs/common';
import { LegacySiembra } from './interfaces/siembra.interface';
import { SiembraDto } from '@vivero/shared';
import { SiembraRepository } from './repositories/siembra.repository';

@Injectable()
export class SiembraService {
  constructor(private readonly siembraRepo: SiembraRepository) {}
  private mapToDto(row: LegacySiembra): SiembraDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      hai: row.hai,
      con: row.con,
      codigoEspecie: row.espvar,
      nombreEspecie: row.especieNombre,
      injerto: row.injerto,
      contenedor: row.contenedor,
      fechaSugeridaSiembra: row.f_siem,
      fechaSiembraReal: row.f_siembra,
    };
  }

  async getAllSiembra(): Promise<SiembraDto[]> {
    const rows = await this.siembraRepo.findAllSiembra();
    return rows.map((row) => this.mapToDto(row));
  }
}
