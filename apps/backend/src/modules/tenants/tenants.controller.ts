// src/modules/tenants/tenants.controller.ts

import { Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('all')
  @RequirePermission({ tableName: 'tenants', action: 'read' })
  async getAllTenants(@CurrentUser() user: AuthUser) {
    return this.tenantsService.getAllTenants(user.id);
  }

  @Get('tenant/:tenantId')
  @RequirePermission({ tableName: 'tenants', action: 'read', scope: 'ALL' })
  async getTenantById(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tenantsService.getTenantById(tenantId, user.id);
  }

  @Delete(':tenantId')
  @RequirePermission({ tableName: 'tenants', action: 'delete', scope: 'ALL' })
  async softDeleteById(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tenantsService.softDeleteById(tenantId, user.id);
  }

  @Patch(':tenantId/recover')
  @RequirePermission({ tableName: 'tenants', action: 'update', scope: 'ALL' })
  async recoverById(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tenantsService.recoverById(tenantId, user.id);
  }
}
