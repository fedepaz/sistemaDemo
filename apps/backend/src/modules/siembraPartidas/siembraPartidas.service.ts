// src/modules/siembraPartidas/siembraPartidas.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  SiembraPartidasRepository,
  SiembraPartidasWithRelations,
} from './repositories/siembraPartidas.repository';
import {
  CreateSiembraPartidaDto,
  SiembraPartidaDto,
  AsignarUbiSiembraCompletaDto,
  AutorizarSiembraDto,
} from '@vivero/shared';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PartidasRepository } from '../legacy/partidas/repositories/partidas.repository';
import { TaskShiftsRepository } from '../taskShifts/repositories/taskShifts.repository';
import { LegacyTratamientoService } from '../legacy/tratamiento/tratamiento.service';
import { LegacySustratoService } from '../legacy/sustrato/sustrato.service';

const GENERIC_SUSTRATO_NAME = 'Sustrato Genérico';
const GENERIC_PRODUCTO1_ID = 'c00000000000000000000001';
const GENERIC_FORMULA_ID = 'c00000000000000000000002';

@Injectable()
export class SiembraPartidasService {
  private readonly logger = new Logger(SiembraPartidasService.name);
  constructor(
    private readonly repo: SiembraPartidasRepository,
    private readonly prisma: PrismaService,
    private readonly partidasRepo: PartidasRepository,
    private readonly taskShiftsRepo: TaskShiftsRepository,
    private readonly tratamientoService: LegacyTratamientoService,
    private readonly sustratoService: LegacySustratoService,
  ) {}

  async ensureGenericFormula(): Promise<string> {
    const existing = await this.prisma.formula.findUnique({
      where: { id: GENERIC_FORMULA_ID },
      select: { id: true },
    });
    if (existing) return existing.id;

    const producto = await this.prisma.producto.upsert({
      where: { nombre: GENERIC_SUSTRATO_NAME },
      update: {},
      create: {
        id: GENERIC_PRODUCTO1_ID,
        nombre: GENERIC_SUSTRATO_NAME,
      },
    });

    const formula = await this.prisma.formula.upsert({
      where: { id: GENERIC_FORMULA_ID },
      update: {},
      create: {
        id: GENERIC_FORMULA_ID,
        producto1Id: producto.id,
        porcentaje1: 100,
      },
    });

    return formula.id;
  }

  private buildFormulaNombre(
    formula: SiembraPartidasWithRelations['formula'],
  ): string {
    const parts: string[] = [];
    if (formula.producto1 && formula.porcentaje1 != null) {
      parts.push(`${formula.producto1.nombre} (${formula.porcentaje1}%)`);
    }
    if (formula.producto2 && formula.porcentaje2 != null) {
      parts.push(`${formula.producto2.nombre} (${formula.porcentaje2}%)`);
    }
    if (formula.producto3 && formula.porcentaje3 != null) {
      parts.push(`${formula.producto3.nombre} (${formula.porcentaje3}%)`);
    }
    if (formula.producto4 && formula.porcentaje4 != null) {
      parts.push(`${formula.producto4.nombre} (${formula.porcentaje4}%)`);
    }
    return parts.length > 0 ? parts.join(' + ') : 'Sin fórmula';
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

  private async buildSustratoNombre(
    codigo: string,
  ): Promise<string | undefined> {
    try {
      const sustrato = await this.sustratoService.getByCodigo(codigo);
      return sustrato.nombre;
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
    let empleados:
      | {
          userId: string;
          username: string;
          firstName?: string;
          lastName?: string;
        }[]
      | undefined;
    if (taskShift?.employees?.length) {
      const userIds = taskShift.employees.map((e) => e.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, firstName: true, lastName: true },
      });
      empleados = taskShift.employees.map((e) => {
        const user = users.find((u) => u.id === e.userId);
        return {
          userId: e.userId,
          username: user?.username ?? e.userId,
          firstName: user?.firstName ?? undefined,
          lastName: user?.lastName ?? undefined,
        };
      });
    }

    // Resolve treatment name
    const tratamientoNombre = row.tratamientoSemilla
      ? await this.buildTratamientoNombre(row.tratamientoSemilla)
      : undefined;

    // Resolve sustrato name
    const sustratoNombre = row.sustrato
      ? await this.buildSustratoNombre(row.sustrato)
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

    // Resolve species info
    const codigoEspecie = legacyData?.espvar ?? '';
    let nombreEspecie = legacyData?.nombreEspecie ?? '';
    if (!nombreEspecie && codigoEspecie) {
      this.logger.warn(`Articulo not found for codigo: ${codigoEspecie}`);
      nombreEspecie = 'Sin especificar';
    }

    return {
      id: row.id,
      partidaId: row.partidaId,
      anio: row.anio,
      indice: row.indice,
      codigoEspecie,
      nombreEspecie,
      metodoMaquina: row.metodoMaquina,
      prensadoSustrato: row.prensadoSustrato.toNumber(),
      profundidadSemilla: row.profundidadSemilla.toString(),
      tratamientoSemilla: row.tratamientoSemilla,
      sustrato: row.sustrato ?? undefined,
      sustratoNombre,
      formulaId: row.formulaId,
      userId: row.userId,
      formulaNombre: this.buildFormulaNombre(row.formula),
      usuarioNombre: row.user.username,
      // Legacy fields
      cg: legacyData?.cg,
      fSiembra: legacyData?.f_siembra || undefined,
      lote: legacyData?.lote ? Number(legacyData.lote) : undefined,
      anoLote: legacyData?.ano_lote ? Number(legacyData.ano_lote) : undefined,
      item: legacyData?.item,
      semxgr: legacyData?.semxgr ? Number(legacyData.semxgr) : undefined,
      ajuste: legacyData?.ajuste || undefined,
      cantidadGrs: legacyData?.g ? Number(legacyData.g) : undefined,
      cantidaNroCont: legacyData?.con,
      detalleExtendido: legacyData?.extendido || undefined,
      // Stock traceability
      stockLote: row.stockLote ?? undefined,
      stockAnio: row.stockAnio ?? undefined,
      stockEntradasAntes: row.stockEntradasAntes
        ? Number(row.stockEntradasAntes)
        : undefined,
      stockSalidasAntes: row.stockSalidasAntes
        ? Number(row.stockSalidasAntes)
        : undefined,
      stockEntradasDespues: row.stockEntradasDespues
        ? Number(row.stockEntradasDespues)
        : undefined,
      stockSalidasDespues: row.stockSalidasDespues
        ? Number(row.stockSalidasDespues)
        : undefined,
      // Resolved names
      tratamientoNombre,
      // Task shift fields
      entityId: taskShift?.entityId,
      entityNombre,
      startTime: taskShift?.startTime?.toISOString(),
      endTime: taskShift?.endTime?.toISOString(),
      empleados,
      createdByNombre: taskShift?.createdByUser?.username,
      createdAt: row.createdAt.toISOString(),
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
    const formulaId = data.formulaId ?? (await this.ensureGenericFormula());

    const row = await this.repo.createSiembraPartida({
      partidaId: data.partidaId,
      anio: data.anio,
      indice: data.indice,
      metodoMaquina: data.metodoMaquina,
      prensadoSustrato: data.prensadoSustrato,
      profundidadSemilla: data.profundidadSemilla,
      tratamientoSemilla: data.tratamientoSemilla,
      sustrato: data.sustrato,
      stockLote: data.stockLote,
      stockAnio: data.stockAnio,
      stockEntradasAntes: data.stockEntradasAntes,
      stockSalidasAntes: data.stockSalidasAntes,
      stockEntradasDespues: data.stockEntradasDespues,
      stockSalidasDespues: data.stockSalidasDespues,
      formula: {
        connect: {
          id: formulaId,
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

  async autorizarSiembra(
    data: AutorizarSiembraDto,
    requesterId: string,
  ): Promise<SiembraPartidaDto> {
    const existing = await this.prisma.siembraPartidas.findFirst({
      where: {
        partidaId: data.partidaId,
        anio: data.anio,
        indice: data.indice,
        deletedAt: null,
      },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException(
          'Esta partida ya fue autorizada para siembra',
        );
      }
      // Re-authorize: row exists but isActive = false
      await this.repo.update(existing.id, {
        isActive: true,
        profundidadSemilla: 0,
      });
      const full = await this.repo.findById(existing.id, requesterId);
      const [legacyData, taskShift] = await Promise.all([
        this.partidasRepo.findByComposite(
          existing.partidaId,
          existing.anio,
          existing.indice,
        ),
        this.taskShiftsRepo.findByPartidaComposite(
          existing.partidaId,
          existing.anio,
          existing.indice,
        ),
      ]);
      return this.mapToDto(
        full as SiembraPartidasWithRelations,
        legacyData,
        taskShift,
      );
    }

    const formulaId = await this.ensureGenericFormula();

    const row = await this.repo.createSiembraPartida({
      partidaId: data.partidaId,
      anio: data.anio,
      indice: data.indice,
      metodoMaquina: true,
      prensadoSustrato: 0,
      profundidadSemilla: 0,
      tratamientoSemilla: '',
      formula: { connect: { id: formulaId } },
      user: { connect: { id: requesterId } },
    });

    const full = await this.repo.findById(row.id, requesterId);
    const [legacyData, taskShift] = await Promise.all([
      this.partidasRepo.findByComposite(row.partidaId, row.anio, row.indice),
      this.taskShiftsRepo.findByPartidaComposite(
        row.partidaId,
        row.anio,
        row.indice,
      ),
    ]);

    return this.mapToDto(
      full as SiembraPartidasWithRelations,
      legacyData,
      taskShift,
    );
  }

  async findPendingSiembraPartidas(
    requesterId: string,
  ): Promise<SiembraPartidaDto[]> {
    const rows = await this.repo.findPendingSiembraPartidas(requesterId);

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

  async desautorizarSiembra(
    id: string,
    requesterId: string,
  ): Promise<SiembraPartidaDto> {
    const existing = await this.repo.findById(id, requesterId);
    if (!existing) {
      throw new NotFoundException('Registro de siembra no encontrado');
    }

    if (existing.profundidadSemilla.toNumber() !== 0) {
      throw new ConflictException(
        'No se puede desautorizar una partida ya completada',
      );
    }

    if (!existing.isActive) {
      throw new ConflictException('Esta partida ya fue desautorizada');
    }

    await this.repo.update(id, { isActive: false });

    const full = await this.repo.findById(id, requesterId);
    const [legacyData, taskShift] = await Promise.all([
      this.partidasRepo.findByComposite(
        existing.partidaId,
        existing.anio,
        existing.indice,
      ),
      this.taskShiftsRepo.findByPartidaComposite(
        existing.partidaId,
        existing.anio,
        existing.indice,
      ),
    ]);

    return this.mapToDto(
      full as SiembraPartidasWithRelations,
      legacyData,
      taskShift,
    );
  }

  async completarSiembraPartida(
    id: string,
    data: AsignarUbiSiembraCompletaDto,
    requesterId: string,
  ): Promise<SiembraPartidaDto> {
    const existing = await this.repo.findById(id, requesterId);
    if (!existing) {
      throw new NotFoundException('Registro de siembra no encontrado');
    }

    if (existing.profundidadSemilla.toNumber() !== 0) {
      throw new ConflictException('Esta partida ya fue completada');
    }

    await this.repo.update(id, {
      metodoMaquina: data.metodoMaquina,
      prensadoSustrato: data.prensadoSustrato,
      profundidadSemilla: data.profundidadSemilla,
      tratamientoSemilla: data.tratamientoSemilla,
      sustrato: data.sustrato,
      ...(data.formulaId
        ? { formula: { connect: { id: data.formulaId } } }
        : {}),
    });

    const full = await this.repo.findById(id, requesterId);
    const [legacyData, taskShift] = await Promise.all([
      this.partidasRepo.findByComposite(
        existing.partidaId,
        existing.anio,
        existing.indice,
      ),
      this.taskShiftsRepo.findByPartidaComposite(
        existing.partidaId,
        existing.anio,
        existing.indice,
      ),
    ]);

    return this.mapToDto(
      full as SiembraPartidasWithRelations,
      legacyData,
      taskShift,
    );
  }
}
