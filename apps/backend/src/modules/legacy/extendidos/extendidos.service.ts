// src/modules/legacy/extendidos/services/extendidos.service.ts

import { Injectable } from '@nestjs/common';
import { ExtendidosRepository } from './repositories/extendidos.repository';
import { ExtendidoDto } from '@vivero/shared';
import { LegacyExtendido } from './interfaces/extendidos.interface';

@Injectable()
export class ExtendidosService {
  constructor(private readonly extendidosRepository: ExtendidosRepository) {}
  private mapToDto(row: LegacyExtendido): ExtendidoDto {
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

  async getAllExtendidos(): Promise<ExtendidoDto[]> {
    const rows = await this.extendidosRepository.findAllExtendidos();
    return rows.map((row) => this.mapToDto(row));
  }
  async getExtendidosByFecha(fecha: string): Promise<ExtendidoDto[]> {
    const rows = await this.extendidosRepository.findExtendidosByFecha(fecha);

    return rows.map((row) => this.mapToDto(row));
  }

  async getAvailableExtendidoDates(): Promise<string[]> {
    const rows = await this.extendidosRepository.findAvailableExtendidoDates();

    return rows.map((row) => row.fechaEgreso);
  }

  async getExtendidosEnCamara(): Promise<ExtendidoDto[]> {
    const rows = await this.extendidosRepository.findExtendidosEnCamara();

    return rows.map((row) => this.mapToDto(row));
  }
}
