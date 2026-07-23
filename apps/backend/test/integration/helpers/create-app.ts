import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from '../../../src/modules/auth/auth.controller';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UsersController } from '../../../src/modules/users/users.controller';
import { UsersService } from '../../../src/modules/users/users.service';
import { EntitiesController } from '../../../src/modules/entities/entities.controller';
import { EntitiesService } from '../../../src/modules/entities/entities.service';
import { SiembraController } from '../../../src/modules/legacy/siembra/siembra.controller';
import { SiembraService } from '../../../src/modules/legacy/siembra/siembra.service';
import { PermissionsController } from '../../../src/modules/permissions/permissions.controller';
import { PermissionsService } from '../../../src/modules/permissions/permissions.service';
import { TenantsService } from '../../../src/modules/tenants/tenants.service';
import { MockAuthGuard, MockPermissionsGuard } from './mock-guards';
import {
  createAuthMock,
  createUsersMock,
  createEntitiesMock,
  createSiembraMock,
  createPermissionsMock,
  createTenantsMock,
} from './mock-factories';

export interface ServiceOverrides {
  auth?: ReturnType<typeof createAuthMock>;
  users?: ReturnType<typeof createUsersMock>;
  entities?: ReturnType<typeof createEntitiesMock>;
  siembra?: ReturnType<typeof createSiembraMock>;
  permissions?: ReturnType<typeof createPermissionsMock>;
  tenants?: ReturnType<typeof createTenantsMock>;
}

export async function createTestApp(
  overrides?: ServiceOverrides,
): Promise<INestApplication> {
  const authMock = overrides?.auth ?? createAuthMock();
  const usersMock = overrides?.users ?? createUsersMock();
  const entitiesMock = overrides?.entities ?? createEntitiesMock();
  const siembraMock = overrides?.siembra ?? createSiembraMock();
  const permissionsMock = overrides?.permissions ?? createPermissionsMock();
  const tenantsMock = overrides?.tenants ?? createTenantsMock();

  const module: TestingModule = await Test.createTestingModule({
    controllers: [
      AuthController,
      UsersController,
      EntitiesController,
      SiembraController,
      PermissionsController,
    ],
    providers: [
      { provide: APP_GUARD, useClass: MockAuthGuard },
      { provide: APP_GUARD, useClass: MockPermissionsGuard },
      { provide: AuthService, useValue: authMock },
      { provide: UsersService, useValue: usersMock },
      { provide: EntitiesService, useValue: entitiesMock },
      { provide: SiembraService, useValue: siembraMock },
      { provide: PermissionsService, useValue: permissionsMock },
      { provide: TenantsService, useValue: tenantsMock },
    ],
  }).compile();

  const app = module.createNestApplication();
  await app.init();
  return app;
}
