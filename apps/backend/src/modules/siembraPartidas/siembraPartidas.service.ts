// src/modules/siembraPartidas/siembraPartidas.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { SiembraPartidasRepository } from './repositories/siembraPartidas.repository';
import { CreateSiembraPartidaDto, SiembraPartidaDto } from '@vivero/shared';
import { SiembraPartidas } from '../../generated/prisma/client';

@Injectable()
export class SiembraPartidasService {
  constructor(private readonly repo: SiembraPartidasRepository) {}

  private mapToDto(row: SiembraPartidas): SiembraPartidaDto {
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
    return this.mapToDto(siembraPartida);
  }

  async createSiembraPartida(
    data: CreateSiembraPartidaDto,
    requesterId: string,
  ) {
    return this.repo.createSiembraPartida({
      partidaId: data.partidaId,
      anio: data.anio,
      indice: data.indice,
      metodoMaquina: data.metodoMaquina,
      presionSemilla: data.presionSemilla,
      profundidadSemilla: data.profundidadSemilla,
      tratamientoSemilla: data.tratamientoSemilla,
      mezcla: {
        connect: {
          id: data.mezclaId,
        },
      },
      user: {
        connect: {
          id: requesterId,
        },
      },
    });
  }
}
