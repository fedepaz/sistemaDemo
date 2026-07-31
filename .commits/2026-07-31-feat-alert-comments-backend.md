feat(alerts): add alert comments backend with commentCount integration

- Add commentCount field to all 4 alert DTO schemas in @vivero/shared
- Add AlertCommentSchema and CreateAlertCommentSchema with validation
- Create AlertCommentsModule: controller (GET + POST), service, repository
- Register AlertCommentsModule in app.module.ts
- Merge commentCount into AlertsService via batch Prisma groupBy query
- Add Prisma AlertComment model with userId relation and migration
- Export PartidasRepository from LegacyPartidasModule for partida validation
- Add comprehensive tests: 6 new shared schema tests, 2 new alert service tests
