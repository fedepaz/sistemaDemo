// src/modules/billboard/repositories/billboard.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { BillboardMessage } from '../../../generated/prisma/client';

@Injectable()
export class BillboardRepository extends BaseRepository<BillboardMessage> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.billboardMessage);
  }

  async findReadIds(userId: string): Promise<Set<string>> {
    const reads = await this.prisma.userBillboardRead.findMany({
      where: { userId },
      select: { billboardMessageId: true },
    });
    return new Set(reads.map((r) => r.billboardMessageId));
  }

  async markAsRead(userId: string, messageIds: string[]): Promise<number> {
    if (messageIds.length === 0) return 0;

    const result = await this.prisma.userBillboardRead.createMany({
      data: messageIds.map((billboardMessageId) => ({
        userId,
        billboardMessageId,
      })),
      skipDuplicates: true,
    });

    return result.count;
  }

  async countUnreadForUser(userId: string): Promise<number> {
    const allMessages = await this.findAll(userId);
    const readIds = await this.findReadIds(userId);

    let count = 0;
    for (const msg of allMessages) {
      if (!readIds.has(msg.id)) {
        count++;
      }
    }
    return count;
  }
}
