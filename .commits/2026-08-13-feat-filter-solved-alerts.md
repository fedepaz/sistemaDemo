feat(alerts): filter solved alerts from legacy query results

Filter out alerts marked as solved from all 4 legacy alert endpoints
(siembra-retrasada, falta-germinacion, faltante-plantas,
falta-pre-expedicion) without modifying the legacy MySQL database.

- Add returnAll param to AlertSolvedRepository/Service for global filtering
- Wire AlertSolvedModule into LegacyAlertsModule
- Inject AlertSolvedService into AlertsService with getSolvedKeys/applySolvedFilter helpers
- Add 5 tests covering filtering behavior for all alert types
- Refetch alert lists on frontend after marking alert as solved
