// src/auth/user/user.repository.ts

import { Injectable } from '@nestjs/common';
import { Role, Tenant, User } from '../../../generated/prisma/client';

import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class UserAuthRepository {
  constructor(private prisma: PrismaService) {}

  findByClerkId(clerkId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        clerkId,
      },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  findAllByTenantId(tenantId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        tenantId,
      },
    });
  }

  findTenantById(id: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: {
        id,
      },
    });
  }

  findRoleById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: {
        id,
      },
    });
  }

  createUser(data: {
    tenantId: string;
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  updateUser(
    id: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<User> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }
}
