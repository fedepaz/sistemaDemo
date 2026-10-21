// src/modules/formula/formula.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FormulaRepository } from './repositories/formula.repository';
import { CreateFormulaDto, FormulaDto } from '@vivero/shared';
import { Prisma } from '../../generated/prisma/client';

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
    try {
      return await this.repo.create(data);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe una fórmula con ese nombre');
      }
      throw error;
    }
  }

  async deleteFormula(id: string, requesterId: string) {
    const formula = await this.repo.findById(id, requesterId);
    if (!formula) throw new NotFoundException('Formula not found');
    return this.repo.softDelete(id, requesterId);
  }
}
