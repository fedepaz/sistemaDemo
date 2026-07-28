refactor(alerts): remove V2/V3 versions and add comprehensive test coverage

- Delete V2/V3 dashboard components, cards, routes, and useAlertActions hook
- Remove FilterTabs and V2/V3 exports from alerts index
- Add backend service mapper, controller, and integration tests
- Add frontend hook, service, and component tests (~55 test cases)
- Frontend: 26 suites, 97 tests passing | Backend alerts: 2 suites, 12 tests
