// src/modules/permissions/permissions.controller.ts

import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { RequirePermission } from './decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { UserPermissions } from '@vivero/shared';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /* GET user autheticated permissions */
  @Get('me')
  @RequirePermission({ tableName: 'users', action: 'read', scope: 'OWN' })
  async getMyPermissions(
    @CurrentUser() user: AuthUser,
  ): Promise<UserPermissions> {
    const perms = await this.permissionsService.getUserPermissions(user.id);
    return perms;
  }

  /* GET all tables */
  @Get('tables')
  @RequirePermission({ tableName: 'users', action: 'read', scope: 'ALL' })
  getAllTables() {
    const tables = this.permissionsService.getAllTables();
    return tables;
  }

  /* GET all permissions for a user */
  @Get('user/:userId')
  @RequirePermission({ tableName: 'users', action: 'read', scope: 'ALL' })
  async getUserPermissions(
    @Param('userId') userId: string,
  ): Promise<UserPermissions> {
    const perms = await this.permissionsService.getUserPermissions(userId);
    return perms;
  }

  /* PATCH grant permission to a user */
  @Patch('user/:userId')
  @RequirePermission({ tableName: 'users', action: 'update', scope: 'ALL' })
  async setUserPermissions(
    @Param('userId') userId: string,
    @Body('permissions')
    permissions: Array<{
      tableName: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      scope: 'NONE' | 'OWN' | 'ALL';
    }>,
  ): Promise<{ success: boolean }> {
    await this.permissionsService.setPermissionsForUser(userId, permissions);
    return { success: true };
  }
}
