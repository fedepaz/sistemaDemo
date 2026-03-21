// src/modules/legacy/especie/especie.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { EspecieRepository } from './repositories/especie.repository';

@Injectable()
export class LegacyEspecieService {
  constructor(private readonly especieRepository: EspecieRepository) {}

  async getAllEspecies() {
    const especies = await this.especieRepository.findAll();
    return especies;
  }

  async getEspecieByCodigo(codigo: string) {
    const especie = await this.especieRepository.findOne(codigo);
    if (!especie)
      throw new NotFoundException(`Especie ${codigo} no encontrada`);
    return especie;
  }
}
