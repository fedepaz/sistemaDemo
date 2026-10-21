import { Injectable, NotFoundException } from '@nestjs/common';
import { SustratoRepository } from './repositories/sustrato.repository';
import { LegacyProductoDto, LegacySustratoDto } from '@vivero/shared';

@Injectable()
export class LegacySustratoService {
  constructor(private readonly repository: SustratoRepository) {}

  async getAllSustratos(): Promise<LegacySustratoDto[]> {
    return this.repository.findAllSustrato();
  }

  async getSustratoByCodigo(codigo: string): Promise<LegacySustratoDto> {
    const sustrato = await this.repository.findOneSustrato(codigo);
    if (!sustrato) throw new NotFoundException('Sustrato not found');
    return sustrato;
  }

  async getAllProductos(): Promise<LegacyProductoDto[]> {
    return this.repository.findAllProductos();
  }

  async getProductoByCodigo(codigo: string): Promise<LegacyProductoDto> {
    const producto = await this.repository.findOneProducto(codigo);
    if (!producto) throw new NotFoundException('Producto not found');
    return producto;
  }
}
