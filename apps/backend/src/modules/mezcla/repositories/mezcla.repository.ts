// src/modules/mezcla/repositories/mezcla.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { Mezcla } from '../../../generated/prisma/client';

@Injectable()
export class MezclaRepository extends BaseRepository<Mezcla> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.mezcla);
  }
}
