# Backend Features List

This document lists all the modules, services, and core functionalities implemented in the `apps/backend` directory.

## Core Infrastructure

- [x] **Global Exception Filter**: `GlobalExceptionFilter` handles security exceptions and database connectivity issues.
- [x] **Global Auth Guard**: `GlobalAuthGuard` enforces JWT authentication by default.
- [x] **Typed Configuration**: `AppConfig` with Joi validation schema.
- [x] **Prisma Service**: Robust connection handling with retries and health checks.
- [x] **Request ID Middleware**: `RequestIdMiddleware` for traceability.
- [x] **Zod Validation Pipe**: `ZodValidationPipe` for type-safe request validation.

## Modules & Features

### Auth Module
- [x] **JWT Passport Strategy**: `JwtStrategy` for bearer token validation.
- [x] **User Registration**: `POST /auth/register` with tenant assignment.
- [x] **User Login**: `POST /auth/login` with username/password.
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
- [x] **Database Health**: `GET /health` with adaptive caching.
- [x] **Detailed Status**: `GET /health/detailed` for environment and memory info.

## Shared Utilities

- [x] **Base Repository**: `BaseRepository<T>` for common CRUD operations.
- [x] **Current User Decorator**: `@CurrentUser()` for injection in controllers.
- [x] **Custom Decorators**: `@Public()`, `@RequirePermission()`.
