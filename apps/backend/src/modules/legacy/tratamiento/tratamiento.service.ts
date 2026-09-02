// src/modules/legacy/tratamiento/tratamiento.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { TratamientoRepository } from './repositories/tratamiento.repository';
import { TratamientoDto } from '@vivero/shared';

@Injectable()
export class LegacyTratamientoService {
  constructor(private readonly repository: TratamientoRepository) {}

  async getAll(): Promise<TratamientoDto[]> {
    const tratamientos = await this.repository.findAll();
    return tratamientos;
  }

  async getByCodigo(codigo: string): Promise<TratamientoDto> {
    const tratamiento = await this.repository.findOne(codigo);
    if (!tratamiento) throw new NotFoundException('Tratamiento not found');
    return tratamiento;
  }
}
