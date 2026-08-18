// src/modules/legacy/programas/programas.controller.ts

import { Controller, Get } from '@nestjs/common';
import { LegacyProgramasService } from './programas.service';

@Controller('l-programas')
export class LegacyProgramasController {
  constructor(private readonly service: LegacyProgramasService) {}

  // Nota: este endpoint era @Public(). Los datos de programas no deben ser
  // accesibles sin autenticación, el guard global requiere JWT válido.
  @Get()
  async getAllProgramas() {
    return this.service.getAllProgramas();
  }
}
