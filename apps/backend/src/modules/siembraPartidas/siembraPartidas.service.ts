// src/modules/siembraPartidas/siembraPartidas.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import {
  SiembraPartidasRepository,
  SiembraPartidasWithRelations,
} from './repositories/siembraPartidas.repository';
import { CreateSiembraPartidaDto, SiembraPartidaDto } from '@vivero/shared';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PartidasRepository } from '../legacy/partidas/repositories/partidas.repository';
import { TaskShiftsRepository } from '../taskShifts/repositories/taskShifts.repository';
import { LegacyTratamientoService } from '../legacy/tratamiento/tratamiento.service';

const GENERIC_SUSTRATO_NAME = 'Sustrato Genérico';
const GENERIC_MEZCLA_SUSTRATO1_ID = 'c00000000000000000000001';

@Injectable()
export class SiembraPartidasService {
  constructor(
    private readonly repo: SiembraPartidasRepository,
    private readonly prisma: PrismaService,
    private readonly partidasRepo: PartidasRepository,
    private readonly taskShiftsRepo: TaskShiftsRepository,
    private readonly tratamientoService: LegacyTratamientoService,
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

  private async buildTratamientoNombre(
    codigo: string,
  ): Promise<string | undefined> {
    try {
      const tratamiento = await this.tratamientoService.getByCodigo(codigo);
      return tratamiento.nombre;
    } catch {
      return undefined;
    }
  }

  private async mapToDto(
    row: SiembraPartidasWithRelations,
    legacyData: Awaited<ReturnType<typeof this.partidasRepo.findByComposite>>,
    taskShift: Awaited<
      ReturnType<typeof this.taskShiftsRepo.findByPartidaComposite>
    >,
  ): Promise<SiembraPartidaDto> {
    // Resolve employee usernames
    let empleados: { userId: string; username: string }[] | undefined;
    if (taskShift?.employees?.length) {
      const userIds = taskShift.employees.map((e) => e.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true },
      });
      empleados = taskShift.employees.map((e) => ({
        userId: e.userId,
        username: users.find((u) => u.id === e.userId)?.username ?? e.userId,
      }));
    }

    // Resolve treatment name
    const tratamientoNombre = row.tratamientoSemilla
      ? await this.buildTratamientoNombre(row.tratamientoSemilla)
      : undefined;

    // Resolve entity name
    let entityNombre: string | undefined;
    if (taskShift?.entityId) {
      const entity = await this.prisma.entity.findUnique({
        where: { id: taskShift.entityId },
        select: { label: true },
      });
      entityNombre = entity?.label;
    }

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
      // Legacy fields
      cg: legacyData?.cg,
      fSiembra: legacyData?.f_siembra || undefined,
      lote: legacyData?.lote ? Number(legacyData.lote) : undefined,
      anoLote: legacyData?.ano_lote ? Number(legacyData.ano_lote) : undefined,
      item: legacyData?.item,
      semxgr: legacyData?.semxgr ? Number(legacyData.semxgr) : undefined,
      ajuste: legacyData?.ajuste || undefined,
      cantidadGrs: legacyData?.cantidad,
      cantidaNroCont: legacyData?.con,
      detalleExtendido: legacyData?.extendido || undefined,
      // Resolved names
      tratamientoNombre,
      // Task shift fields
      entityId: taskShift?.entityId,
      entityNombre,
      startTime: taskShift?.startTime?.toISOString(),
      endTime: taskShift?.endTime?.toISOString(),
      empleados,
    };
  }

  async getAllSiembraPartidas(
    requesterId: string,
  ): Promise<SiembraPartidaDto[]> {
    const rows = await this.repo.findAll(requesterId);

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const [legacyData, taskShift] = await Promise.all([
          this.partidasRepo.findByComposite(
            row.partidaId,
            row.anio,
            row.indice,
          ),
          this.taskShiftsRepo.findByPartidaComposite(
            row.partidaId,
            row.anio,
            row.indice,
          ),
        ]);
        return this.mapToDto(row, legacyData, taskShift);
      }),
    );

    return dtos;
  }

  async getSiembraPartidaById(
    id: string,
    requesterId: string,
  ): Promise<SiembraPartidaDto> {
    const siembraPartida = await this.repo.findById(id, requesterId);
    if (!siembraPartida)
      throw new NotFoundException('SiembraPartida not found');

    const row = siembraPartida;
    const [legacyData, taskShift] = await Promise.all([
      this.partidasRepo.findByComposite(row.partidaId, row.anio, row.indice),
      this.taskShiftsRepo.findByPartidaComposite(
        row.partidaId,
        row.anio,
        row.indice,
      ),
    ]);

    return this.mapToDto(row, legacyData, taskShift);
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
    return this.mapToDto(full as SiembraPartidasWithRelations, null, null);
  }
}
