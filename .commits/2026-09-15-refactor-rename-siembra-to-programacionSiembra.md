refactor: rename siembra entity to programacionSiembra

Rename the legacy siembra module to programacionSiembra across the
entire stack to avoid future naming conflicts. Updates shared schemas,
backend module/classes/routes, permission entity names, frontend
feature directory/components/routes/query keys, and integration tests.

Preserves: database column names (f_siembra, sem_siembra),
siembraPartidas module names, alerts siembra-retrasada endpoint,
user-facing Spanish toast messages.
