// src/modules/legacy/partidas/partidas.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PartidasRepository } from './repositories/partidas.repository';
import { PartidaDto } from '@vivero/shared';
import { EspecieRepository } from '../especie/repositories/especie.repository';
import { LegacyPartidas } from './interfaces/partidas.interface';

@Injectable()
export class PartidasService {
  constructor(
    private readonly partidasRepository: PartidasRepository,
    private readonly especieRepository: EspecieRepository,
  ) {}
  private mapToDto(
    partida: LegacyPartidas,
    especieMap: Map<string, string>,
  ): PartidaDto {
    // Calcular días en cámara (si f_ent y f_envio son válidas)
    let daysInChamber: number | null = null;
    if (
      partida.f_ent &&
      partida.f_ent !== '0000-00-00' &&
      partida.f_envio &&
      partida.f_envio !== '0000-00-00'
    ) {
      const start = new Date(partida.f_ent);
      const end = new Date(partida.f_envio);
      const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      if (diff >= 0) daysInChamber = diff;
    }

    return {
      id: partida.partida,
      productCode: partida.espvar,
      productName: especieMap.get(partida.espvar) || partida.espvar, // fallback al código
      suggestedSowingDate: partida.f_siem,
      actualSowingDate: partida.f_siembra,
      daysInChamber,
      traysSown: partida.cant_s,
      greenhouseCode: partida.contenedor,
      traysExtended: partida.cant_e,
    };
  }

  async getAllPartidas(): Promise<PartidaDto[]> {
    const partidas = await this.partidasRepository.findAll();
    const especies = await this.especieRepository.findAll();
    const especieMap = new Map<string, string>();
    for (const esp of especies) {
      especieMap.set(esp.codigo, esp.nombre);
    }

    return partidas.map((partida) => this.mapToDto(partida, especieMap));
  }

  async getPartidaByPartida(partidaNumber: number): Promise<PartidaDto> {
    const partida = await this.partidasRepository.findOne(partidaNumber);
    if (!partida) throw new NotFoundException('Partida not found');
    const especies = await this.especieRepository.findOne(partida.espvar);
    if (!especies) throw new NotFoundException('Especie not found');
    const especieMap = new Map<string, string>();
    especieMap.set(especies.codigo, especies.nombre);

    return this.mapToDto(partida, especieMap);
  }

  async getPartidasByFecha(fecha: string): Promise<PartidaDto[]> {
    const partidas = await this.partidasRepository.findByFecha(fecha);
    if (!partidas.length) throw new NotFoundException('Partida not found');
    const especies = await this.especieRepository.findAll();
    const especieMap = new Map<string, string>();
    for (const esp of especies) {
      especieMap.set(esp.codigo, esp.nombre);
    }

    return partidas.map((partida) => this.mapToDto(partida, especieMap));
  }

  async getPartidasByFechaRange(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<PartidaDto[]> {
    const partidas = await this.partidasRepository.findByFechaRange(
      fechaInicio,
      fechaFin,
    );
    if (!partidas.length) throw new NotFoundException('Partida not found');
    const especies = await this.especieRepository.findAll();
    const especieMap = new Map<string, string>();
    for (const esp of especies) {
      especieMap.set(esp.codigo, esp.nombre);
    }

    return partidas.map((partida) => this.mapToDto(partida, especieMap));
  }

  async getPartidasByAno(ano: number): Promise<PartidaDto[]> {
    const partidas = await this.partidasRepository.findByAno(ano);
    if (!partidas.length) throw new NotFoundException('Partida not found');
    const especies = await this.especieRepository.findAll();
    const especieMap = new Map<string, string>();
    for (const esp of especies) {
      especieMap.set(esp.codigo, esp.nombre);
    }

    return partidas.map((partida) => this.mapToDto(partida, especieMap));
  }

  async getPartidasByCamara(camara: number): Promise<PartidaDto[]> {
    const partidas = await this.partidasRepository.findByCamara(camara);
    if (!partidas.length) throw new NotFoundException('Partida not found');
    const especies = await this.especieRepository.findAll();
    const especieMap = new Map<string, string>();
    for (const esp of especies) {
      especieMap.set(esp.codigo, esp.nombre);
    }

    return partidas.map((partida) => this.mapToDto(partida, especieMap));
  }
}
