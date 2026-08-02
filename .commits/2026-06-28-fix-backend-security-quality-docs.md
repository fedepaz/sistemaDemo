fix(backend): security, code quality, and documentation improvements

- Logger isDev now uses BACKEND_NODE_ENV instead of hardcoded true
- Removed DB URL console.log from main.ts
- Removed redundant dotenv.config() call
- Fixed 8 typos in error responses (security-exception.filter.ts)
- Fixed trailing space in auditLog query params
- TenantsService now throws NotFoundException instead of generic Error
- Dropped hardcoded JWT secret defaults in configuration.ts
- Import Prisma enums instead of locally redefining in filter/interceptor
- Registered RequestIdMiddleware in app.module.ts
- Fixed permissions interface mismatch (findManyByUserId signature)
- Fixed ooperation typo in PrismaService
- Updated docs: single-tenant architecture, removed Valkey/BullMQ references
