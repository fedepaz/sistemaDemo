chore: security hardening, audit improvements, and infrastructure cleanup

Security:
- Add LoginRateLimiter for brute-force protection (10 attempts/15 min)
- Exclude passwordHash from all user repository queries
- Uniform "Invalid credentials" on all 401 responses
- Exclude passwordHash from profile update schema
- Atomic replaceAllForUser for permission updates

Audit:
- Allow NULL tenantId/userId for anonymous events (migration applied)
- Add pagination to audit log queries
- Skip CRUD audit for auth endpoints (no duplicates)

Auth:
- Add restorePassword endpoint for admin password reset
- Relax login password validation (policy enforced on change only)
- Fix isDefaultPassword comparison consistency

Users:
- Filter dev accounts from non-dev queries
- Track deletedByUserId on soft delete
- Add recover endpoint for dev accounts

Legacy:
- Reject invalid WHERE keys instead of silently dropping clause

Frontend:
- Remove 30s alert polling (use react-query staleTime)
- Update error handler for "Invalid credentials" message
- Add type-check tsconfig for frontend

Infrastructure:
- Remove Docker, Nginx, PM2 configs
- Rename deploy.yml to build-verification.yml

Docs:
- Slim all agent documentation
- Add production.md deployment guide
- Clean design system docs
