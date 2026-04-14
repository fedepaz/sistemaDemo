// src/modules/legacy/partidas/partidas.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PartidasRepository } from './repositories/partidas.repository';

@Injectable()
export class PartidasService {
  constructor(private readonly partidasRepository: PartidasRepository) {}

  async getAllPartidas() {
    const partidas = await this.partidasRepository.findAll();
    return partidas;
  }

  async getPartidaByPartida(partidaNumber: number) {
    const partida = await this.partidasRepository.findOne(partidaNumber);
    if (!partida) throw new NotFoundException('Partida not found');
    return partida;
  }

  async getPartidasByFecha(fecha: string) {
    const partidas = await this.partidasRepository.findByFecha(fecha);
    if (!partidas.length) throw new NotFoundException('Partida not found');
    return partidas;
  }

  async getPartidasByFechaRange(fechaInicio: string, fechaFin: string) {
    const partidas = await this.partidasRepository.findByFechaRange(
      fechaInicio,
      fechaFin,
    );
    if (!partidas.length) throw new NotFoundException('Partida not found');
    return partidas;
  }

  async getPartidasByAno(ano: number) {
    const partidas = await this.partidasRepository.findByAno(ano);
    if (!partidas.length) throw new NotFoundException('Partida not found');
    return partidas;
  }

  async getPartidasByCamara(camara: number) {
    const partidas = await this.partidasRepository.findByCamara(camara);
    if (!partidas.length) throw new NotFoundException('Partida not found');
    return partidas;
  }
}
