feat(legacy): add stock module for legacy MySQL stock queries

Add LegacyStockModule with service, repository, and controller for
querying and updating stock data from the legacy martin3 database.

- stockTotal: queries st_sem_movim and partidas1 for entry/exit totals
- updateStock: updates st_sem_item entry/exit values
- updateStockTotal: updates st_sem entry/exit values
