test(users): add unit, integration and frontend tests for activation

Backend:
- users.service.spec: getToActivate (2) + activateUserById (3)
- users.repository.spec: findToActivate (2) + activateById (2)
- users.integration.spec: GET /to-activate (2) + PATCH /activate/:userId (2)
- mock-factories: add getToActivate + activateUserById stubs

Frontend:
- NEW useActivateUser.test.tsx: hook mutation tests (2)
- NEW activate-user-button.test.tsx: component tests (6)
- userService.test.ts: activateUser (2) + fetchToActivate (2)
