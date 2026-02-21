// src/permissions/permissions.service.ts

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PermissionCheck, UserPermissions } from '@vivero/shared';
import { PermissionsRepository } from './repositories/permissions.repository';

type ActionKey = 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete';

@Injectable()
export class PermissionsService {
  // Allowed table names = SQL table names from @@map
  private readonly logger = new Logger(PermissionsService.name);
  private readonly ALLOWED_TABLES = [
    'audit_logs',
    'tenants',
    'users',
    'user_permissions',
    // Add future entity tables here using their @@map name
  ] as const;

  private isAllowedTable(
    tableName: string,
  ): tableName is (typeof this.ALLOWED_TABLES)[number] {
    return (this.ALLOWED_TABLES as readonly string[]).includes(tableName);
  }
  constructor(private permissionsRepo: PermissionsRepository) {}

  /**
   * Validate table name
   */
  validateTableName(
    tableName: string,
  ): asserts tableName is (typeof this.ALLOWED_TABLES)[number] {
    if (!this.isAllowedTable(tableName)) {
      this.logger.warn(`Invalid table name: ${tableName}`);
      throw new BadRequestException(`Invalid table name: ${tableName}`);
    }
  }

  /**
   * Get all tables
   */
  getAllTables(): string[] {
    return [...this.ALLOWED_TABLES];
  }

  /**
   * Get all permissions for a user (with caching)
   */
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    // TODO: Implement caching
    const records = await this.permissionsRepo.findManyByUserId(userId);

    const map: UserPermissions = {};
    for (const r of records) {
      map[r.tableName] = {
        canCreate: r.canCreate,
        canRead: r.canRead,
        canUpdate: r.canUpdate,
        canDelete: r.canDelete,
        scope: r.scope,
      };
    }
    return map;
  }

  /**
   * Check if user can perform action on table
   */
  async canPerform(userId: string, check: PermissionCheck): Promise<boolean> {
    this.validateTableName(check.tableName);

    const perms = await this.getUserPermissions(userId);
    const tablePerm = perms[check.tableName];

    if (!tablePerm) return false;
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
    tableName: string,
    action: 'read' | 'update' | 'delete',
    recordOwnerId: string,
  ): Promise<boolean> {
    this.validateTableName(tableName);

    const perms = await this.getUserPermissions(userId);
    const tablePerm = perms[tableName];

    if (!tablePerm) return false;
    if (!tablePerm[`can${action.charAt(0).toUpperCase() + action.slice(1)}`])
      return false;

    if (tablePerm.scope === 'ALL') return true; // Can access all records
    if (tablePerm.scope === 'OWN') return recordOwnerId === userId; // Can only access own records

    return false; // NONE scope
  }

  /**
   * Grant permission to user
   */
  async grantPermission(
    userId: string,
    tableName: string,
    data: {
      canCreate?: boolean;
      canRead?: boolean;
      canUpdate?: boolean;
      canDelete?: boolean;
      scope?: 'NONE' | 'OWN' | 'ALL';
    },
  ): Promise<void> {
    this.validateTableName(tableName);

    await this.permissionsRepo.upsert(userId, tableName, data);
  }

  /**
   * Revoke all permissions for a table
   */
  async revokeTablePermissions(
    userId: string,
    tableName: string,
  ): Promise<void> {
    this.validateTableName(tableName);

    await this.permissionsRepo.deleteByUserIdTableName(userId, tableName);
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
    }>,
  ): Promise<void> {
    // Validate tables names
    const invalidTables = permissions
      .map((p) => p.tableName)
      .filter((tableName) => !this.isAllowedTable(tableName));

    if (invalidTables.length > 0) {
      const invalidTablesNames = invalidTables.join(', ');
      throw new BadRequestException(
        `Invalid table name: ${invalidTablesNames}`,
      );
    }

    // Gete existing permissions
    const currentPerms = await this.permissionsRepo.findManyByUserId(userId);
    const currentTableNames = currentPerms.map((p) => p.tableName);
    const inputTableNames = permissions.map((p) => p.tableName);

    // Delete permissions for tables that are not in the input
    const tablesToDelete = currentTableNames.filter(
      (tableName) => !inputTableNames.includes(tableName),
    );
    await Promise.all(
      tablesToDelete.map((tableName) =>
        this.permissionsRepo.deleteByUserIdTableName(userId, tableName),
      ),
    );

    // Upsert permissions for tables that are in the input
    await Promise.all(
      permissions.map((p) =>
        this.permissionsRepo.upsert(userId, p.tableName, {
          canCreate: p.canCreate,
          canRead: p.canRead,
          canUpdate: p.canUpdate,
          canDelete: p.canDelete,
          scope: p.scope,
        }),
      ),
    );
  }
}
