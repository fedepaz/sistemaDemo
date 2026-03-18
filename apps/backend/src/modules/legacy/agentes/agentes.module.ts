// src/modules/legacy/agentes/agentes.module.ts

import { Module } from '@nestjs/common';
import { LegacyAgentesController } from './agentes.controller';
import { LegacyAgentesService } from './agentes.service';
import { AgentesRepository } from './repositories/agentes.repository';

@Module({
  controllers: [LegacyAgentesController],
  providers: [LegacyAgentesService, AgentesRepository],
})
export class LegacyAgentesModule {}
