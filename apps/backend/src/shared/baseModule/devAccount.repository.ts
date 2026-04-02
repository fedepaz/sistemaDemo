// src/shared/baseModule/devAccount.repository.ts

import { Injectable } from '@nestjs/common';
import { DevAccount } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class DevAccountRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<DevAccount[]> {
    return this.prisma.devAccount.findMany();
  }
}
