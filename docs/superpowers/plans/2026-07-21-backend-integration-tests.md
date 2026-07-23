# Backend Integration Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add HTTP-level integration tests for all 5 backend modules (auth, users, entities, siembra, permissions) using supertest + NestJS TestingModule with mocked services and guards.

**Architecture:** Tests create a real NestJS app via `Test.createTestingModule()`, override global guards with pass-through mocks, override services with `jest.fn()` mocks, and send real HTTP requests via supertest. No database required.

**Tech Stack:** Jest 30, ts-jest, supertest, @nestjs/testing, @nestjs/common

## Global Constraints

- No real MariaDB — all database operations mocked
- Tests live in `apps/backend/test/integration/` (NOT in `src/modules/*/`)
- Must not break existing 85 unit tests
- Follow existing code conventions (TypeScript, `__tests__/` for unit, `test/integration/` for integration)
- Jest 30 with `ts-jest` for transform
- `pnpm test` runs unit tests only; `pnpm test:integration` runs integration tests

---

## File Structure

```
apps/backend/test/integration/
├── jest.config.ts
├── helpers/
│   ├── create-app.ts
│   ├── mock-guards.ts
│   └── mock-factories.ts
├── fixtures/
│   └── fixtures.ts
├── auth.integration.spec.ts
├── users.integration.spec.ts
├── entities.integration.spec.ts
├── siembra.integration.spec.ts
└── permissions.integration.spec.ts
```

---

### Task 1: Integration test infrastructure

**Files:**
- Create: `apps/backend/test/integration/jest.config.ts`
- Create: `apps/backend/test/integration/helpers/mock-guards.ts`
- Create: `apps/backend/test/integration/helpers/mock-factories.ts`
- Create: `apps/backend/test/integration/helpers/create-app.ts`
- Create: `apps/backend/test/integration/fixtures/fixtures.ts`
- Modify: `apps/backend/package.json` (add `test:integration` script)

**Interfaces:**
- Produces: `createTestApp(overrides?)` → `INestApplication`
- Produces: `MOCK_USER` constant → `AuthUser`
- Produces: `mockAuthUser()` → mock service object

- [ ] **Step 1: Create jest.config.ts for integration tests**

```ts
// apps/backend/test/integration/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.integration.spec.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^(\\.\\.?\\/.*)\\.js$': '$1',
  },
  coverageDirectory: '../../coverage/integration',
  collectCoverageFrom: [
    '../../src/modules/**/*.ts',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.interface.ts',
    '!**/generated/**',
  ],
};

export default config;
```

- [ ] **Step 2: Create mock-guards.ts**

These guards replace the global `GlobalAuthGuard` and `PermissionsGuard` in tests. They set a mock user on the request and always allow access.

```ts
// apps/backend/test/integration/helpers/mock-guards.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MOCK_USER } from './mock-factories';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = MOCK_USER;
    return true;
  }
}

@Injectable()
export class MockPermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}
```

- [ ] **Step 3: Create mock-factories.ts**

```ts
// apps/backend/test/integration/helpers/mock-factories.ts
import { AuthUser } from '../../../src/modules/auth/types/auth-user.type';

export const MOCK_USER: AuthUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  username: 'testuser',
  tenantId: '12345678-1234-1234-1234-123456789012',
};

export function createAuthMock() {
  return {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    changePassword: jest.fn(),
    validateUser: jest.fn(),
  };
}

export function createUsersMock() {
  return {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    softRemoveUserByUsername: jest.fn(),
    getUserByUsername: jest.fn(),
    getUserByTenantId: jest.fn(),
    recoverUserById: jest.fn(),
  };
}

export function createEntitiesMock() {
  return {
    getAllTables: jest.fn(),
    getTableByName: jest.fn(),
    createEntity: jest.fn(),
    softRemove: jest.fn(),
  };
}

export function createSiembraMock() {
  return {
    getAllSiembra: jest.fn(),
    asignarUbicacionSiembra: jest.fn(),
  };
}

export function createPermissionsMock() {
  return {
    getAllTables: jest.fn(),
    getTableByName: jest.fn(),
    getUserPermissionsByUserId: jest.fn(),
    getUserPermissionsByEntityId: jest.fn(),
    canPerform: jest.fn(),
    canAccessRecord: jest.fn(),
    grantPermission: jest.fn(),
    revokeTablePermissions: jest.fn(),
    setPermissionsForUser: jest.fn(),
  };
}
```

- [ ] **Step 4: Create create-app.ts**

```ts
// apps/backend/test/integration/helpers/create-app.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
import { MockAuthGuard, MockPermissionsGuard } from './mock-guards';
import {
  createAuthMock,
  createUsersMock,
  createEntitiesMock,
  createSiembraMock,
  createPermissionsMock,
} from './mock-factories';

export interface ServiceOverrides {
  auth?: ReturnType<typeof createAuthMock>;
  users?: ReturnType<typeof createUsersMock>;
  entities?: ReturnType<typeof createEntitiesMock>;
  siembra?: ReturnType<typeof createSiembraMock>;
  permissions?: ReturnType<typeof createPermissionsMock>;
}

export async function createTestApp(
  overrides?: ServiceOverrides,
): Promise<INestApplication> {
  const authMock = overrides?.auth ?? createAuthMock();
  const usersMock = overrides?.users ?? createUsersMock();
  const entitiesMock = overrides?.entities ?? createEntitiesMock();
  const siembraMock = overrides?.siembra ?? createSiembraMock();
  const permissionsMock = overrides?.permissions ?? createPermissionsMock();

  const module: TestingModule = await Test.createTestingModule({
    controllers: [
      AuthController,
      UsersController,
      EntitiesController,
      SiembraController,
      PermissionsController,
    ],
    providers: [
      { provide: AuthService, useValue: authMock },
      { provide: UsersService, useValue: usersMock },
      { provide: EntitiesService, useValue: entitiesMock },
      { provide: SiembraService, useValue: siembraMock },
      { provide: PermissionsService, useValue: permissionsMock },
    ],
  })
    .overrideGuard(MockAuthGuard)
    .useClass(MockAuthGuard)
    .overrideGuard(MockPermissionsGuard)
    .useClass(MockPermissionsGuard)
    .compile();

  const app = module.createNestApplication();
  await app.init();
  return app;
}
```

**Note:** Controllers use `ZodValidationPipe` decorators on their `@Body()` parameters, so validation runs automatically per-endpoint. No global pipe needed.

- [ ] **Step 5: Fix create-app.ts — use APP_GUARD providers**

Replace the `.overrideGuard()` chain with provider overrides:

```ts
// apps/backend/test/integration/helpers/create-app.ts
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
import { MockAuthGuard, MockPermissionsGuard } from './mock-guards';
import {
  createAuthMock,
  createUsersMock,
  createEntitiesMock,
  createSiembraMock,
  createPermissionsMock,
} from './mock-factories';

export interface ServiceOverrides {
  auth?: ReturnType<typeof createAuthMock>;
  users?: ReturnType<typeof createUsersMock>;
  entities?: ReturnType<typeof createEntitiesMock>;
  siembra?: ReturnType<typeof createSiembraMock>;
  permissions?: ReturnType<typeof createPermissionsMock>;
}

export async function createTestApp(
  overrides?: ServiceOverrides,
): Promise<INestApplication> {
  const authMock = overrides?.auth ?? createAuthMock();
  const usersMock = overrides?.users ?? createUsersMock();
  const entitiesMock = overrides?.entities ?? createEntitiesMock();
  const siembraMock = overrides?.siembra ?? createSiembraMock();
  const permissionsMock = overrides?.permissions ?? createPermissionsMock();

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
    ],
  }).compile();

  const app = module.createNestApplication();
  await app.init();
  return app;
}
```

- [ ] **Step 6: Create fixtures.ts**

```ts
// apps/backend/test/integration/fixtures/fixtures.ts
export const validLoginPayload = () => ({
  username: 'testuser',
  password: 'Pass1234',
});

export const validRegisterPayload = () => ({
  username: 'newuser',
  firstName: 'New',
  lastName: 'User',
  email: 'new@example.com',
});

export const validChangePasswordPayload = () => ({
  currentPassword: 'OldPass1',
  newPassword: 'NewPass1',
});

export const validRefreshPayload = () => ({
  refreshToken: 'valid-refresh-token',
});

export const validEntityPayload = () => ({
  name: 'test-entity',
  description: 'Test entity',
});

export const validSiembraPayload = () => ({
  fecha: '2026-01-15',
  camara: 'C1',
  especie: 'Tomate',
  cantidad: 100,
});

export const mockAuthResponse = () => ({
  user: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    tenantId: '12345678-1234-1234-1234-123456789012',
  },
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  isDefaultPassword: false,
});

export const mockTokens = () => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
});

export const mockUser = () => ({
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  tenantId: '12345678-1234-1234-1234-123456789012',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

export const mockEntity = () => ({
  id: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'users',
  description: 'Users entity',
  permissionType: 'READ_ONLY',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

export const mockSiembra = () => ({
  id: 's1b2c3d4-e5f6-7890-abcd-ef1234567890',
  fecha: '2026-01-15',
  camara: 'C1',
  especie: 'Tomate',
  cantidad: 100,
  ubicacion: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});
```

- [ ] **Step 7: Add test:integration script to package.json**

Read `apps/backend/package.json` and add:
```json
"test:integration": "jest --config test/integration/jest.config.ts"
```

- [ ] **Step 8: Verify infrastructure compiles**

Run: `cd apps/backend && npx tsc --noEmit --project tsconfig.json`
Expected: No errors (or only pre-existing errors)

- [ ] **Step 9: Commit**

```bash
git add apps/backend/test/integration/
git commit -m "test(backend): add integration test infrastructure with mocked guards and services"
```

---

### Task 2: Auth integration tests

**Files:**
- Create: `apps/backend/test/integration/auth.integration.spec.ts`

**Interfaces:**
- Consumes: `createTestApp(overrides?)`, `MOCK_USER`, mock factories, fixtures

- [ ] **Step 1: Write auth.integration.spec.ts**

```ts
// apps/backend/test/integration/auth.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createAuthMock } from './helpers/mock-factories';
import {
  validLoginPayload,
  validRegisterPayload,
  validChangePasswordPayload,
  validRefreshPayload,
  mockAuthResponse,
  mockTokens,
} from './fixtures/fixtures';

describe('Auth (integration)', () => {
  let app: INestApplication;
  let authMock: ReturnType<typeof createAuthMock>;

  beforeAll(async () => {
    authMock = createAuthMock();
    app = await createTestApp({ auth: authMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('returns 200 + tokens on valid credentials', async () => {
      authMock.login.mockResolvedValue(mockAuthResponse());

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(validLoginPayload())
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username');
      expect(authMock.login).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'testuser' }),
      );
    });

    it('returns 401 on invalid credentials', async () => {
      authMock.login.mockRejectedValue(
        new (require('@nestjs/common').UnauthorizedException)(
          'Credenciales inválidas',
        ),
      );

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(validLoginPayload())
        .expect(401);
    });

    it('returns 400 on invalid body (missing password)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'testuser' })
        .expect(400);
    });

    it('returns 400 on invalid body (empty username)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: '', password: 'Pass1234' })
        .expect(400);
    });
  });

  describe('POST /auth/register', () => {
    it('returns 201 + auth response on valid payload', async () => {
      authMock.register.mockResolvedValue(mockAuthResponse());

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterPayload())
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(authMock.register).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'newuser' }),
      );
    });

    it('returns 409 on duplicate username', async () => {
      authMock.register.mockRejectedValue(
        new (require('@nestjs/common').ConflictException)(
          'El nombre de usuario ya existe',
        ),
      );

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterPayload())
        .expect(409);
    });

    it('returns 400 on invalid body (missing username)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ firstName: 'Test' })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('returns 200 + new tokens on valid refresh token', async () => {
      authMock.refreshTokens.mockResolvedValue(mockTokens());

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(validRefreshPayload())
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(authMock.refreshTokens).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
    });

    it('returns 401 on invalid refresh token', async () => {
      authMock.refreshTokens.mockRejectedValue(
        new (require('@nestjs/common').UnauthorizedException)('Token inválido'),
      );

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('returns 400 on missing refreshToken', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('PATCH /auth/password', () => {
    it('returns 200 on valid password change', async () => {
      authMock.changePassword.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .patch('/auth/password')
        .send(validChangePasswordPayload())
        .expect(200);

      expect(authMock.changePassword).toHaveBeenCalledWith(
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        expect.objectContaining({ currentPassword: 'OldPass1' }),
      );
    });

    it('returns 401 when wrong current password', async () => {
      authMock.changePassword.mockRejectedValue(
        new (require('@nestjs/common').UnauthorizedException)(
          'Contraseña actual incorrecta',
        ),
      );

      await request(app.getHttpServer())
        .patch('/auth/password')
        .send({
          currentPassword: 'WrongPass',
          newPassword: 'NewPass1',
        })
        .expect(401);
    });

    it('returns 400 on weak new password', async () => {
      await request(app.getHttpServer())
        .patch('/auth/password')
        .send({
          currentPassword: 'OldPass1',
          newPassword: 'weak',
        })
        .expect(400);
    });

    it('returns 400 on missing fields', async () => {
      await request(app.getHttpServer())
        .patch('/auth/password')
        .send({ currentPassword: 'OldPass1' })
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 200 with success message', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});
```

- [ ] **Step 2: Run auth integration tests**

Run: `cd apps/backend && npx jest --config test/integration/jest.config.ts auth.integration`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/backend/test/integration/auth.integration.spec.ts
git commit -m "test(backend): add auth module integration tests"
```

---

### Task 3: Users integration tests

**Files:**
- Create: `apps/backend/test/integration/users.integration.spec.ts`

**Interfaces:**
- Consumes: `createTestApp(overrides?)`, `MOCK_USER`, mock factories, fixtures

- [ ] **Step 1: Write users.integration.spec.ts**

```ts
// apps/backend/test/integration/users.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createUsersMock } from './helpers/mock-factories';
import { mockUser } from './fixtures/fixtures';

describe('Users (integration)', () => {
  let app: INestApplication;
  let usersMock: ReturnType<typeof createUsersMock>;

  beforeAll(async () => {
    usersMock = createUsersMock();
    app = await createTestApp({ users: usersMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/me', () => {
    it('returns 200 + current user profile', async () => {
      usersMock.getProfile.mockResolvedValue(mockUser());

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
      expect(usersMock.getProfile).toHaveBeenCalled();
    });
  });

  describe('GET /users/all', () => {
    it('returns 200 + list of users', async () => {
      usersMock.getAllUsers.mockResolvedValue([mockUser()]);

      const response = await request(app.getHttpServer())
        .get('/users/all')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(usersMock.getAllUsers).toHaveBeenCalled();
    });

    it('returns 200 + empty array when no users', async () => {
      usersMock.getAllUsers.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/users/all')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /users/username/:username', () => {
    it('returns 200 + user by username', async () => {
      usersMock.getUserByUsername.mockResolvedValue(mockUser());

      const response = await request(app.getHttpServer())
        .get('/users/username/testuser')
        .expect(200);

      expect(response.body).toHaveProperty('username', 'testuser');
      expect(usersMock.getUserByUsername).toHaveBeenCalledWith('testuser');
    });

    it('returns 404 when user not found', async () => {
      const { NotFoundException } = require('@nestjs/common');
      usersMock.getUserByUsername.mockRejectedValue(
        new NotFoundException('Usuario no encontrado'),
      );

      await request(app.getHttpServer())
        .get('/users/username/nonexistent')
        .expect(404);
    });
  });

  describe('PATCH /users/:username', () => {
    it('returns 200 + updated user', async () => {
      const updatedUser = { ...mockUser(), firstName: 'Updated' };
      usersMock.updateProfile.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .patch('/users/testuser')
        .send({ firstName: 'Updated' })
        .expect(200);

      expect(response.body).toHaveProperty('firstName', 'Updated');
      expect(usersMock.updateProfile).toHaveBeenCalledWith(
        'testuser',
        expect.objectContaining({ firstName: 'Updated' }),
      );
    });
  });

  describe('DELETE /users/:username', () => {
    it('returns 200 on successful soft delete', async () => {
      usersMock.softRemoveUserByUsername.mockResolvedValue({ success: true });

      await request(app.getHttpServer())
        .delete('/users/testuser')
        .expect(200);

      expect(usersMock.softRemoveUserByUsername).toHaveBeenCalledWith(
        'testuser',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      );
    });
  });
});
```

- [ ] **Step 2: Run users integration tests**

Run: `cd apps/backend && npx jest --config test/integration/jest.config.ts users.integration`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/backend/test/integration/users.integration.spec.ts
git commit -m "test(backend): add users module integration tests"
```

---

### Task 4: Entities integration tests

**Files:**
- Create: `apps/backend/test/integration/entities.integration.spec.ts`

**Interfaces:**
- Consumes: `createTestApp(overrides?)`, `MOCK_USER`, mock factories, fixtures

- [ ] **Step 1: Write entities.integration.spec.ts**

```ts
// apps/backend/test/integration/entities.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createEntitiesMock } from './helpers/mock-factories';
import { mockEntity } from './fixtures/fixtures';

describe('Entities (integration)', () => {
  let app: INestApplication;
  let entitiesMock: ReturnType<typeof createEntitiesMock>;

  beforeAll(async () => {
    entitiesMock = createEntitiesMock();
    app = await createTestApp({ entities: entitiesMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /entities/tables', () => {
    it('returns 200 + list of entity tables', async () => {
      entitiesMock.getAllTables.mockResolvedValue([mockEntity()]);

      const response = await request(app.getHttpServer())
        .get('/entities/tables')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('name');
      expect(entitiesMock.getAllTables).toHaveBeenCalled();
    });
  });

  describe('POST /entities/entity', () => {
    it('returns 201 + created entity', async () => {
      entitiesMock.createEntity.mockResolvedValue(mockEntity());

      const response = await request(app.getHttpServer())
        .post('/entities/entity')
        .send({ name: 'new-entity', description: 'New entity' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(entitiesMock.createEntity).toHaveBeenCalled();
    });

    it('returns 400 on invalid payload', async () => {
      await request(app.getHttpServer())
        .post('/entities/entity')
        .send({})
        .expect(400);
    });
  });

  describe('GET /entities/table/:tableName', () => {
    it('returns 200 + entity by table name', async () => {
      entitiesMock.getTableByName.mockResolvedValue(mockEntity());

      const response = await request(app.getHttpServer())
        .get('/entities/table/users')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'users');
      expect(entitiesMock.getTableByName).toHaveBeenCalledWith('users');
    });

    it('returns 404 when entity not found', async () => {
      const { NotFoundException } = require('@nestjs/common');
      entitiesMock.getTableByName.mockRejectedValue(
        new NotFoundException('Entidad no encontrada'),
      );

      await request(app.getHttpServer())
        .get('/entities/table/nonexistent')
        .expect(404);
    });
  });

  describe('DELETE /entities/:id', () => {
    it('returns 200 on successful soft delete', async () => {
      entitiesMock.softRemove.mockResolvedValue({ success: true });

      await request(app.getHttpServer())
        .delete('/entities/e1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .expect(200);

      expect(entitiesMock.softRemove).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run entities integration tests**

Run: `cd apps/backend && npx jest --config test/integration/jest.config.ts entities.integration`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/backend/test/integration/entities.integration.spec.ts
git commit -m "test(backend): add entities module integration tests"
```

---

### Task 5: Siembra integration tests

**Files:**
- Create: `apps/backend/test/integration/siembra.integration.spec.ts`

**Interfaces:**
- Consumes: `createTestApp(overrides?)`, `MOCK_USER`, mock factories, fixtures

- [ ] **Step 1: Write siembra.integration.spec.ts**

```ts
// apps/backend/test/integration/siembra.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createSiembraMock } from './helpers/mock-factories';
import { mockSiembra, validSiembraPayload } from './fixtures/fixtures';

describe('Siembra (integration)', () => {
  let app: INestApplication;
  let siembraMock: ReturnType<typeof createSiembraMock>;

  beforeAll(async () => {
    siembraMock = createSiembraMock();
    app = await createTestApp({ siembra: siembraMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /l-siembra', () => {
    it('returns 200 + list of siembras', async () => {
      siembraMock.getAllSiembra.mockResolvedValue([mockSiembra()]);

      const response = await request(app.getHttpServer())
        .get('/l-siembra')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('fecha');
      expect(siembraMock.getAllSiembra).toHaveBeenCalled();
    });

    it('returns 200 + empty array when no siembras', async () => {
      siembraMock.getAllSiembra.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/l-siembra')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /l-siembra/asignar-ubicacion-siembra', () => {
    it('returns 201 on successful assignment', async () => {
      siembraMock.asignarUbicacionSiembra.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/l-siembra/asignar-ubicacion-siembra')
        .send(validSiembraPayload())
        .expect(201);

      expect(siembraMock.asignarUbicacionSiembra).toHaveBeenCalledWith(
        expect.objectContaining({ fecha: '2026-01-15' }),
      );
    });
  });
});
```

- [ ] **Step 2: Run siembra integration tests**

Run: `cd apps/backend && npx jest --config test/integration/jest.config.ts siembra.integration`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/backend/test/integration/siembra.integration.spec.ts
git commit -m "test(backend): add siembra module integration tests"
```

---

### Task 6: Permissions integration tests

**Files:**
- Create: `apps/backend/test/integration/permissions.integration.spec.ts`

**Interfaces:**
- Consumes: `createTestApp(overrides?)`, `MOCK_USER`, mock factories

- [ ] **Step 1: Write permissions.integration.spec.ts**

```ts
// apps/backend/test/integration/permissions.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createPermissionsMock } from './helpers/mock-factories';

describe('Permissions (integration)', () => {
  let app: INestApplication;
  let permissionsMock: ReturnType<typeof createPermissionsMock>;

  beforeAll(async () => {
    permissionsMock = createPermissionsMock();
    app = await createTestApp({ permissions: permissionsMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /permissions/me', () => {
    it('returns 200 + user permissions', async () => {
      permissionsMock.getUserPermissionsByUserId.mockResolvedValue({
        userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        permissions: [
          {
            entityId: 'e1',
            tableName: 'users',
            canRead: true,
            canCreate: true,
            canUpdate: false,
            canDelete: false,
            scope: 'ALL',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/permissions/me')
        .expect(200);

      expect(response.body).toHaveProperty('permissions');
      expect(Array.isArray(response.body.permissions)).toBe(true);
      expect(permissionsMock.getUserPermissionsByUserId).toHaveBeenCalled();
    });
  });

  describe('GET /permissions/tables', () => {
    it('returns 200 + list of permission tables', async () => {
      permissionsMock.getAllTables.mockResolvedValue([
        { id: 'e1', name: 'users', description: 'Users entity' },
      ]);

      const response = await request(app.getHttpServer())
        .get('/permissions/tables')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(permissionsMock.getAllTables).toHaveBeenCalled();
    });
  });

  describe('GET /permissions/user/:userId', () => {
    it('returns 200 + permissions for specific user', async () => {
      permissionsMock.getUserPermissionsByUserId.mockResolvedValue({
        userId: 'target-user-id',
        permissions: [],
      });

      const response = await request(app.getHttpServer())
        .get('/permissions/user/target-user-id')
        .expect(200);

      expect(response.body).toHaveProperty('userId', 'target-user-id');
      expect(permissionsMock.getUserPermissionsByUserId).toHaveBeenCalledWith(
        'target-user-id',
      );
    });
  });

  describe('GET /permissions/table/:tableName', () => {
    it('returns 200 + table permissions', async () => {
      permissionsMock.getTableByName.mockResolvedValue({
        id: 'e1',
        name: 'users',
        description: 'Users entity',
      });

      const response = await request(app.getHttpServer())
        .get('/permissions/table/users')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'users');
      expect(permissionsMock.getTableByName).toHaveBeenCalledWith('users');
    });
  });

  describe('PATCH /permissions/user/:userId', () => {
    it('returns 200 on successful permission update', async () => {
      permissionsMock.setPermissionsForUser.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .patch('/permissions/user/target-user-id')
        .send({
          permissions: [
            {
              entityId: 'e1',
              canRead: true,
              canCreate: false,
              canUpdate: false,
              canDelete: false,
              scope: 'OWN',
            },
          ],
        })
        .expect(200);

      expect(permissionsMock.setPermissionsForUser).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run permissions integration tests**

Run: `cd apps/backend && npx jest --config test/integration/jest.config.ts permissions.integration`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/backend/test/integration/permissions.integration.spec.ts
git commit -m "test(backend): add permissions module integration tests"
```

---

### Task 7: Final verification and cleanup

**Files:**
- Modify: `apps/backend/test/jest-e2e.json` (delete empty placeholder if still empty)
- Verify: all test:integration passes
- Verify: all unit tests still pass

- [ ] **Step 1: Run all integration tests**

Run: `cd apps/backend && pnpm test:integration`
Expected: All integration tests pass (~30-40 tests)

- [ ] **Step 2: Run all unit tests**

Run: `cd apps/backend && pnpm test`
Expected: All 85 unit tests still pass

- [ ] **Step 3: Clean up empty e2e placeholder**

Check if `apps/backend/test/app.e2e-spec.ts` exists and is empty. If so, delete it.

- [ ] **Step 4: Update test scripts if needed**

Verify `apps/backend/package.json` has:
```json
"test": "jest",
"test:integration": "jest --config test/integration/jest.config.ts"
```

- [ ] **Step 5: Final commit (if cleanup needed)**

```bash
git add -A
git commit -m "test(backend): clean up e2e placeholder and verify integration tests"
```
