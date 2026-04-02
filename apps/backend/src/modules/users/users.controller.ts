// app/modules/users/users.controller.ts

import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UpdateUserProfileDto,
  UpdateUserProfileSchema,
  UserProfileDto,
} from '@vivero/shared';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { PermissionsService } from '../permissions/permissions.service';
import { TenantsService } from '../tenants/tenants.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly service: UsersService,
    private readonly permissionsService: PermissionsService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Get('me')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
  })
  async getMe(@CurrentUser() user: AuthUser): Promise<UserProfileDto> {
    const userProfile = await this.service.getProfile(user.id, user.id);
    const tenant = await this.tenantsService.getTenantById(
      userProfile.tenantId,
      user.id,
    );
    return {
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      isActive: userProfile.isActive,
      tenantName: tenant.name,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    };
  }

  @Patch('me')
  @RequirePermission({ tableName: 'users', action: 'read', scope: 'OWN' })
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateUserProfileSchema))
    body: UpdateUserProfileDto,
  ) {
    return this.service.updateProfile(user.username, body);
  }

  @Get('all')
  @RequirePermission({ tableName: 'users', action: 'read' })
  async getAllUsers(@CurrentUser() user: AuthUser) {
    const canReadAll = await this.permissionsService.canPerform(user.id, {
      tableName: 'users',
      action: 'read',
      scope: 'ALL',
    });
    if (canReadAll) {
      return this.service.getAllUsers(user.id);
    } else {
      return [await this.service.getUserById(user.id, user.id)];
    }
  }

  @Get('username/:username')
  @RequirePermission({ tableName: 'users', action: 'read', scope: 'ALL' })
  getUserByUsername(@Param('username') username: string) {
    return this.service.getUserByUsername(username);
  }

  @Get('tenant/:tenantId')
  @RequirePermission({ tableName: 'users', action: 'read', scope: 'ALL' })
  getUserByTenantId(@Param('tenantId') tenantId: string) {
    return this.service.getUserByTenantId(tenantId);
  }

  @Patch(':username')
  @RequirePermission({ tableName: 'users', action: 'update', scope: 'ALL' })
  async updateUserByUsername(
    @CurrentUser() user: AuthUser,
    @Param('username') username: string,
    @Body(new ZodValidationPipe(UpdateUserProfileSchema))
    body: UpdateUserProfileDto,
  ) {
    return this.service.updateProfile(username, body);
  }

  @Delete(':username')
  @RequirePermission({ tableName: 'users', action: 'delete', scope: 'ALL' })
  async deleteUserByUsername(
    @CurrentUser() user: AuthUser,
    @Param('username') username: string,
  ) {
    return this.service.softRemoveUserByUsername(username, user.id);
  }

  @Patch(':userId/recover')
  @RequirePermission({ tableName: 'users', action: 'update', scope: 'ALL' })
  async recoverUserById(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.recoverUserById(userId, user.id);
  }
}
