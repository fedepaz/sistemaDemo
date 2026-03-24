// prisma/seed-admin.ts

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import {
  PermissionScope,
  PermissionType,
  PrismaClient,
} from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

//const certPath = path.join(process.cwd(), 'certs', 'globalsignrootca.pem');
//const serverCert = fs.readFileSync(certPath, 'utf8');
const env = process.env.BACKEND_NODE_ENV;
const isProd = env === 'production';
const host = isProd
  ? process.env.DATABASE_PROD_HOST!
  : process.env.DATABASE_DEV_HOST!;
const port = isProd
  ? parseInt(process.env.DATABASE_PROD_PORT!)
  : parseInt(process.env.DATABASE_DEV_PORT!);
const user = isProd
  ? process.env.DATABASE_PROD_USERNAME!
  : process.env.DATABASE_DEV_USERNAME!;
const password = isProd
  ? process.env.DATABASE_PROD_PASSWORD!
  : process.env.DATABASE_DEV_PASSWORD!;
const database = isProd
  ? process.env.DATABASE_PROD_NAME!
  : process.env.DATABASE_DEV_NAME!;
// Create adapter with SSL
const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Create or update the tenant - 'Default Organization'
  let tenantId: string;

  const existingTenant = await prisma.tenant.findFirst({
    where: { name: 'Default Organization' },
  });

  if (existingTenant) {
    tenantId = existingTenant.id;
    console.log('✅ Default tenant found');
  } else {
    const newTenant = await prisma.tenant.create({
      data: {
        name: 'Default Organization',
      },
    });
    tenantId = newTenant.id;
    console.log('✅ Default tenant created');
  }

  // Create admin user + full permissions
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    create: {
      username: 'admin',
      email: 'admin@viveroalpha.dev',
      passwordHash: await bcrypt.hash('admin123', 12),
      firstName: 'Admin',
      lastName: 'User',
      tenantId,
      isActive: true,
    },
    update: {},
  });

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
      crud: { create: false, read: true, update: false, delete: false },
      scope: PermissionScope.ALL,
      type: PermissionType.READ_ONLY,
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
    {
      table: 'clients',
      crud: { create: true, read: true, update: true, delete: true },
      scope: PermissionScope.ALL,
    },
    {
      table: 'invoices',
      crud: { create: true, read: true, update: true, delete: true },
      scope: PermissionScope.ALL,
    },
    {
      table: 'plants',
      crud: { create: true, read: true, update: true, delete: true },
      scope: PermissionScope.ALL,
    },
    {
      table: 'purchase_orders',
      crud: { create: true, read: true, update: true, delete: true },
      scope: PermissionScope.ALL,
    },
    {
      table: 'user_permissions',
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
        permissionType: (perm as any).type ?? PermissionType.CRUD,
      },
      update: {
        canCreate: perm.crud.create,
        canRead: perm.crud.read,
        canUpdate: perm.crud.update,
        canDelete: perm.crud.delete,
        scope: perm.scope,
        permissionType: (perm as any).type ?? PermissionType.CRUD,
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
