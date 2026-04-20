// src/modules/legacy/extendidos/services/extendidos.service.ts

import { Injectable } from '@nestjs/common';
import { ExtendidosRepository } from './repositories/extendidos.repository';
import { ExtendidoDto } from '@vivero/shared';

@Injectable()
export class ExtendidosService {
  constructor(private readonly extendidosRepository: ExtendidosRepository) {}

  async getExtendidosByFecha(fecha: string): Promise<ExtendidoDto[]> {
    const rows = await this.extendidosRepository.findExtendidosByFecha(fecha);

    return rows.map((row) => ({
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
      fechaSiembraReal: row.f_siembra,
      diasEnCamara: row.diasCamara,
      fechaEgresoCamara: row.fechaEgresoCamara,
      extendido: row.extendido,
      codigoUbicacion: row.ubicacion,
      nombreUbicacion: row.nomubicacion,
      stockInicial: row.stock_ini,
      detalle: row.detalle,
      baja: row.baja,
    }));
  }
}
