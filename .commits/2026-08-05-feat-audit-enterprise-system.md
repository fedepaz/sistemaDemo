feat(audit): enterprise audit system with unified event architecture

Backend:
- Refactor security-exception.filter to use centralized AuditService
- Add ipAddress/userAgent passthrough in audit pipeline
- Extend AuditAccessEvent with status/message/exceptionType
- Add new enum values: LOGIN_FAILED, PASSWORD_CHANGE, etc.
- Add timestamp index for query performance

Frontend:
- Redesign auditLog-form with extendido-view-form patterns
- Add hero section, quick stats grid, tabbed navigation
- Add Tooltips on User/IP/Device columns
- Add aria-hidden on decorative icons
- Use theme tokens instead of hardcoded colors
- Add viewport dvh constraints for proper scrolling
- Update components-list.md QA status
