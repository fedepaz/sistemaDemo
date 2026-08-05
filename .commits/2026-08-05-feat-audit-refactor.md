feat(audit): refactor audit system with event-driven architecture

- Add centralized AuditService for all audit operations
- Add event-driven auth tracking (login, logout, login failures)
- Refactor AuditCrudInterceptor with auto-detection and AuditService
- Add user includes to all repository read methods
- Update frontend with pagination, auth event icons, and improved form display
- Add Prisma migration for new audit action types
- Fix test mocks to match new interfaces
- Update pnpm overrides for security vulnerability fixes
