// src/modules/legacy/alerts/alerts.service.ts

import { Injectable } from '@nestjs/common';
import { AlertsRepository } from './repositories/alerts.repository';
import {
  LegacySiembraRetrasada,
  LegacyFaltaGerminacion,
  LegacyFaltantePlantas,
  LegacyFaltaPreExpedicion,
} from './interfaces/alerts.interface';
import {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from '@vivero/shared';

@Injectable()
export class AlertsService {
  constructor(private readonly alertsRepo: AlertsRepository) {}

  private mapSiembraRetrasada(
    row: LegacySiembraRetrasada,
  ): SiembraRetrasadaDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.espvar,
      nombreEspecie: row.especieNombre,
      fechaSugeridaSiembra: row.f_siem,
      contenedor: row.contenedor,
      con: row.con,
    };
  }

  private mapFaltaGerminacion(
    row: LegacyFaltaGerminacion,
  ): FaltaGerminacionDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.espvar,
      nombreEspecie: row.especieNombre,
      contenedor: row.contenedor,
      invernadero: row.invernadero,
    };
  }

  private mapFaltantePlantas(row: LegacyFaltantePlantas): FaltantePlantasDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.espvar,
      nombreEspecie: row.especieNombre,
      solicitadas: row.solicitadas,
      germinadasTotales: row.germinadasTotales,
      invernadero: row.invernadero,
    };
  }

  private mapFaltaPreExpedicion(
    row: LegacyFaltaPreExpedicion,
  ): FaltaPreExpedicionDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.espvar,
      nombreEspecie: row.especieNombre,
      fechaEntrega: row.fechaEntrega,
      invernadero: row.invernadero,
    };
  }

  async getSiembraRetrasada(): Promise<SiembraRetrasadaDto[]> {
    const rows = await this.alertsRepo.findSiembraRetrasada();
    return rows.map((row) => this.mapSiembraRetrasada(row));
  }

  async getFaltaGerminacion(): Promise<FaltaGerminacionDto[]> {
    const rows = await this.alertsRepo.findFaltaGerminacion();
    return rows.map((row) => this.mapFaltaGerminacion(row));
  }

  async getFaltantePlantas(): Promise<FaltantePlantasDto[]> {
    const rows = await this.alertsRepo.findFaltantePlantas();
    return rows.map((row) => this.mapFaltantePlantas(row));
  }

  async getFaltaPreExpedicion(): Promise<FaltaPreExpedicionDto[]> {
    const rows = await this.alertsRepo.findFaltaPreExpedicion();
    return rows.map((row) => this.mapFaltaPreExpedicion(row));
  }
}
