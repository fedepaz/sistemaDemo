// src/modules/legacy/siembra/services/siembra.service.ts

import { Injectable } from '@nestjs/common';
import { LegacySiembra } from './interfaces/siembra.interface';
import { ExtendidoDto } from '@vivero/shared';
import { SiembraRepository } from './repositories/siembra.repository';

@Injectable()
export class SiembraService {
  constructor(private readonly SiembraRepository: SiembraRepository) {}
  private mapToDto(row: LegacySiembra): ExtendidoDto {
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
      codigoCamaraGerminacion: row.cg,
      fechaSugeridaSiembra: row.f_siem,
      fechaSiembraReal: row.f_siembra,
      diasEnCamara: row.diasCamara,
      fechaEgresoCamara: row.fechaEgresoCamara,
      extendido: row.extendido,
      codigoUbicacion: row.ubicacion,
      nombreUbicacion: row.nomubicacion,
      stockInicial: row.stock_ini,
      detalle: row.detalle,
      baja: row.baja,
    };
  }

  async getAllSiembra(): Promise<ExtendidoDto[]> {
    const rows = await this.SiembraRepository.findAllSiembra();
    return rows.map((row) => this.mapToDto(row));
  }
}
