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
   * Get all tables
   */
  async getAllTables(): Promise<Entity[]> {
    const entities = await this.entitiesRepo.findAllAdmin();
    if (!entities) {
      throw new InternalServerErrorException('Error getting tables');
    }
    return entities.map((e) => ({
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
    userId: string,
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
    const resolvedPermissions = await Promise.all(
      permissions.map(async (p) => {
        const entity = await this.entitiesRepo.findByName(p.tableName);
        return { ...p, entityId: entity.id };
      }),
    );
    // Gete existing permissions
    const currentPerms = await this.permissionsRepo.findManyByUserId(userId);
    const currentEntityIds = currentPerms.map((p) => p.entityId);
    const inputEntityIds = resolvedPermissions.map((p) => p.entityId);

    // Delete permissions for tables that are not in the input
    const toDelete = currentEntityIds.filter(
      (entityId) => !inputEntityIds.includes(entityId),
    );
    await Promise.all(
      toDelete.map((entityId) =>
        this.permissionsRepo.deleteByUserIdTableName(userId, entityId),
      ),
    );

    // Upsert permissions for tables that are in the input
    await Promise.all(
      resolvedPermissions.map((p) =>
        this.permissionsRepo.upsert(userId, p.entityId, {
          canCreate: p.canCreate,
          canRead: p.canRead,
          canUpdate: p.canUpdate,
          canDelete: p.canDelete,
          scope: p.scope,
          permissionType: p.permissionType,
        }),
      ),
    );
  }
}
