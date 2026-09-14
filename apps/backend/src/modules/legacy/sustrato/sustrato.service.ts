import { Injectable, NotFoundException } from '@nestjs/common';
import { SustratoRepository } from './repositories/sustrato.repository';
import { LegacySustratoDto } from '@vivero/shared';

@Injectable()
export class LegacySustratoService {
  constructor(private readonly repository: SustratoRepository) {}

  async getAll(): Promise<LegacySustratoDto[]> {
    return this.repository.findAll();
  }

  async getByCodigo(codigo: string): Promise<LegacySustratoDto> {
    const sustrato = await this.repository.findOne(codigo);
    if (!sustrato) throw new NotFoundException('Sustrato not found');
    return sustrato;
  }
}
