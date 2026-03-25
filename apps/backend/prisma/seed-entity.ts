// prisma/seed-entity.ts

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PermissionType, PrismaClient } from '../src/generated/prisma/client';

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

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Create or update the entities
  const entities = [
    {
      name: 'users',
      label: 'Usuarios',
      permissionType: PermissionType.PROCESS,
    },
    {
      name: 'user_permissions',
      label: 'Permisos',
      permissionType: PermissionType.CRUD,
    },
    {
      name: 'extendidos',
      label: 'Extendidos',
      permissionType: PermissionType.CRUD,
    },
    {
      name: 'agentes',
      label: 'Agentes de Venta',
      permissionType: PermissionType.READ_ONLY,
    },
    {
      name: 'tenants',
      label: 'Tenants',
      permissionType: PermissionType.PROCESS,
    },
  ];

  for (const entity of entities) {
    await prisma.entity.upsert({
      where: { name: entity.name },
      create: {
        name: entity.name,
        label: entity.label,
        permissionType: entity.permissionType,
      },
      update: {},
    });
  }

  console.log('✅ Entities created');
}

main()
  .catch((e) => {
    console.error(`Error: ${e}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
