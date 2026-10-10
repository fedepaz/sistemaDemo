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

@Injectable()
export class PartidasService {
  private readonly logger = new Logger(PartidasService.name);

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

  async completarSiembraLegacy(
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
      f_siembra: new Date(),
      cg: data.cg,
      cantidaNroCont: data.cantidaNroCont,
      g: data.cantidadGrs,
      c: Math.floor(data.cantidadGrs * data.semxgr),
      detalle: data.detalleExtendido,
    };

    await this.prisma.$transaction(async () => {
      // Write grams (g, hand input) and computed seed count (c) to partidas1
      await this.partidasRepository.asignarSiembra(legacyData);

      // Sync st_sem_item / st_sem salidas (SUM(partidas1.c)) — must run after the write
      await this.legacyStockService.updateStock(
        data.lote,
        data.anoLote,
        data.item,
      );

      // Create TaskShift
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
