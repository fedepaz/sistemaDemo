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

### Permissions Module
- [x] **Permissions Guard**: `PermissionsGuard` + `@RequirePermission()` decorator.
- [x] **Resource-Level Security**: Validation against `ALLOWED_TABLES`.
- [x] **CRUD & Scope Check**: Logic for `canCreate`, `canRead`, etc., and `OWN` vs `ALL` scopes.
- [x] **Admin Management**: `PATCH /user/:userId` to update permissions.

### Tenant Module
- [x] **Tenant Management**: `GET /tenants`, `GET /tenants/:id` (and potentially other CRUD operations).
- [x] **Active Status**: Tenants include an `isActive` boolean field (default: `true`) to control their operational status.
- [x] **Repository Pattern**: `TenantsRepository` extending `BaseRepository`.

### Audit Log Module
- [x] **Automatic Logging**: Integrated into the exception filter for security events.
- [x] **Audit Retrieval**: `GET /:tenantId` and `GET /user/:userId`.
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
- [x] **Modular Design**: Encapsulated in `LegacyAgentesModule`.

### Legacy Especie Module
- [x] **Legacy Data Access**: Read-only integration with the legacy `especie` table.
- [x] **Repository Pattern**: `EspecieRepository` using the `LegacyMysqlService`.
- [x] **Modular Design**: Encapsulated in `LegacyEspecieModule`.

### Legacy Base Module
- [x] **Generic Legacy Access**: Dynamic querying of whitelisted legacy tables.
- [x] **Repository Pattern**: `LegacyBaseRepository` with support for pagination, sorting, and filtering.
- [x] **Data Sanitization**: Automatic trimming of legacy `char()` padding in `LegacyBaseService`.
- [x] **Security Guard**: Strict whitelist validation for table names and safe JSON filter parsing.

## Shared Utilities

- [x] **Base Repository**: `BaseRepository<T>` for common CRUD operations.
- [x] **Current User Decorator**: `@CurrentUser()` for injection in controllers.
- [x] **Custom Decorators**: `@Public()`, `@RequirePermission()`.
