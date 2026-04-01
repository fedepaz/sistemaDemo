// src/permissions/permissions.service.ts

import {
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
} from '@vivero/shared';
import { PermissionsRepository } from './repositories/permissions.repository';
import { EntitiesRepository } from '../entities/repositories/entities.repository';
import { UserPermissionRecord } from './interfaces/permission.interface';

type ActionKey = 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete';

@Injectable()
export class PermissionsService {
  // Allowed table names = SQL table names from @@map
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private permissionsRepo: PermissionsRepository,
    private entitiesRepo: EntitiesRepository,
  ) {}

  /**
   * Get all tables filtered by what the requester can actually see
   */
  async getAllTables(requesterId: string): Promise<Entity[]> {
    const allEntities = await this.entitiesRepo.findAllAdmin();
    if (!allEntities) {
      throw new InternalServerErrorException('Error getting tables');
    }

    const requesterPerms = await this.getUserPermissions(requesterId);

    // Filter: Only show entities where the requester has at least one true permission
    return allEntities
      .filter((e) => {
        const p = requesterPerms[e.name];
        return p && (p.canRead || p.canCreate || p.canUpdate || p.canDelete);
      })
      .map((e) => ({
        name: e.name,
        label: e.label,
        permissionType: e.permissionType,
      }));
  }

  async getTableByName(tableName: string): Promise<Entity> {
    const entity = await this.entitiesRepo.findByName(tableName);
    if (!entity) {
      throw new NotFoundException(`Entity ${tableName} not found`);
    }
    return {
      name: entity.name,
      label: entity.label,
      permissionType: entity.permissionType,
    };
  }

  /**
   * Get all permissions for a user (with caching)
   */
  async getUserPermissions(userId: string): Promise<UserPermissions> {
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
   * Check if user can perform action on table
   */
  async canPerform(userId: string, check: PermissionCheck): Promise<boolean> {
    const perms = await this.getUserPermissions(userId);
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
    const perms = await this.getUserPermissions(userId);
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
    // 1. Get requester's permissions to check what they are allowed to manage
    const requesterPerms = await this.getUserPermissions(requesterId);

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

    for (const p of permissions) {
      const rP = requesterPerms[p.tableName];
      if (!rP) continue; // Skip if requester doesn't even have this entity in their list

      const entity = await this.entitiesRepo.findByName(p.tableName);

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

    // 3. Get existing permissions of target user
    const currentTargetPerms =
      await this.permissionsRepo.findManyByUserId(targetUserId);

    // 4. PRESERVE current permissions for entities the requester CANNOT see/manage
    const preservedPerms: Array<UserPermissionRecord> = [];
    for (const cur of currentTargetPerms) {
      const rP = requesterPerms[cur.entityName];
      if (!rP) {
        // Requester cannot manage this entity, keep it as is
        preservedPerms.push({
          userId: cur.userId,
          entityId: cur.entityId,
          entityName: cur.entityName,
          canCreate: cur.canCreate,
          canRead: cur.canRead,
          canUpdate: cur.canUpdate,
          canDelete: cur.canDelete,
          scope: cur.scope,
          permissionType: cur.permissionType,
        });
      }
    }

    // 5. Merge Preserved + Input
    const finalizedToUpsert = [
      ...preservedPerms,
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
