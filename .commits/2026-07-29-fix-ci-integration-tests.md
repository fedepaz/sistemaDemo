fix(ci): build shared package before integration tests

Integration tests import from @vivero/shared which must be built first.
