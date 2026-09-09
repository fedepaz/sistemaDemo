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

const messages = [
  {
    title: 'Actualizaciones del sistema',
    body: 'A partir de ahora esta es la forma en que se informarán las actualizaciones del sistema. Cuando se publiquen nuevos cambios, verás una ventana emergente al iniciar sesión. Podés presionar "Entendido" para marcar todo como leído, o cerrar el modal para leerlo en el próximo inicio de sesión. Los mensajes no leídos seguirán apareciendo hasta que los marques como leídos.',
    tag: 'actualizaciones-sistema',
    permissionTable: 'user_profile',
    permissionAction: 'read',
    permissionScope: 'OWN',
    targetNewUsers: true,
  },
  {
    title: 'Alertas resueltas',
    body: 'Las alertas del sistema se acceden desde el ícono de campana en el encabezado. Al hacer clic en una alerta, se abre un panel con los detalles. Para alertas de tipo "Faltante Plantas" verás el botón "Marcar alerta como resuelta". Al confirmar, la alerta se elimina de la lista para todos los usuarios. Esta acción no se puede deshacer.',
    tag: 'alertas-resueltas',
    permissionTable: 'alerts',
    permissionAction: 'read',
    permissionScope: 'ALL',
    targetNewUsers: true,
  },
  {
    title: 'Nuevo registro de usuarios',
    body: 'El registro de usuarios ahora es público. Cualquier persona puede crear una cuenta desde la pantalla de login presionando "Registrar cuenta". Debe completar usuario, nombre y apellido. Tras registrarse, la cuenta queda pendiente de activación por un administrador, quien también asignará los permisos necesarios. Hasta que la cuenta sea activada, no será posible iniciar sesión.',
    tag: 'registro-usuarios',
    permissionTable: 'user_profile',
    permissionAction: 'read',
    permissionScope: 'OWN',
    targetNewUsers: true,
  },
  {
    title: 'Búsqueda en tablas',
    body: 'Las tablas de datos ahora incluyen una barra de búsqueda en la parte superior. Podés escribir en el campo de búsqueda para filtrar en tiempo real las filas que coincidan con el texto ingresado. Se muestra la cantidad de resultados encontrados sobre el total. Para limpiar la búsqueda, hacé clic en el ícono de "X" que aparece a la derecha del campo.',
    tag: 'busqueda-tablas',
    permissionTable: 'user_profile',
    permissionAction: 'read',
    permissionScope: 'OWN',
    targetNewUsers: true,
  },
];

async function main() {
  let created = 0;
  for (const msg of messages) {
    const existing = await prisma.billboardMessage.findFirst({
      where: { title: msg.title, tag: msg.tag },
    });
    if (!existing) {
      await prisma.billboardMessage.create({ data: msg });
      created++;
    }
  }
  console.log(
    `Created ${created} new billboard messages (${messages.length - created} already existed)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
