// src/modules/permissions/permissions.controller.ts

import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { RequirePermission } from './decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { UserPermissions, UserEntityPermission } from '@vivero/shared';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /* GET user autheticated permissions */
  @Get('me')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getMyPermissions(
    @CurrentUser() user: AuthUser,
  ): Promise<UserPermissions> {
    const perms = await this.permissionsService.getUserPermissions(
      user.id,
      user.id,
    );
    return perms;
  }

  /* GET all tables */
  @Get('tables')
  @RequirePermission({
    tableName: 'user_permissions',
    action: 'read',
    scope: 'ALL',
  })
  getAllTables(@CurrentUser() user: AuthUser) {
    const tables = this.permissionsService.getAllTables(user.id);
    return tables;
  }

  /* GET table by name */
  @Get('table/:tableName')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'ALL',
  })
  getTableByName(@Param('tableName') tableName: string) {
    const entity = this.permissionsService.getTableByName(tableName);
    return entity;
  }

  /* GET all permissions for a user */
  @Get('user/:userId')
  @RequirePermission({ tableName: 'user_permissions', action: 'read' })
  async getUserPermissions(
    @CurrentUser() user: AuthUser,
    @Param('userId') userId: string,
  ): Promise<UserPermissions> {
    const perms = await this.permissionsService.getUserPermissions(
      userId,
      user.id,
    );
    return perms;
  }

  /* GET all permissions for a specific entity (oversight) */
  @Get('entity/:entityId')
  @RequirePermission({
    tableName: 'user_permissions',
    action: 'read',
    scope: 'ALL',
  })
  async getEntityPermissions(
    @CurrentUser() user: AuthUser,
    @Param('entityId') entityId: string,
  ): Promise<UserEntityPermission[]> {
    return this.permissionsService.getPermissionsByEntity(entityId, user.id);
  }

  /* PATCH grant permission to a user */
  @Patch('user/:userId')
  @RequirePermission({
    tableName: 'user_permissions',
    action: 'update',
    scope: 'ALL',
  })
  async setUserPermissions(
    @CurrentUser() user: AuthUser,
    @Param('userId') userId: string,
    @Body('permissions')
    permissions: Array<{
      tableName: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      scope: 'NONE' | 'OWN' | 'ALL';
      permissionType: 'CRUD' | 'PROCESS' | 'READ_ONLY';
    }>,
  ): Promise<{ success: boolean }> {
    await this.permissionsService.setPermissionsForUser(
      user.id,
      userId,
      permissions,
    );
    return { success: true };
  }
}
