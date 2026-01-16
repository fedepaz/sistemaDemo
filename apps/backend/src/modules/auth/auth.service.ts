// src/modules/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { UserAuthRepository } from './repositories/userAuth.repository';
import { User } from '../../generated/prisma/client';

@Injectable()
export class AuthService {
  private readonly DEFAULT_ROLE_ID = 'cmk1lzh4l0004j8l5pw5jezn5';
  constructor(private readonly userRepo: UserAuthRepository) {}
  async findOrCreateUser(input: {
    tenantId: string;
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    // check if user exists
    const existingUser = await this.userRepo.findByClerkId(input.clerkId);

    if (existingUser) {
      const needsUpdate =
        existingUser.email !== input.email ||
        existingUser.firstName !== input.firstName ||
        existingUser.lastName !== input.lastName;

      if (needsUpdate) {
        return this.userRepo.updateUser(existingUser.id, {
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
        });
      }
      return existingUser;
    }

    // check tenant exists
    const tenant = await this.userRepo.findTenantById(input.tenantId);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // get default role
    const role = await this.userRepo.findRoleById(this.DEFAULT_ROLE_ID);

    if (!role) {
      throw new Error('Role not found');
    }

    // create user
    return this.userRepo.createUser({
      clerkId: input.clerkId,
      email: input.email,
      firstName: input.firstName || 'Dev',
      lastName: input.lastName || 'User',
      tenantId: tenant.id,
      roleId: role.id,
    });
  }

  findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  findAllByTenantId(tenantId: string): Promise<User[]> {
    return this.userRepo.findAllByTenantId(tenantId);
  }
}
