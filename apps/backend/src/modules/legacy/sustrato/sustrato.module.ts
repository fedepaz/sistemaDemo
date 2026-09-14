import { Module } from '@nestjs/common';
import { LegacySustratoController } from './sustrato.controller';
import { LegacySustratoService } from './sustrato.service';
import { SustratoRepository } from './repositories/sustrato.repository';

@Module({
  controllers: [LegacySustratoController],
  providers: [LegacySustratoService, SustratoRepository],
  exports: [LegacySustratoService],
})
export class LegacySustratoModule {}
