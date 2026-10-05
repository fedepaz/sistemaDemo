// src/modules/legacy/tipoContenedor/tipoContenedor.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoContenedorRepository } from './repositories/tipoContenedor.repository';
import { LegacyTipoContenedorDto } from '@vivero/shared';

@Injectable()
export class LegacyTipoContenedorService {
  constructor(private readonly repository: TipoContenedorRepository) {}

  async getAll(): Promise<LegacyTipoContenedorDto[]> {
    const tipos = await this.repository.findAll();
    return tipos;
  }

  async getByCodigo(codigo: string): Promise<LegacyTipoContenedorDto> {
    const tipo = await this.repository.findOne(codigo);
    if (!tipo) throw new NotFoundException('TipoContenedor not found');
    return tipo;
  }
}
