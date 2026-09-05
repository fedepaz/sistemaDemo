// src/modules/legacy/partidas/partidas.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { PartidasRepository } from './repositories/partidas.repository';
import {
  AsignarUbiExtendidoDto,
  AsignarUbiSiembraCompletaDto,
} from '@vivero/shared';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { SiembraPartidasService } from '../../siembraPartidas/siembraPartidas.service';
import { TaskShiftsService } from '../../taskShifts/taskShifts.service';
import { LegacyStockService } from '../stock/stock.service';

@Injectable()
export class PartidasService {
  constructor(
    private readonly partidasRepository: PartidasRepository,
    private readonly prisma: PrismaService,
    private readonly siembraPartidaService: SiembraPartidasService,
    private readonly taskShiftsService: TaskShiftsService,
    private readonly legacyStockService: LegacyStockService,
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
      tratamientoSemilla: data.tratamientoSemilla,
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

    await this.prisma.$transaction(async () => {
      await this.legacyStockService.updateStock(
        data.lote,
        data.anio,
        data.item,
      );
      await this.siembraPartidaService.createSiembraPartida(
        newSiembraData,
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
