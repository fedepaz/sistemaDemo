// src/modules/legacy/programas/programas.controller.ts

import { Controller, Get } from '@nestjs/common';
import { Public } from '../../../shared/decorators/public.decorator';
import { LegacyProgramasService } from './programas.service';

@Controller('l-programas')
export class LegacyProgramasController {
  constructor(private readonly service: LegacyProgramasService) {}

  @Get()
  @Public()
  async getAllProgramas() {
    return this.service.getAllProgramas();
  }
}
