// src/modules/legacy/agentes/agentes.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentesRepository } from './repositories/agentes.repository';

@Injectable()
export class LegacyAgentesService {
  constructor(private readonly repository: AgentesRepository) {}

  async getAllAgents() {
    const agentes = await this.repository.findAll();
    return agentes;
  }

  async getAgentByCodigo(codigo: number) {
    const agent = await this.repository.findOne(codigo);
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }
}
