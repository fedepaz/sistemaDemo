// src/modules/legacy/depositos/depositos.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { DepositosRepository } from './repositories/depositos.repository';

@Injectable()
export class DepositosService {
  constructor(private readonly depositosRepository: DepositosRepository) {}

  async getAll() {
    return this.depositosRepository.findAll();
  }

  async getDepositoByCodigo(codigo: number) {
    const deposito = await this.depositosRepository.findOne(codigo);
    if (!deposito) throw new NotFoundException('Deposito not found');
    return deposito;
  }

  async getAllCamaras() {
    return this.depositosRepository.findAllByCamara();
  }
}
