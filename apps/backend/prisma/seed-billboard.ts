// prisma/seed-billboard.ts
// Usage: pnpm ts-node prisma/seed-billboard.ts

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

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

const messageBody =
  'A partir de ahora esta es la forma que se informarán nuevas actualizaciones del sistema, cuando se publiquen nuevos cambios, el usuario puede presionar el botón de "Marcar como leído", o puede salir del modal para leer la notificación en el próximo inicio de sesión. PS: Tenga en cuenta que hasta que no se marque como leído, seguirá apareciendo en la lista de notificaciones.';

async function main() {
  const message = await prisma.billboardMessage.create({
    data: {
      title: 'Actualizaciones del sistema',
      body: messageBody,
      tag: 'all-users',
      permissionTable: 'user_profile',
      permissionAction: 'read',
      permissionScope: 'OWN',
      targetNewUsers: true,
    },
  });

  console.log('Created billboard message:', message.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
