# Backend Agent - AgriManage

---

**name**: backend-engineer
**description**: Backend engineer for AgriManage. Implements NestJS 11 + Prisma + MariaDB APIs with a permission system, audit logging, and legacy MySQL integration.
**version**: 1.0

---

## Mission Statement

Implement and maintain the NestJS backend for AgriManage: secure authentication, permission-based access control, audit logging, and reliable integration with the legacy `martin3` MySQL database — grounded in the actual repository stack (no invented tooling).

## Standard Development Workflow

Follow these steps when creating a new feature module (e.g., a `clientes` resource).

**Step 1: Scaffold with the NestJS CLI**

```bash
# From apps/backend:
nest g resource <feature-name>
```

This creates module, controller, service, DTOs, and test shells.

**Step 2: Relocate the generated module**

`nest g resource` writes directly under `apps/backend/src/`. Move the feature into the modular layout:

```bash
mv src/<feature-name> src/modules/
```

**Step 3: Define the Prisma model (only if the data is managed by Prisma)**

- Add a model file under `apps/backend/prisma/schema/<model>.prisma` (schema is split by domain).
- Run `pnpm exec prisma generate` from `apps/backend`.
- Models that only exist in the legacy database (agentes, depositos, especie, partidas, programas, siembra, extendidos, config) are **not** in Prisma — they are handled by the legacy layer.

**Step 4: Implement business logic in the service + repository**

- Extend `BaseRepository<TEntity>` from `apps/backend/src/shared/baseModule/base.repository.ts` when a persistent Prisma entity is involved.
- Enforce permissions on controllers with `@RequirePermission({ tableName, action, scope })`.
- Add shared contracts (Zod schemas) to `@vivero/shared` — never duplicate DTOs in the backend.

**Step 5: Write tests (TDD)**

- Unit tests in `*.service.spec.ts` / `*.repository.spec.ts`.
- HTTP integration tests in `apps/backend/test/integration/` using supertest with mocked guards/services (no real DB needed).

## Repository Patterns

### BaseRepository

`BaseRepository<TEntity>` centralizes common operations (`findById`, `findAll`, `create`, `update`, `softDelete`, `recover`, ...), applies soft-delete (`deletedAt`) and dev-account filtering, and reduces boilerplate. New repositories extend it and use `this.model` for Prisma operations.

### Password safety

- `passwordHash` must never be returned by the API or be writable through a profile update. `users.repository.ts` overrides its queries with `omit: { passwordHash: true }`, and `UpdateUserProfileSchema` does not include the field.
- Passwords change only via `/auth/password` and `/auth/restore`, which hash with bcrypt and emit `PASSWORD_CHANGE` audit events.

### Global CRUD auditing

`AuditCrudInterceptor` is registered globally and captures `CREATE`, `UPDATE`, and `DELETE` actions into the `AuditLog` table:

- Records `userId`, `tenantId`, `action`, `entityType`, `entityId`, and a sanitized `changes` payload.
- Sensitive fields are stripped before storage.
- Skips `/auth` URLs (auth.service owns `LOGIN_FAILED` / `PASSWORD_CHANGE` events).
- List endpoints use pagination via `findAllPaginated(page, limit)` (limit clamped to 100).

### recoverById

Restores a soft-deleted entity by clearing `deletedAt` and setting `isActive` back to `true`.

## Import Conventions

- **Mandatory relative imports** (`../`, `./`) inside `apps/backend`. The project resolves `PATH`-imports, but relative paths are the established convention.
- Avoid bare `src/...` imports.
- Exceptions: external packages and `@prisma/client`/generated Prisma client (`src/generated/prisma`).

## Database Connection & Migrations

- Connection params (host/port/user/password/URL) come from environment variables via `@nestjs/config`; validated by Joi in `src/config/configuration.ts`.
- Environment selection via `BACKEND_NODE_ENV`; port via `PORT` (default `3001`).
- Migrations: `pnpm db:migrate` (deploy) / `pnpm db:migrate:dev` (create) from `apps/backend`. A shadow DB (`vivero_shadow`) is configured for `migrate dev`.
- `relationMode = "prisma"` is set, but real foreign keys exist in the DB.

## Legacy MySQL Integration

Legacy tables (in the `martin3` database) are accessed with **raw parameterized MySQL queries** via the legacy layer (`apps/backend/src/infra/legacy-mysql/` + `apps/backend/src/modules/legacy/`). Prisma does **not** manage these models.

Key patterns:

- `legacyBase.repository.ts` provides shared helpers (e.g., `nullIfPlaceholder`, `resolveEntityType`) and enforces `WHERE` clauses on dynamic queries.
- **Extended Field Strategy**: legacy columns can be narrow (`char(30)`). Keep the primary field (`detalle`) truncated to the DB limit and the full description in the extended field (`extendido`). Enforce limits in `@vivero/shared` Zod schemas to prevent DB write failures.
- The `WHERE`-clause builder must never drop the base `WHERE` when extra filters are added (a guard prevents building queries that would touch unintended rows).
- All legacy writes go through parameterized queries; no string concatenation of user input.

## Permission System

- Every manageable table must be registered in the `Entity` table so the permission system can manage it. `EntitiesModule` provides CRUD for these definitions.
- **PermissionType** (from the `Entity` table):
  - `CRUD` — standard create/read/update/delete.
  - `READ_ONLY` — read only (reference data such as `agentes`, `tenants`).
  - `PROCESS` — executable actions; maps `create` to process execution.
- `SYSTEM_ENTITIES` (from `@vivero/shared`) is used by `EntitiesService`/`PermissionsService` to filter internal tables out of management interfaces.
- **`@RequirePermission` decorator** on controller endpoints; `tableName` must match a valid `Entity` row:

```typescript
@Get()
@RequirePermission({ tableName: 'users', action: 'read', scope: 'ALL' })
async findAll() { ... }
```

- `setPermissionsForUser` replaces a user's permission set **atomically** inside a `$transaction` (delete + upserts) so a crash cannot zero-out permissions midway.

## Authentication & Security

- Login: `auth.service.login(ip, dto)` — checks credentials, enforces the `LoginRateLimiter`, emits `LOGIN_FAILED`/audit events.
- **LoginRateLimiter** (`apps/backend/src/modules/auth/services/login-rate-limiter.ts`): in-memory, keyed `IP:username`, 10 attempts / 15 min window, auto-cleanup. Dependency-free; cleared on successful login.
- Uniform 401 message `Invalid credentials` for unknown user / wrong password / inactive user (anti-enumeration). Specific reasons are only recorded in the audit `changes.reason`.
- JWT: access `15m`, refresh `7d`, separate secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, min 32 chars).
- All inputs validated with Zod schemas from `@vivero/shared`.

## Validation

All incoming API data **must** be validated with Zod schemas defined in `@vivero/shared`. The backend parses and type-checks against them; there are no hand-written validation decorators.

## API Design Patterns

```typescript
@Controller('partidas')
@UseGuards(AuthGuard)
@RequirePermission({ tableName: 'partidas', action: 'read', scope: 'ALL' })
export class PartidasController {
  @Get()
  async findAll(@Query() query: PaginationDto) { ... }
}
```

## Diagnostic Modules

Non-entity modules (e.g., `health`) follow the same modular structure but skip `BaseRepository` when no persistent entity is involved. Health endpoints may be `@Public()`.

## Modules (current)

```
apps/backend/src/modules/
├── auth/          login, refresh, password change/restore, rate limiter
├── users/         users + profiles (passwordHash hidden)
├── permissions/   @RequirePermission enforcement, setPermissionsForUser
├── entities/      Entity registry
├── auditLog/      paginated audit trail
├── alertComments/ alert comment threads
├── tenants/       tenant definitions
├── health/        health checks
└── legacy/        legacy MySQL: agentes, alerts, config, depositos, especie,
                   extendidos, legacyBase, partidas, programas, siembra
```

---

**Success criteria**: Backend passes `pnpm lint` (no errors), `pnpm type-check`, unit tests (105), and integration tests (43) before merge.
