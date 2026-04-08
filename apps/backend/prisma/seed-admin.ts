// prisma/seed-admin.ts

import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import {
  PermissionScope,
  PermissionType,
  PrismaClient,
} from '../src/generated/prisma/client';

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

  let userProfileEntityId: string;

  const existingUserProfileEntity = await prisma.entity.findFirst({
    where: { name: 'user_profile' },
  });

  if (existingUserProfileEntity) {
    userProfileEntityId = existingUserProfileEntity.id;
    console.log('✅ User profile entity found');
  } else {
    const newUserProfileEntity = await prisma.entity.create({
      data: {
        name: 'user_profile',
        label: 'Perfil de usuario',
        permissionType: PermissionType.READ_ONLY,
      },
    });
    userProfileEntityId = newUserProfileEntity.id;
    console.log('✅ User profile entity created');
  }

  let userPermissionEntityId: string;

  const existingUserPermissionEntity = await prisma.entity.findFirst({
    where: { name: 'user_permissions' },
  });

  if (existingUserPermissionEntity) {
    userPermissionEntityId = existingUserPermissionEntity.id;
    console.log('✅ User permission entity found');
  } else {
    const newUserPermissionEntity = await prisma.entity.create({
      data: {
        name: 'user_permissions',
        label: 'Permisos de usuario',
        permissionType: PermissionType.CRUD,
      },
    });
    userPermissionEntityId = newUserPermissionEntity.id;
    console.log('✅ User permission entity created');
  }

  let usersEntityId: string;

  const existingUsersEntity = await prisma.entity.findFirst({
    where: { name: 'users' },
  });

  if (existingUsersEntity) {
    usersEntityId = existingUsersEntity.id;
    console.log('✅ Users entity found');
  } else {
    const newUsersEntity = await prisma.entity.create({
      data: {
        name: 'users',
        label: 'Usuarios',
        permissionType: PermissionType.CRUD,
      },
    });
    usersEntityId = newUsersEntity.id;
    console.log('✅ Users entity created');
  }

  let entitiesId: string;

  const existingEntitiesEntity = await prisma.entity.findFirst({
    where: { name: 'entities' },
  });

  if (existingEntitiesEntity) {
    entitiesId = existingEntitiesEntity.id;
    console.log('✅ Entities entity found');
  } else {
    const newEntitiesEntity = await prisma.entity.create({
      data: {
        name: 'entities',
        label: 'Entidades',
        permissionType: PermissionType.CRUD,
      },
    });
    entitiesId = newEntitiesEntity.id;
    console.log('✅ Entities entity created');
  }

  let auditLogsId: string;

  const existingAuditLogsEntity = await prisma.entity.findFirst({
    where: { name: 'audit_logs' },
  });

  if (existingAuditLogsEntity) {
    auditLogsId = existingAuditLogsEntity.id;
    console.log('✅ Audit logs entity found');
  } else {
    const newAuditLogsEntity = await prisma.entity.create({
      data: {
        name: 'audit_logs',
        label: 'Auditoría',
        permissionType: PermissionType.READ_ONLY,
      },
    });
    auditLogsId = newAuditLogsEntity.id;
    console.log('✅ Audit logs entity created');
  }

  let devAccountId: string;

  const existingDevAccountEntity = await prisma.entity.findFirst({
    where: { name: 'dev_account' },
  });

  if (existingDevAccountEntity) {
    devAccountId = existingDevAccountEntity.id;
    console.log('✅ Dev account entity found');
  } else {
    const newDevAccountEntity = await prisma.entity.create({
      data: {
        name: 'dev_account',
        label: 'Cuenta de desarrollador',
        permissionType: PermissionType.CRUD,
      },
    });
    devAccountId = newDevAccountEntity.id;
    console.log('✅ Dev account entity created');
  }

  const permissionsArray = [
    { id: userProfileEntityId, type: PermissionType.READ_ONLY },
    { id: userPermissionEntityId, type: PermissionType.CRUD },
    { id: usersEntityId, type: PermissionType.CRUD },
    { id: entitiesId, type: PermissionType.CRUD },
    { id: auditLogsId, type: PermissionType.READ_ONLY },
    { id: devAccountId, type: PermissionType.CRUD },
  ];

  // Create admin user + full permissions
  const adminMartin = await prisma.user.upsert({
    where: { username: 'adminMartin' },
    create: {
      username: 'adminMartin',
      email: 'adminMartin@viveroalpha.dev',
      passwordHash: await bcrypt.hash('admin123', 12),
      firstName: 'Admin',
      lastName: 'Martin',
      tenantId,
      isActive: true,
    },
    update: {},
  });

  const adminFede = await prisma.user.upsert({
    where: { username: 'adminFede' },
    create: {
      username: 'adminFede',
      email: 'adminFede@viveroalpha.dev',
      passwordHash: await bcrypt.hash('admin123', 12),
      firstName: 'Admin',
      lastName: 'Fede',
      tenantId,
      isActive: true,
    },
    update: {},
  });

  for (const permission of permissionsArray) {
    for (const user of [adminMartin, adminFede]) {
      // Add id to dev account table
      await prisma.devAccount.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
        },
        update: {},
      });
      // Upsert permission for the admin user
      await prisma.userPermission.upsert({
        where: {
          userId_entityId: {
            userId: user.id,
            entityId: permission.id,
          },
        },
        create: {
          userId: user.id,
          entityId: permission.id,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          scope: PermissionScope.ALL,
          permissionType: permission.type,
        },
        update: {
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          scope: PermissionScope.ALL,
          permissionType: permission.type,
        },
      });
      console.log(`Permission ${permission.id} granted to ${user.username}`);
    }
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
