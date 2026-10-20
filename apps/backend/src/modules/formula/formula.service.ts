// src/modules/formula/formula.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { FormulaRepository } from './repositories/formula.repository';
import { CreateFormulaDto, FormulaDto } from '@vivero/shared';

@Injectable()
export class FormulaService {
  constructor(private readonly repo: FormulaRepository) {}

  async getAllFormula(requesterId: string): Promise<FormulaDto[]> {
    return this.repo.findAll(requesterId);
  }

  async getFormulaById(id: string, requesterId: string): Promise<FormulaDto> {
    const formula = await this.repo.findById(id, requesterId);
    if (!formula) throw new NotFoundException('Formula not found');
    return formula;
  }

  async createFormula(data: CreateFormulaDto) {
    return this.repo.create(data);
  }

  async deleteFormula(id: string, requesterId: string) {
    const formula = await this.repo.findById(id, requesterId);
    if (!formula) throw new NotFoundException('Formula not found');
    return this.repo.softDelete(id, requesterId);
  }
}
