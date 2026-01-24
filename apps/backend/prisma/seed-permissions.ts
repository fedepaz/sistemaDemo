// prisma/seed-permissions.ts

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PermissionScope, PrismaClient } from '../src/generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL not found in .env file');
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find the admin user by username
  const admin = await prisma.user.findFirst({
    where: { username: 'admin' },
    select: { id: true },
  });

  if (!admin) {
    throw new Error('Admin user not found');
  }
  console.log('✅ Admin user found');

  // Define permissions for the admin user
  const adminPermissions = [
    // Core admin tables - full access
    {
      table: 'tenants',
      crud: { create: true, read: true, update: true, delete: true },
      scope: PermissionScope.ALL,
    },
    {
      table: 'users',
      crud: { create: true, read: true, update: true, delete: true },
      scope: PermissionScope.ALL,
    },
    {
      table: 'audit_logs',
      crud: { create: true, read: true, update: true, delete: true },
      scope: PermissionScope.ALL,
    },
    {
      table: 'messages',
      crud: { create: true, read: true, update: true, delete: true },
      scope: PermissionScope.ALL,
    },
    {
      table: 'enums',
      crud: { create: true, read: true, update: true, delete: true },
      scope: PermissionScope.ALL,
    },
  ];

  // Upsert permissions for the admin user
  for (const perm of adminPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_tableName: {
          userId: admin.id,
          tableName: perm.table,
        },
      },
      create: {
        userId: admin.id,
        tableName: perm.table,
        canCreate: perm.crud.create,
        canRead: perm.crud.read,
        canUpdate: perm.crud.update,
        canDelete: perm.crud.delete,
        scope: perm.scope,
      },
      update: {
        canCreate: perm.crud.create,
        canRead: perm.crud.read,
        canUpdate: perm.crud.update,
        canDelete: perm.crud.delete,
        scope: perm.scope,
      },
    });
    console.log(`Granted permissions for ${perm.table} (${perm.scope})`);
  }

  console.log('✅ Admin permissions granted');
}

main()
  .catch((e) => {
    console.error(`Error: ${e}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
