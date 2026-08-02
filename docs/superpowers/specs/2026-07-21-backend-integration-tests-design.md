# Backend Integration Tests Design

**Date:** 2026-07-21
**Project:** sistemaDemo (AgriManage)
**Status:** Approved

---

## Goal

Add HTTP-level integration tests for all 5 backend modules (auth, users, entities, siembra, permissions) using supertest + NestJS TestingModule with mocked database layer. Tests exercise the full HTTP stack: request parsing, Zod validation pipes, auth guards, controller routing, and response formatting.

---

## Constraints

- No real MariaDB — all database operations mocked
- Follow existing unit test patterns (Jest 30, `__tests__/` convention)
- Tests live in `apps/backend/test/integration/` (separate from unit tests in `src/modules/*/`)
- Must not break existing 85 unit tests

---

## Architecture

### Approach: Full HTTP e2e with supertest

Tests create a real NestJS application instance via `Test.createTestingModule()`, register mocked service providers, and send actual HTTP requests via `supertest`. This validates:

- Request body parsing and Zod validation
- Auth guard behavior (public vs protected endpoints)
- Controller routing and HTTP method matching
- Response status codes and body shapes
- Error handling (400, 401, 404, 409)

### What is mocked

All service and repository layers are replaced with `jest.fn()` mocks. This means:
- No database connection required
- Tests are fast (~2-3s total)
- Tests verify HTTP contract, not business logic correctness

### What is NOT mocked

- NestJS pipes (ZodValidationPipe runs for real)
- NestJS guards (JwtAuthGuard runs for real, but JWT is mocked to return a fixed user)
- Controller methods (real code)
- Logger (real, but silent in tests)

---

## File Structure

```
apps/backend/test/integration/
├── jest.config.ts              # Jest config for integration tests
├── helpers/
│   ├── create-app.ts           # createTestApp() — builds TestingModule
│   ├── mock-factories.ts       # Mock factories per module
│   └── auth-helpers.ts         # registerAndLogin(), getAuthToken()
├── fixtures/
│   ├── user.fixture.ts         # Fake user payloads
│   ├── entity.fixture.ts       # Fake entity payloads
│   └── siembra.fixture.ts      # Fake siembra payloads
├── auth.integration.spec.ts
├── users.integration.spec.ts
├── entities.integration.spec.ts
├── siembra.integration.spec.ts
└── permissions.integration.spec.ts
```

---

## Key Components

### 1. createTestApp() factory (`helpers/create-app.ts`)

Builds a NestJS `TestingModule` with all real controllers but mocked providers:

```ts
export interface ServiceOverrides {
  auth?: Partial<AuthService>;
  users?: Partial<UsersService>;
  entities?: Partial<EntitiesService>;
  siembra?: Partial<SiembraService>;
  permissions?: Partial<PermissionsService>;
}

export async function createTestApp(overrides?: ServiceOverrides) {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(AuthService)
    .useValue(overrides?.auth ?? createAuthMock())
    .overrideProvider(UsersService)
    .useValue(overrides?.users ?? createUsersMock())
    // ... other providers
    .compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ZodValidationPipe());
  await app.init();
  return app;
}
```

### 2. Mock factories (`helpers/mock-factories.ts`)

Each factory returns a jest.fn()-based mock of the service with all methods mocked:

```ts
export function createAuthMock() {
  return {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    changePassword: jest.fn(),
  };
}
```

### 3. Auth helpers (`helpers/auth-helpers.ts`)

```ts
export async function getAuthToken(app: INestApplication): Promise<string> {
  // Mock JwtService.verify() to return a fixed user payload
  // Call any authenticated endpoint and extract the token from the mock
}
```

### 4. Fixtures (`fixtures/*.fixture.ts`)

Factory functions that return valid payloads:

```ts
export const validUser = () => ({
  username: 'testuser',
  password: 'SecureP@ss123',
  firstName: 'Test',
  lastName: 'User',
});
```

---

## Test Coverage per Module

### auth.integration.spec.ts

| Endpoint | Test Case | Expected |
|----------|-----------|----------|
| POST /auth/register | Valid payload | 201 + auth response |
| POST /auth/register | Duplicate username | 409 Conflict |
| POST /auth/register | Invalid body (missing fields) | 400 Bad Request |
| POST /auth/login | Valid credentials | 200 + tokens |
| POST /auth/login | Invalid credentials | 401 Unauthorized |
| POST /auth/login | Invalid body | 400 Bad Request |
| POST /auth/refresh | Valid refresh token | 200 + new tokens |
| POST /auth/refresh | Expired/invalid token | 401 Unauthorized |
| PATCH /auth/change-password | Valid (authenticated) | 200 OK |
| PATCH /auth/change-password | Wrong current password | 401 Unauthorized |
| PATCH /auth/change-password | Weak new password | 400 Bad Request |

### users.integration.spec.ts

| Endpoint | Test Case | Expected |
|----------|-----------|----------|
| GET /users | List users (paginated) | 200 + paginated result |
| GET /users/:id | Existing user | 200 + user object |
| GET /users/:id | Non-existent user | 404 Not Found |
| PATCH /users/:id | Update user | 200 + updated user |
| PATCH /users/:id | Invalid payload | 400 Bad Request |

### entities.integration.spec.ts

| Endpoint | Test Case | Expected |
|----------|-----------|----------|
| GET /entities | List entities | 200 + paginated result |
| POST /entities | Create entity | 201 + entity object |
| POST /entities | Invalid payload | 400 Bad Request |
| GET /entities/:id | Existing entity | 200 + entity object |
| GET /entities/:id | Non-existent entity | 404 Not Found |

### siembra.integration.spec.ts

| Endpoint | Test Case | Expected |
|----------|-----------|----------|
| GET /siembra | List siembras | 200 + paginated result |
| POST /siembra | Create siembra | 201 + siembra object |
| POST /siembra | Invalid dates | 400 Bad Request |
| GET /siembra/:id | Existing siembra | 200 + siembra object |
| GET /siembra/:id | Non-existent siembra | 404 Not Found |

### permissions.integration.spec.ts

| Endpoint | Test Case | Expected |
|----------|-----------|----------|
| GET /permissions | List permissions (admin) | 200 + permissions |
| GET /permissions | List permissions (non-admin) | 403 Forbidden |
| POST /permissions | Create permission (admin) | 201 + permission |
| POST /permissions | Create permission (non-admin) | 403 Forbidden |

---

## Integration with Existing Infrastructure

### package.json scripts

Add:
```json
"test:integration": "jest --config test/integration/jest.config.ts",
"test:all": "jest && jest --config test/integration/jest.config.ts"
```

### jest.config.ts (integration)

```ts
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.integration.spec.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleNameMapper: { '^(\\.\\.?\\/.*)\\.js$': '$1' },
};
```

### Pre-commit hook

No changes needed — `pnpm test` runs unit tests only. Integration tests are opt-in via `pnpm test:integration`.

---

## Out of Scope

- Real database integration tests (would require MariaDB)
- Legacy MySQL module tests
- Frontend integration tests
- Performance/load testing

---

## Success Criteria

1. All 5 module integration test files pass
2. Total: ~30-40 new integration tests
3. `pnpm test:integration` runs independently
4. Existing 85 unit tests still pass
5. Total test count: ~280-290 (250 unit + ~30-40 integration)
