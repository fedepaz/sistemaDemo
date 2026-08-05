import { Injectable } from '@nestjs/common';
import { AlertsRepository } from './repositories/alerts.repository';
import { AlertCommentsRepository } from '../../alertComments/repositories/alertComments.repository';
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
  constructor(
    private readonly alertsRepo: AlertsRepository,
    private readonly alertCommentsRepo: AlertCommentsRepository,
  ) {}

  private mapSiembraRetrasada(
    row: LegacySiembraRetrasada,
  ): SiembraRetrasadaDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.planta,
      nombreEspecie: row.nombre,
      injerto: row.injerto,
      nrocont: row.nrocont,
      semSiembra: row.semSiembra,
      fechaSugeridaSiembra: row.f_siem,
      fSiembra: row.f_siembra,
      semEntrega: row.semEntrega,
      fEnt: row.f_ent,
      estado: row.estado,
      propiedad: row.propiedad,
      commentCount: 0,
    };
  }

  private mapFaltaGerminacion(
    row: LegacyFaltaGerminacion,
  ): FaltaGerminacionDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.planta,
      nombreEspecie: row.nombre,
      injerto: row.injerto,
      nrocont: row.nrocont,
      fPrimer: row.f_primer,
      pr: row.pr,
      commentCount: 0,
    };
  }

  private mapFaltantePlantas(row: LegacyFaltantePlantas): FaltantePlantasDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      siembras: Number(row.siembras),
      codigoEspecie: row.planta,
      nombreEspecie: row.nombre,
      nrocont: row.nrocont,
      solicito: Number(row.solicito),
      producido: Number(row.producido),
      diferencia: Number(row.diferencia),
      commentCount: 0,
    };
  }

  private mapFaltaPreExpedicion(
    row: LegacyFaltaPreExpedicion,
  ): FaltaPreExpedicionDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.planta,
      nombreEspecie: row.nombre,
      injerto: row.injerto,
      nrocont: row.nrocont,
      fPreexp: row.f_preexp,
      pe: row.pe,
      commentCount: 0,
    };
  }

  private async mergeCommentCounts<
    T extends { partidaId: number; anio: number; indice: number },
  >(dtos: T[], alertType: string): Promise<(T & { commentCount: number })[]> {
    const keys = dtos.map((d) => ({
      partidaId: d.partidaId,
      anio: d.anio,
      indice: d.indice,
    }));
    const counts = await this.alertCommentsRepo.getCommentCounts(
      alertType,
      keys,
    );
    return dtos.map((dto) => ({
      ...dto,
      commentCount:
        counts.get(`${dto.partidaId}-${dto.anio}-${dto.indice}`) ?? 0,
    }));
  }

  async getSiembraRetrasada(): Promise<SiembraRetrasadaDto[]> {
    const rows = await this.alertsRepo.findSiembraRetrasada();
    const dtos = rows.map((row) => this.mapSiembraRetrasada(row));
    return this.mergeCommentCounts(dtos, 'SIEMBRA_RETRASADA');
  }

  async getFaltaGerminacion(): Promise<FaltaGerminacionDto[]> {
    const rows = await this.alertsRepo.findFaltaGerminacion();
    const dtos = rows.map((row) => this.mapFaltaGerminacion(row));
    return this.mergeCommentCounts(dtos, 'FALTA_GERMINACION');
  }

  async getFaltantePlantas(): Promise<FaltantePlantasDto[]> {
    const rows = await this.alertsRepo.findFaltantePlantas();
    const dtos = rows.map((row) => this.mapFaltantePlantas(row));
    return this.mergeCommentCounts(dtos, 'FALTANTE_PLANTAS');
  }

  async getFaltaPreExpedicion(): Promise<FaltaPreExpedicionDto[]> {
    const rows = await this.alertsRepo.findFaltaPreExpedicion();
    const dtos = rows.map((row) => this.mapFaltaPreExpedicion(row));
    return this.mergeCommentCounts(dtos, 'FALTA_PRE_EXPEDICION');
  }
}
