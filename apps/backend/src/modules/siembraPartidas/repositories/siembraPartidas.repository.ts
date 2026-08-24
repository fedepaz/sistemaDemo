// src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { SiembraPartidas } from '../../../generated/prisma/client';

@Injectable()
export class SiembraPartidasRepository extends BaseRepository<SiembraPartidas> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.siembraPartidas);
  }
}
