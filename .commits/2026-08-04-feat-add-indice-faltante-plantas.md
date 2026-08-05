feat(alerts): add indice to faltante plantas query for frontend consistency

Add indice column to findFaltantePlantas SQL query. Update mapper to
include indice in DTO. Remove indice optional override from schema since
it's inherited from AlertBaseDtoSchema. Fix tests to match new DTO shape.
