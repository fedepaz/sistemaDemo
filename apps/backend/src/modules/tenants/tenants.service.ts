// src/modules/tenants/tenats.service.ts

import { Injectable } from '@nestjs/common';
import { TenantsRepository } from './repositories/tenants.repository';

@Injectable()
export class TenantsService {
  constructor(private readonly repo: TenantsRepository) {}

  async getAllTenants() {
    const tenants = await this.repo.findAll();
    return tenants;
  }

  async getAllTenantsAdmin() {
    const tenants = await this.repo.findAllAdmin();
    return tenants;
  }

  async getTenantById(tenantId: string) {
    const tenant = await this.repo.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');
    return tenant;
  }

  async softDeleteById(tenantId: string, deletedByUserId: string) {
    return this.repo.softDelete(tenantId, deletedByUserId);
  }

  async recoverById(id: string) {
    return this.repo.recover(id);
  }
}
