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
      nombreEspecie: row.nombre,
      injerto: row.injerto,
      nrocont: row.nrocont,
      contenedor: row.contenedor,
      semSiembra: row.semSiembra,
      fechaSugeridaSiembra: row.f_siem,
      fSiembra: row.f_siembra,
      semEntrega: row.semEntrega,
      fEnt: row.f_ent,
      estado: row.estado,
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
      nombreEspecie: row.nombre,
      injerto: row.injerto,
      nrocont: row.nrocont,
      contenedor: row.contenedor,
      fPrimer: row.f_primer,
      pr: row.pr,
    };
  }

  private mapFaltantePlantas(row: LegacyFaltantePlantas): FaltantePlantasDto {
    return {
      hai: row.hai,
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.espvar,
      nombreEspecie: row.nombre,
      nrocont: row.nrocont,
      contenedor: row.contenedor,
      solicito: row.solicito,
      fPrimer: row.f_primer,
      pr: row.pr,
      stIniPr: row.st_ini_pr,
      porPr: row.porPr,
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
      nombreEspecie: row.nombre,
      injerto: row.injerto,
      nrocont: row.nrocont,
      contenedor: row.contenedor,
      fPreexp: row.f_preexp,
      pe: row.pe,
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
