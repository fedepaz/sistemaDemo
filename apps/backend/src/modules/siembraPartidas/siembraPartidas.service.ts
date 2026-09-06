// src/modules/siembraPartidas/siembraPartidas.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import {
  SiembraPartidasRepository,
  SiembraPartidasWithRelations,
} from './repositories/siembraPartidas.repository';
import { CreateSiembraPartidaDto, SiembraPartidaDto } from '@vivero/shared';
import { PrismaService } from '../../infra/prisma/prisma.service';

const GENERIC_SUSTRATO_NAME = 'Sustrato Genérico';
const GENERIC_MEZCLA_SUSTRATO1_ID = 'c00000000000000000000001';

@Injectable()
export class SiembraPartidasService {
  constructor(
    private readonly repo: SiembraPartidasRepository,
    private readonly prisma: PrismaService,
  ) {}

  private async getOrCreateGenericMezcla(): Promise<string> {
    const sustrato = await this.prisma.sustratos.upsert({
      where: { nombre: GENERIC_SUSTRATO_NAME },
      update: {},
      create: {
        id: GENERIC_MEZCLA_SUSTRATO1_ID,
        nombre: GENERIC_SUSTRATO_NAME,
      },
    });

    const mezcla = await this.prisma.mezcla.upsert({
      where: { id: 'c00000000000000000000002' },
      update: {},
      create: {
        id: 'c00000000000000000000002',
        sustrato1Id: sustrato.id,
        porcentaje1: 100,
      },
    });

    return mezcla.id;
  }

  private buildMezclaNombre(
    mezcla: SiembraPartidasWithRelations['mezcla'],
  ): string {
    const parts: string[] = [];
    if (mezcla.sustrato1 && mezcla.porcentaje1 != null) {
      parts.push(`${mezcla.sustrato1.nombre} (${mezcla.porcentaje1}%)`);
    }
    if (mezcla.sustrato2 && mezcla.porcentaje2 != null) {
      parts.push(`${mezcla.sustrato2.nombre} (${mezcla.porcentaje2}%)`);
    }
    if (mezcla.sustrato3 && mezcla.porcentaje3 != null) {
      parts.push(`${mezcla.sustrato3.nombre} (${mezcla.porcentaje3}%)`);
    }
    if (mezcla.sustrato4 && mezcla.porcentaje4 != null) {
      parts.push(`${mezcla.sustrato4.nombre} (${mezcla.porcentaje4}%)`);
    }
    return parts.length > 0 ? parts.join(' + ') : 'Sin mezcla';
  }

  private mapToDto(row: SiembraPartidasWithRelations): SiembraPartidaDto {
    return {
      id: row.id,
      partidaId: row.partidaId,
      anio: row.anio,
      indice: row.indice,
      metodoMaquina: row.metodoMaquina,
      presionSemilla: row.presionSemilla,
      profundidadSemilla: row.profundidadSemilla.toString(),
      tratamientoSemilla: row.tratamientoSemilla,
      mezclaId: row.mezclaId,
      userId: row.userId,
      mezclaNombre: this.buildMezclaNombre(row.mezcla),
      usuarioNombre: row.user.username,
    };
  }

  async getAllSiembraPartidas(
    requesterId: string,
  ): Promise<SiembraPartidaDto[]> {
    const rows = await this.repo.findAll(requesterId);
    return rows.map((row) => this.mapToDto(row));
  }

  async getSiembraPartidaById(
    id: string,
    requesterId: string,
  ): Promise<SiembraPartidaDto> {
    const siembraPartida = await this.repo.findById(id, requesterId);
    if (!siembraPartida)
      throw new NotFoundException('SiembraPartida not found');
    return this.mapToDto(siembraPartida as SiembraPartidasWithRelations);
  }

  async createSiembraPartida(
    data: CreateSiembraPartidaDto,
    requesterId: string,
  ): Promise<SiembraPartidaDto> {
    const mezclaId = data.mezclaId ?? (await this.getOrCreateGenericMezcla());

    const row = await this.repo.createSiembraPartida({
      partidaId: data.partidaId,
      anio: data.anio,
      indice: data.indice,
      metodoMaquina: data.metodoMaquina,
      presionSemilla: data.presionSemilla,
      profundidadSemilla: data.profundidadSemilla,
      tratamientoSemilla: data.tratamientoSemilla,
      mezcla: {
        connect: {
          id: mezclaId,
        },
      },
      user: {
        connect: {
          id: requesterId,
        },
      },
    });

    // Re-fetch with relations for DTO mapping
    const full = await this.repo.findById(row.id, requesterId);
    return this.mapToDto(full as SiembraPartidasWithRelations);
  }
}
