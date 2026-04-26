// src/modules/legacy/depositos/depositos.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { DepositosService } from './depositos.service';

import { Public } from '../../../shared/decorators/public.decorator';

@Controller('l-depositos')
export class DepositosController {
  constructor(private readonly service: DepositosService) {}

  @Get()
  //@RequirePermission({ tableName: 'depositos', action: 'read' })
  @Public()
  async getAllDepositos() {
    return this.service.getAll();
  }
  @Get('/camaras')
  //@RequirePermission({ tableName: 'depositos', action: 'read' })
  @Public()
  async getAllDepositosByCamara() {
    return this.service.getAllCamaras();
  }

  @Get('/:codigo')
  //@RequirePermission({ tableName: 'depositos', action: 'read' })
  @Public()
  async getDepositoByCodigo(@Param('codigo') codigo: number) {
    return this.service.getDepositoByCodigo(codigo);
  }
}
