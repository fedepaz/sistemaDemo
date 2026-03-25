// prisma/seed-admin.ts

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PermissionScope, PrismaClient } from '../src/generated/prisma/client';
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

  const existingEntities = await prisma.entity.findMany();

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
  const adminPermissions = existingEntities.map((e) => ({
    entityId: e.id,
    label: e.label,
    permissionType: e.permissionType,
  }));

  // Upsert permissions for the admin user
  for (const perm of adminPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_entityId: {
          userId: admin.id,
          entityId: perm.entityId,
        },
      },
      create: {
        userId: admin.id,
        entityId: perm.entityId,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        scope: PermissionScope.ALL,
        permissionType: perm.permissionType,
      },
      update: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        scope: PermissionScope.ALL,
        permissionType: perm.permissionType,
      },
    });
    console.log(
      `Granted permissions for ${perm.label} (${perm.permissionType})`,
    );
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
