test(backend): fix outdated test fixtures and assertions

- Remove createdAt/updateAt from unit test create assertions (Prisma auto-generates)
- Update integration test fixtures from UUID to CUID format matching requiredCuid regex
- Fix siembra test field names and add missing required fields from merged schemas
- Fix siembra mock assertion to account for 2-arg service call
