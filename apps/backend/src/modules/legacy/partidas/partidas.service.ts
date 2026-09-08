// src/modules/legacy/partidas/partidas.service.ts

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PartidasRepository } from './repositories/partidas.repository';
import {
  AsignarUbiExtendidoDto,
  AsignarUbiSiembraCompletaDto,
} from '@vivero/shared';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { SiembraPartidasService } from '../../siembraPartidas/siembraPartidas.service';
import { TaskShiftsService } from '../../taskShifts/taskShifts.service';
import { LegacyStockService } from '../stock/stock.service';
import { AuditEventEmitter } from '../../auditLog/events/audit-event.emitter';

@Injectable()
export class PartidasService {
  private readonly logger = new Logger(PartidasService.name);

  constructor(
    private readonly partidasRepository: PartidasRepository,
    private readonly prisma: PrismaService,
    private readonly siembraPartidaService: SiembraPartidasService,
    private readonly taskShiftsService: TaskShiftsService,
    private readonly legacyStockService: LegacyStockService,
    private readonly auditEventEmitter: AuditEventEmitter,
  ) {}

  async getAllPartidas() {
    const partidas = await this.partidasRepository.findAll();

    return partidas;
  }

  async asignarExtendido(data: AsignarUbiExtendidoDto): Promise<void> {
    if (data.edita === 'N') {
      throw new BadRequestException('La partida no se puede editar');
    }

    if (!data.ubicacion || data.ubicacion === 0) {
      throw new BadRequestException('Debe seleccionar una ubicación válida');
    }

    if (!data.stock_ini || data.stock_ini <= 0) {
      throw new BadRequestException('stock_ini debe ser mayor a 0');
    }
    if (data.baja && data.baja > data.stock_ini) {
      throw new BadRequestException('baja no puede ser mayor al stock inicial');
    }
    const repoData = {
      partida: data.partidaId,
      ano: data.anio,
      indice: data.indice,
      ubicacion: data.ubicacion,
      stock_ini: data.stock_ini,
      detalle: data.detalle,
      baja: data.baja,
      extendido: data.extendido,
    };

    await this.partidasRepository.asignarExtendido(repoData);
  }

  async asignarSiembra(
    data: AsignarUbiSiembraCompletaDto,
    requesterId: string,
  ): Promise<void> {
    if (data.edita === 'N') {
      throw new BadRequestException('La partida no se puede editar');
    }

    if (!data.cg || data.cg === 0) {
      throw new BadRequestException('Debe seleccionar una ubicación válida');
    }

    const legacyData = {
      partida: data.partidaId,
      ano: data.anio,
      indice: data.indice,
      f_siembra: data.f_siembra,
      cg: data.cg,
      cantidaNroCont: data.cantidaNroCont,
      ajuste: data.ajuste,
      cantidadGrs: data.cantidadGrs,
      lote: data.lote,
      anoLote: data.anoLote,
      item: data.item,
      semxgr: data.semxgr,
      detalle: data.detalleExtendido,
    };

    const newSiembraData = {
      partidaId: data.partidaId,
      anio: data.anio,
      indice: data.indice,
      metodoMaquina: data.metodoMaquina,
      presionSemilla: data.presionSemilla,
      profundidadSemilla: data.profundidadSemilla,
      tratamientoSemilla: data.tratamientoSemilla,
      mezclaId: data.mezclaId,
    };

    if (data.lote === 0 || data.anoLote === 0) {
      this.logger.warn(
        `Stock update skipped: lote=${data.lote}, anoLote=${data.anoLote}, item=${data.item} — no matching rows in legacy stock tables`,
      );
      this.auditEventEmitter.emitCrud({
        tenantId: 'unknown',
        userId: requesterId,
        action: 'UPDATE',
        entityType: 'SIEMBRA',
        entityId: `partida:${data.partidaId}|ano:${data.anio}|indice:${data.indice}`,
        timestamp: new Date(),
        changes: {
          requestId: 'unknown',
          endpoint: '/l-partidas/asignar-siembra',
          method: 'POST',
          params: {},
          query: {},
          body: {
            anomaly: 'LOTE_OR_ANO_ZERO',
            lote: data.lote,
            anoLote: data.anoLote,
            item: data.item,
            message:
              'Stock update will not match any rows — lote or anoLote is 0',
          },
          affected: null,
          durationMs: 0,
        },
      });
    }

    await this.prisma.$transaction(async () => {
      const stockSnapshot = await this.legacyStockService.updateStock(
        data.lote,
        data.anio,
        data.item,
        requesterId,
      );

      await this.siembraPartidaService.createSiembraPartida(
        {
          ...newSiembraData,
          stockLote: data.lote,
          stockAnio: data.anio,
          stockEntradasAntes: stockSnapshot.entradasAntes,
          stockSalidasAntes: stockSnapshot.salidasAntes,
          stockEntradasDespues: stockSnapshot.entradasDespues,
          stockSalidasDespues: stockSnapshot.salidasDespues,
        },
        requesterId,
      );

      await this.partidasRepository.asignarSiembra(legacyData);

      if (data.startTime && data.endTime) {
        await this.taskShiftsService.createTaskShift(
          {
            entityId: data.entityId,
            partidaId: data.partidaId,
            anio: data.anio,
            indice: data.indice,
            startTime: data.startTime,
            endTime: data.endTime,
            employeeUserIds: data.employeeUserIds ?? [],
          },
          requesterId,
        );
      }
    });
  }
}
