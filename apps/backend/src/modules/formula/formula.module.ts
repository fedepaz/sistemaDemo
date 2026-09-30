// src/modules/formula/formula.module.ts

import { Module } from '@nestjs/common';
import { FormulaController } from './formula.controller';
import { FormulaService } from './formula.service';
import { FormulaRepository } from './repositories/formula.repository';

@Module({
  controllers: [FormulaController],
  providers: [FormulaService, FormulaRepository],
  exports: [FormulaService],
})
export class FormulaModule {}
