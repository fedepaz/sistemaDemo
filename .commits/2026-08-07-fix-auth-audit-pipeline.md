fix(auth): pass ipAddress/userAgent through audit events and security hardening

Auth events (LOGIN, LOGIN_FAILED, LOGOUT) were silently dropping ipAddress
and userAgent fields even though the controller extracted them. This meant
audit logs always showed N/A for auth-related events.

Changes:
- AuthController: inject @Req() to extract user-agent, pass both IP and
  userAgent to AuthService.login() and .logout()
- AuthService: propagate ipAddress/userAgent through all emitAuth() calls
- Replace config.get('config.defaultPassword') || '123456' with
  config.getOrThrow() — server fails fast if env var is missing
- AuditLog schema: .optional() → .nullable().optional() to match Prisma
  nullable columns (null from DB, undefined when absent)
- Permissions: batch findManyByNames() to fix N+1 query in replaceAllForUser
- Frontend: consolidate TooltipProvider, shared isMobileDevice utility,
  ErrorBoundary, React Query v5 compat, locale fix (es-AR)
