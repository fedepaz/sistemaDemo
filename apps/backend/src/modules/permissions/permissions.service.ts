// src/permissions/permissions.service.ts

import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  PermissionCheck,
  UserPermissions,
  PermissionType,
  Entity,
  UserEntityPermission,
} from '@vivero/shared';
import { PermissionsRepository } from './repositories/permissions.repository';
import { EntitiesRepository } from '../entities/repositories/entities.repository';
import { UserPermissionRecord } from './interfaces/permission.interface';
import { UsersRepository } from '../users/repositories/users.repository';

type ActionKey = 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete';

@Injectable()
export class PermissionsService {
  // Allowed table names = SQL table names from @@map
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private permissionsRepo: PermissionsRepository,
    private entitiesRepo: EntitiesRepository,
    private usersRepo: UsersRepository,
  ) {}

  /**
   * Get all tables filtered by what the requester can actually see
   */
  async getAllTables(requesterId: string): Promise<Entity[]> {
    const allEntities = await this.entitiesRepo.findAll(requesterId);
    if (!allEntities) {
      throw new InternalServerErrorException('Error getting tables');
    }

    const requesterPerms = await this.getUserPermissionsByUserId(requesterId);

    // Filter: Only show entities where the requester has at least one true permission
    return allEntities
      .filter((e) => {
        const p = requesterPerms[e.name];
        return p && (p.canRead || p.canCreate || p.canUpdate || p.canDelete);
      })
      .map((e) => ({
        id: e.id.toString(),
        name: e.name,
        label: e.label,
        permissionType: e.permissionType,
        isActive: e.isActive,
      }));
  }

  async getTableByName(tableName: string): Promise<Entity> {
    const entity = await this.entitiesRepo.findByName(tableName);
    if (!entity) {
      throw new NotFoundException(`Entity ${tableName} not found`);
    }
    return {
      id: entity.id.toString(),
      name: entity.name,
      label: entity.label,
      permissionType: entity.permissionType,
    };
  }

  /**
   * Get all permissions for a user (with caching)
   */
  async getUserPermissionsByUserId(userId: string): Promise<UserPermissions> {
    // TODO: Implement caching
    const records = await this.permissionsRepo.findManyByUserId(userId);

    const map: UserPermissions = {};
    for (const r of records) {
      map[r.entityName] = {
        canCreate: r.canCreate,
        canRead: r.canRead,
        canUpdate: r.canUpdate,
        canDelete: r.canDelete,
        scope: r.scope,
        permissionType: r.permissionType,
      };
    }
    return map;
  }

  /**
   * Get all permissions for by entityId
   */
  async getUserPermissionsByEntityId(
    entityId: string,
    requesterId: string,
  ): Promise<UserEntityPermission[]> {
    // TODO: Implement caching
    const records = await this.permissionsRepo.findManyByEntityId(
      entityId,
      requesterId,
    );

    return records.map((r) => ({
      userId: r.userId,
      username: r.userMetadata?.username || 'Unknown',
      firstName: r.userMetadata?.firstName,
      lastName: r.userMetadata?.lastName,
      permissions: {
        canCreate: r.canCreate,
        canRead: r.canRead,
        canUpdate: r.canUpdate,
        canDelete: r.canDelete,
        scope: r.scope,
        permissionType: r.permissionType,
      },
      createdAt: r.createdAt,
    }));
  }

  /**
   * Check if user can perform action on table
   */
  async canPerform(userId: string, check: PermissionCheck): Promise<boolean> {
    const perms = await this.getUserPermissionsByUserId(userId);
    const tablePerm = perms[check.tableName];

    if (!tablePerm) return false;

    // Enforcement based on PermissionType
    if (tablePerm.permissionType === 'READ_ONLY' && check.action !== 'read') {
      return false;
    }

    if (tablePerm.permissionType === 'PROCESS' && check.action !== 'create') {
      // Assuming 'create' maps to 'execute/generate' for processes
      // and 'read' might be allowed if there is a log or result to see.
      if (check.action !== 'read') return false;
    }

    const actionKey =
      `can${check.action.charAt(0).toUpperCase() + check.action.slice(1)}` as const;

    if (!(actionKey in tablePerm)) {
      return false; // Should never happen, but safe
    }

    const hasAction = tablePerm[actionKey as ActionKey];

    if (!hasAction) return false;

    if (check.scope === 'ALL' && tablePerm.scope !== 'ALL') return false;
    if (check.scope === 'OWN' && tablePerm.scope === 'NONE') return false;

    return true;
  }

  /**
   * Check if user can access specific record (row-level check)
   */
  async canAccessRecord(
    userId: string,
    entityId: string,
    action: 'read' | 'update' | 'delete',
    recordOwnerId: string,
  ): Promise<boolean> {
    const perms = await this.getUserPermissionsByUserId(userId);
    const tablePerm = perms[entityId];

    if (!tablePerm) return false;
    const actionKey =
      `can${action.charAt(0).toUpperCase() + action.slice(1)}` as ActionKey;

    if (!tablePerm[actionKey]) return false;

    if (tablePerm.scope === 'ALL') return true; // Can access all records
    if (tablePerm.scope === 'OWN') return recordOwnerId === userId; // Can only access own records

    return false; // NONE scope
  }

  /**
   * Grant permission to user
   */
  async grantPermission(
    userId: string,
    entityId: string,
    data: {
      canCreate?: boolean;
      canRead?: boolean;
      canUpdate?: boolean;
      canDelete?: boolean;
      scope?: 'NONE' | 'OWN' | 'ALL';
      permissionType?: PermissionType;
    },
  ): Promise<void> {
    await this.permissionsRepo.upsert(userId, entityId, data);
  }

  /**
   * Revoke all permissions for a table
   */
  async revokeTablePermissions(
    userId: string,
    entityId: string,
  ): Promise<void> {
    await this.permissionsRepo.deleteByUserIdTableName(userId, entityId);
  }

  async setPermissionsForUser(
    requesterId: string,
    targetUserId: string,
    permissions: Array<{
      tableName: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      scope: 'NONE' | 'OWN' | 'ALL';
      permissionType: 'CRUD' | 'PROCESS' | 'READ_ONLY';
    }>,
  ): Promise<void> {
    // RULE 1 - User seniority check
    const requesterUser = await this.usersRepo.findById(
      requesterId,
      requesterId,
    );
    const targetUser = await this.usersRepo.findById(targetUserId, requesterId);

    if (!requesterUser || !targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.createdAt <= requesterUser.createdAt) {
      throw new ForbiddenException(
        'You cannot manage permissions for a user with equal or greater seniority.',
      );
    }

    // 1. Get requester's permissions (raw records to get createdAt)
    const requesterRecords =
      await this.permissionsRepo.findManyByUserId(requesterId);
    const requesterPermsMapByEntityId = new Map<string, UserPermissionRecord>();
    const requesterPerms: UserPermissions = {};

    for (const r of requesterRecords) {
      requesterPermsMapByEntityId.set(r.entityId, r);
      requesterPerms[r.entityName] = {
        canCreate: r.canCreate,
        canRead: r.canRead,
        canUpdate: r.canUpdate,
        canDelete: r.canDelete,
        scope: r.scope,
        permissionType: r.permissionType,
      };
    }

    // 2. Resolve input permissions and filter them by requester access
    const inputManagedByRequester: Array<{
      entityId: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      scope: 'NONE' | 'OWN' | 'ALL';
      permissionType: 'CRUD' | 'PROCESS' | 'READ_ONLY';
    }> = [];

    // 3. Get existing permissions of target user
    const currentTargetPerms =
      await this.permissionsRepo.findManyByUserId(targetUserId);
    const currentTargetPermsMapByEntityId = new Map<
      string,
      UserPermissionRecord
    >();
    for (const r of currentTargetPerms) {
      currentTargetPermsMapByEntityId.set(r.entityId, r);
    }

    for (const p of permissions) {
      const rP = requesterPerms[p.tableName];
      if (!rP) continue; // Skip if requester doesn't even have this entity in their list

      const entity = await this.entitiesRepo.findByName(p.tableName);

      // RULE 2 - Permission seniority check
      const existingTargetPerm = currentTargetPermsMapByEntityId.get(entity.id);
      const requesterPermRecord = requesterPermsMapByEntityId.get(entity.id);

      if (
        existingTargetPerm &&
        requesterPermRecord &&
        existingTargetPerm.createdAt < requesterPermRecord.createdAt
      ) {
        // Skip modification: Target had this permission before the requester
        continue;
      }

      // IMPORTANT: Granting logic. We ensure the manager doesn't grant more than they have.
      // If a manager has "OWN" scope, they CANNOT grant "ALL".
      const validScope =
        p.scope === 'ALL' && rP.scope !== 'ALL' ? rP.scope : p.scope;

      inputManagedByRequester.push({
        entityId: entity.id,
        // Also clamp CRUD actions to requester's own permissions for safety
        canCreate: p.canCreate && rP.canCreate,
        canRead: p.canRead && rP.canRead,
        canUpdate: p.canUpdate && rP.canUpdate,
        canDelete: p.canDelete && rP.canDelete,
        scope: validScope,
        permissionType: p.permissionType,
      });
    }

    // 4. PRESERVE current permissions for entities the requester CANNOT see/manage OR seniority rule applied
    // (A permission is preserved if its entityId is NOT in inputManagedByRequester)
    const inputEntityIds = new Set(
      inputManagedByRequester.map((i) => i.entityId),
    );
    const finalizedToUpsert = [
      ...inputManagedByRequester.map((p) => ({
        entityId: p.entityId,
        canCreate: p.canCreate,
        canRead: p.canRead,
        canUpdate: p.canUpdate,
        canDelete: p.canDelete,
        scope: p.scope,
        permissionType: p.permissionType,
      })),
    ];

    for (const cur of currentTargetPerms) {
      if (!inputEntityIds.has(cur.entityId)) {
        // This includes entities the requester can't see, AND those skipped by Rule 2
        finalizedToUpsert.push({
          entityId: cur.entityId,
          canCreate: cur.canCreate,
          canRead: cur.canRead,
          canUpdate: cur.canUpdate,
          canDelete: cur.canDelete,
          scope: cur.scope,
          permissionType: cur.permissionType,
        });
      }
    }

    // 6. Execution: Clean and Update
    await this.permissionsRepo.deleteAllForUser(targetUserId);

    // Batch upsert the new finalized list
    await Promise.all(
      finalizedToUpsert.map((p) =>
        this.permissionsRepo.upsert(targetUserId, p.entityId, p),
      ),
    );
  }
}
