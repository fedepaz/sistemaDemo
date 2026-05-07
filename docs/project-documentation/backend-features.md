# Backend Features List

This document lists all the modules, services, and core functionalities implemented in the `apps/backend` directory.

## Core Infrastructure

- [x] **Global Exception Filter**: `GlobalExceptionFilter` handles security exceptions and database connectivity issues.
- [x] **Global Auth Guard**: `GlobalAuthGuard` enforces JWT authentication by default.
- [x] **Typed Configuration**: `AppConfig` with Joi validation schema.
- [x] **Prisma Service**: Robust connection handling with retries and health checks.
- [x] **Environment-Aware Connectivity**: Dynamic switching between `PROD_` and `DEV_` database URLs based on `BACKEND_NODE_ENV`.
- [x] **Legacy Database Connectivity**: `LegacyMysqlModule` providing a global `LegacyMysqlService` with enhanced connection pooling (keep-alive enabled), graceful lifecycle management, and security guards for raw SQL execution.
- [x] **Request ID Middleware**: `RequestIdMiddleware` for traceability.
- [x] **Zod Validation Pipe**: `ZodValidationPipe` for type-safe request validation.
- [x] **Continuous Dependency Security**: Automated high-severity vulnerability monitoring via `pnpm audit` in CI/CD, with proactive resolution through surgical `pnpm.overrides`.

## Modules & Features

### Auth Module
- [x] **JWT Passport Strategy**: `JwtStrategy` for bearer token validation.
- [x] **Administrative User Registration**: `POST /auth/register` protected by `auth:read:ALL` permissions.
- [x] **User Login**: `POST /auth/login` with username/password.
- [x] **Force Password Change**: Intercepts logins using default credentials to ensure security compliance.
- [x] **Token Refresh**: `POST /auth/refresh` for long-lived sessions.
- [x] **Password Management**: `PATCH /auth/password` for authenticated users.
- [x] **Public Access Decorator**: `@Public()` to bypass global auth.

### Users Module
- [x] **Profile Management**: `GET /me`, `PATCH /me`.
- [x] **Admin User Management**: `GET /all`, `GET /username/:username`.
- [x] **Soft Delete**: `DELETE /:username` with recovery option.
- [x] **Repository Pattern**: `UsersRepository` extending `BaseRepository`.
- [x] **Developer Account Isolation**: Introduced `DevAccount` entity to distinguish system developers from standard administrators.

### Entities Module
- [x] **Entity Management**: CRUD for system entities (tables) which are now the source of truth for the permission system. Protected by `entities` table permissions.
- [x] **Permission Type Support**: Entities include `permissionType` (`CRUD`, `READ_ONLY`, `PROCESS`) to define allowable actions.
- [x] **System Entity Filtering**: Centralized `SYSTEM_ENTITIES` constant ensures internal tables (like `dev_account` or `audit_logs`) are filtered out of standard management views.
- [x] **Repository Pattern**: `EntitiesRepository` extending `BaseRepository`.

### Permissions Module
- [x] **Permissions Guard**: `PermissionsGuard` + `@RequirePermission()` decorator.
- [x] **Dynamic Entity Validation**: Validation against the `Entity` table in the database instead of a static whitelist.
- [x] **Permission Types**: Support for `CRUD`, `READ_ONLY`, and `PROCESS` types to constrain allowable actions.
- [x] **CRUD & Scope Check**: Logic for `canCreate`, `canRead`, etc., and `OWN` vs `ALL` scopes.
- [x] **Admin Management**: `PATCH /user/:userId` to update permissions.
- [x] **Entity-Centric Oversight**: `GET /entity/:entityId` to retrieve all users with access to a specific resource. Implements security filtering to hide developer accounts from standard managers.

### Tenant Module
- [x] **Tenant Management**: `GET /tenants`, `GET /tenants/:id` (and potentially other CRUD operations).
- [x] **Active Status**: Tenants include an `isActive` boolean field (default: `true`) to control their operational status.
- [x] **Repository Pattern**: `TenantsRepository` extending `BaseRepository`.

### Audit Log Module
- [x] **Automatic Logging**: Integrated into the exception filter for security events.
- [x] **Audit Retrieval**: `GET /:tenantId` and `GET /user/:userId`. Protected by `audit_logs` table permissions.
- [x] **JSON Changes**: Storage of action metadata in JSON format.

### Health Module
- [x] **Modular Architecture**: Refactored into a full NestJS module with dedicated `Module`, `Service`, and `Repository`.
- [x] **Multi-Database Health**: `GET /health` checks both primary (Prisma) and Legacy databases.
- [x] **Adaptive Caching**: Independent caching per database (30s when healthy, 10s when degraded).
- [x] **Reliability Logic**: Consecutive failure tracking (max 3) per service before marking as disconnected.
- [x] **Detailed Diagnostics**: Includes memory and environment metrics.
- [x] **Repository Pattern**: `HealthRepository` abstracts health check logic for both DB connections.

### Legacy Agentes Module
- [x] **Legacy Data Access**: Read-only integration with the legacy `agentes` table.
- [x] **Repository Pattern**: `AgentesRepository` using the `LegacyMysqlService`.
- [x] **Error Handling**: Implements null checking in `findOne` to handle non-existent records gracefully.
- [x] **Modular Design**: Encapsulated in `LegacyAgentesModule`.

### Legacy Especie Module
- [x] **Legacy Data Access**: Read-only integration with the legacy `especie` table.
- [x] **Repository Pattern**: `EspecieRepository` using the `LegacyMysqlService`.
- [x] **Error Handling**: Implements null checking in `findOne` to handle non-existent records gracefully.
- [x] **Modular Design**: Encapsulated in `LegacyEspecieModule`.

### Legacy Config Module
- [x] **Legacy Data Access**: Read-only integration with the legacy `config` table.
- [x] **Repository Pattern**: `ConfigRepository` using the `LegacyMysqlService`.
- [x] **Error Handling**: Implements null checking in `findOne` to handle non-existent records gracefully.
- [x] **Modular Design**: Encapsulated in `LegacyConfigModule`.

### Legacy Programas Module
- [x] **Legacy Data Access**: Read-only integration with the legacy `programas` table.
- [x] **Modular Design**: Encapsulated in `LegacyProgramasModule`.

### Legacy Depositos Module
- [x] **Legacy Data Access**: Read-only integration with the legacy `depositos` table for warehouses and cold storage (cámaras).
- [x] **Repository Pattern**: `DepositosRepository` using the `LegacyMysqlService`.
- [x] **Modular Design**: Encapsulated in `LegacyDepositosModule`.

### Legacy Partidas Module
- [x] **Legacy Data Access**: Read-only integration with the legacy `partidas` table.
- [x] **Repository Pattern**: `PartidasRepository` using the `LegacyMysqlService`.
- [x] **Basic Retrieval**: Provides access to the raw `partidas` data.
- [x] **Modular Design**: Encapsulated in `LegacyPartidasModule`.

### Legacy Extendidos Module
- [x] **Legacy Data Access**: Read-only integration with detailed `extendidos` query logic.
- [x] **Repository Pattern**: `ExtendidosRepository` using the `LegacyMysqlService`.
- [x] **Specialized Retrieval**: Supports querying by date with complex joins to species and location data.
- [x] **Full Retrieval**: `GET /l-extendidos` retrieves all production batches with optimized joins.
- [x] **Date Discovery**: `GET /l-extendidos/fechas` retrieves distinct production dates for filtering.
- [x] **Data Mapping & Transformation**: Implements `ExtendidoDto` with descriptive field names, including the newly mapped `fechaSugeridaSiembra`, species name lookup, and calculated dates.
- [x] **Modular Design**: Encapsulated in `LegacyExtendidosModule`.

### Legacy Base Module
- [x] **Generic Legacy Access**: Dynamic querying of whitelisted legacy tables.
- [x] **Repository Pattern**: `LegacyBaseRepository` with support for pagination, sorting, and filtering.
- [x] **Data Sanitization**: Automatic trimming of legacy `char()` padding in `LegacyBaseService`.
- [x] **Security Guard**: Strict whitelist validation for table names and safe JSON filter parsing.

## Shared Utilities

- [x] **Base Repository**: `BaseRepository<T>` for common CRUD operations. Now implements hierarchical visibility: developers see all records, while standard users have developer accounts and inactive/deleted records filtered out.
- [x] **Restricted Data Recovery**: The `recover` method is now strictly reserved for accounts registered in the `DevAccount` table.
- [x] **Current User Decorator**: `@CurrentUser()` for injection in controllers.
- [x] **Custom Decorators**: `@Public()`, `@RequirePermission()`.
