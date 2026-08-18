feat(alerts): add alerts solved feature

Implement full-stack functionality to mark alerts as solved:
- Prisma model, migration, and repository with dev-account filtering
- NestJS controller with permission guards and Zod validation
- Frontend API service, React Query hooks, and mutation invalidation
- "Marcar alerta como resuelta" button in alerts data table
- Shared Zod schemas for AlertSolved and CreateAlertSolved DTOs
