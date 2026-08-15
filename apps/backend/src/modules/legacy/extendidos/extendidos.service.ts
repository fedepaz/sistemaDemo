// src/modules/legacy/extendidos/services/extendidos.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ExtendidosRepository } from './repositories/extendidos.repository';
import { ExtendidoDto } from '@vivero/shared';
import { LegacyExtendido } from './interfaces/extendidos.interface';

@Injectable()
export class ExtendidosService {
  private readonly logger = new Logger(ExtendidosService.name);

  constructor(private readonly extendidosRepository: ExtendidosRepository) {}

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
      this.logger.error('Header validation failed for extendidos', {
        missingFields,
        availableFields: Object.keys(row),
      });
    }
  }

  private mapToDto(row: LegacyExtendido): ExtendidoDto {
    // Map SQL fields to header fields
    const mappedRow = {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.planta,
      nombreEspecie: row.nombre,
    };

    this.validateHeaderFields(mappedRow);

    return {
      // Header fields
      partidaId: mappedRow.partidaId,
      anio: mappedRow.anio,
      indice: mappedRow.indice,
      codigoEspecie: mappedRow.codigoEspecie,
      nombreEspecie: mappedRow.nombreEspecie,
      // Rest of fields
      hai: row.hai,
      nrocont: row.con,
      injerto: row.injerto,
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
