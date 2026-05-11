// src/modules/legacy/partidas/partidas.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { PartidasRepository } from './repositories/partidas.repository';
import { AsignarUbicacionDto } from '@vivero/shared';

@Injectable()
export class PartidasService {
  constructor(private readonly partidasRepository: PartidasRepository) {}

  async getAllPartidas() {
    const partidas = await this.partidasRepository.findAll();

    return partidas;
  }

  async asignarUbicacion(data: AsignarUbicacionDto): Promise<void> {
    if (data.edita === 'N') {
      throw new BadRequestException('La partida no se puede editar');
    }

    if (!data.ubicacion || data.ubicacion === 0) {
      throw new BadRequestException('Debe seleccionar una ubicación válida');
    }
    const repoData = {
      partida: data.partida,
      ano: data.ano,
      indice: data.indice,
      ubicacion: data.ubicacion,
      stock_ini: data.stock_ini,
      detalle: data.detalle,
      baja: data.baja,
      extendido: data.extendido,
    };

    await this.partidasRepository.asignarUbicacion(repoData);
  }
}
