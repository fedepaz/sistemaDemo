fix(test): refactor alerts integration test to use mocks

- Add createAlertsMock() factory to mock-factories.ts
- Register AlertsController + AlertsService in create-app.ts
- Rewrite alerts.integration.spec.ts to use mocked app instead of AppModule
- Suppress ts-jest isolatedModules warning (code 151002)
- All 40 integration tests now pass in CI without database env vars
