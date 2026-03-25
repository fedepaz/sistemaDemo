// prisma/seed-users.ts

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PermissionScope, PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

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
  const tenant = await prisma.tenant.findFirst({
    where: { name: 'Default Organization' },
  });
  if (!tenant) throw new Error('Default tenant not found');

  for (let i = 1; i <= 10; i++) {
    const suffix = i.toString().padStart(2, '0'); // e.g., '01', '02'
    const passwordHash = await bcrypt.hash(`123${suffix}`, 12);

    const user = await prisma.user.upsert({
      where: { username: `usuario${suffix}` },
      create: {
        username: `usuario${suffix}`,
        email: `usuario${suffix}@viveroalpha.dev`,
        passwordHash,
        firstName: 'Usuario',
        lastName: `Apellido${suffix}`,
        tenantId: tenant.id,
        isActive: true,
      },
      update: {},
    });

    const userEntity = await prisma.entity.findFirst({
      where: { name: 'users' },
    });
    if (!userEntity) throw new Error('User entity not found');

    await prisma.userPermission.upsert({
      where: { userId_entityId: { userId: user.id, entityId: userEntity.id } }, // ← fix
      create: {
        userId: user.id,
        entityId: userEntity.id,
        canRead: true,
        scope: PermissionScope.ALL,
        permissionType: userEntity.permissionType,
      },
      update: {
        canRead: true,
        scope: PermissionScope.ALL,
        permissionType: userEntity.permissionType,
      },
    });

    console.log(`✅ Created user:`, user);
  }
}

main()
  .catch((e) => {
    console.error(`Error: ${e}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
