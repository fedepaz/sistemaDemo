// src/modules/formula/formula.controller.ts

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { FormulaService } from './formula.service';
import {
  CreateFormulaDto,
  CreateFormulaSchema,
  FormulaDto,
} from '@vivero/shared';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';

@Controller('formula')
export class FormulaController {
  constructor(private readonly service: FormulaService) {}

  @Get()
  @RequirePermission({
    tableName: 'formulas',
    action: 'read',
    scope: 'ALL',
  })
  async getAllFormula(@CurrentUser() user: AuthUser): Promise<FormulaDto[]> {
    return this.service.getAllFormula(user.id);
  }

  @Post()
  @RequirePermission({ tableName: 'formulas', action: 'create', scope: 'ALL' })
  async createFormula(
    @Body(new ZodValidationPipe(CreateFormulaSchema))
    data: CreateFormulaDto,
  ) {
    return this.service.createFormula(data);
  }

  @Get(':id')
  @RequirePermission({ tableName: 'formulas', action: 'read', scope: 'ALL' })
  async getFormula(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<FormulaDto> {
    return this.service.getFormulaById(id, user.id);
  }

  @Delete(':id')
  @RequirePermission({ tableName: 'formulas', action: 'delete', scope: 'ALL' })
  async deleteFormula(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.deleteFormula(id, user.id);
  }
}
