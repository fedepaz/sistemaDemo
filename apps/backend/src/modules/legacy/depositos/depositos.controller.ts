// src/modules/legacy/depositos/depositos.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { DepositosService } from './depositos.service';

import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

@Controller('l-depositos')
export class DepositosController {
  constructor(private readonly service: DepositosService) {}

  @Get()
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getAllDepositos() {
    return this.service.getAll();
  }
  @Get('/camaras')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getAllDepositosByCamara() {
    return this.service.getAllCamaras();
  }

  @Get('/:codigo')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getDepositoByCodigo(@Param('codigo') codigo: number) {
    return this.service.getDepositoByCodigo(codigo);
  }
}
