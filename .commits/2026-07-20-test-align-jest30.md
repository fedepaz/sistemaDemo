test: align testing infrastructure to Jest 30 across all packages

- backend: add standalone jest.config.ts with Prisma ESM resolution,
  85 unit tests across 11 modules (auth, users, entities, permissions,
  auditLog, siembra)
- frontend: migrate from Vitest to Jest 30, 58 tests across 18 suites,
  exclude test files from TypeScript build
- shared: upgrade Jest 29 to 30, add 71 schema tests for permissions,
  auditLog, alerts, tenant, partidas, siembra, extendido
- delete empty e2e spec and Vitest config files
