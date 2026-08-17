test: add restore password unit and integration tests

Add test coverage for PATCH /auth/restore endpoint:
- Unit tests for AuthService.restorePassword()
- Unit test for AuthController.restorePassword()
- Integration tests for request validation and success flow
- Mock factory and fixture updates for restore password
