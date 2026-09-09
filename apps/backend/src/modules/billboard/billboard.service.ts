import { Injectable } from '@nestjs/common';
import { BillboardRepository } from './repositories/billboard.repository';
import { PermissionsService } from '../permissions/permissions.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { BillboardMessageDto } from '@vivero/shared';

type ActionKey = 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete';

const SCOPE_ORDER: Record<string, number> = {
  NONE: 0,
  OWN: 1,
  ALL: 2,
};

@Injectable()
export class BillboardService {
  constructor(
    private readonly billboardRepo: BillboardRepository,
    private readonly permissionsService: PermissionsService,
    private readonly usersRepo: UsersRepository,
  ) {}

  async getUnreadMessages(userId: string): Promise<BillboardMessageDto[]> {
    const [allMessages, readIds, userPerms, user] = await Promise.all([
      this.billboardRepo.findAll(userId),
      this.billboardRepo.findReadIds(userId),
      this.permissionsService.getUserPermissionsByUserId(userId),
      this.usersRepo.findById(userId, userId),
    ]);

    if (!user) return [];

    const permissionFiltered = allMessages.filter((msg) => {
      const tablePerm = userPerms[msg.permissionTable];
      if (!tablePerm) return false;

      const actionKey =
        `can${msg.permissionAction.charAt(0).toUpperCase()}${msg.permissionAction.slice(1)}` as ActionKey;
      if (!tablePerm[actionKey]) return false;

      const userScopeLevel = SCOPE_ORDER[tablePerm.scope] ?? 0;
      const requiredScopeLevel = SCOPE_ORDER[msg.permissionScope] ?? 0;
      if (userScopeLevel < requiredScopeLevel) return false;

      return true;
    });

    const effectiveFiltered = permissionFiltered.filter((msg) => {
      if (msg.effectiveFrom && user.createdAt < msg.effectiveFrom) return false;
      return true;
    });

    const targetFiltered = effectiveFiltered.filter((msg) => {
      if (!msg.targetNewUsers && user.createdAt > msg.createdAt) return false;
      return true;
    });

    const tagMap = new Map<string, (typeof targetFiltered)[0]>();
    for (const msg of targetFiltered) {
      const existing = tagMap.get(msg.tag);
      if (!existing || msg.createdAt > existing.createdAt) {
        tagMap.set(msg.tag, msg);
      }
    }

    const unread = Array.from(tagMap.values()).filter(
      (msg) => !readIds.has(msg.id),
    );

    unread.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return unread.map((msg) => ({
      id: msg.id,
      title: msg.title,
      body: msg.body,
      tag: msg.tag,
      createdAt: msg.createdAt.toISOString(),
    }));
  }

  async markAsRead(userId: string, messageIds?: string[]): Promise<number> {
    let idsToMark = messageIds;

    if (!idsToMark || idsToMark.length === 0) {
      const unread = await this.getUnreadMessages(userId);
      idsToMark = unread.map((m) => m.id);
    }

    return this.billboardRepo.markAsRead(userId, idsToMark);
  }
}
