// src/modules/tenants/repositories/tenants.repository.ts

import { Injectable } from '@nestjs/common';
import { Tenant } from '../../../generated/prisma/client';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class TenantsRepository extends BaseRepository<Tenant> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.tenant);
  }
}
