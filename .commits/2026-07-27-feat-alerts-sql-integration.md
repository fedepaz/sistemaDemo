feat(alerts): integrate real SQL queries and update DTOs/UI for alert system

Replace hardcoded mock data in the alerts backend with real SQL queries
from the legacy MySQL database. Update shared DTOs, backend interfaces,
service mappers, and frontend column definitions to match the actual
SQL output. Add consistent font-mono styling and right-aligned numerics
to alert table columns for improved enterprise data density.

Backend: LegacySiembraRetrasada, LegacyFaltaGerminacion,
LegacyFaltantePlantas, LegacyFaltaPreExpedicion interfaces now match
SQL column aliases (espvar->codigoEspecie, nombre->nombreEspecie, etc.).
Repository queries partidas + articulo via LEFT JOIN on
CONCAT(espvar, contenedor). Decimal fields (pr, stIniPr) kept as
strings end-to-end to avoid JS floating-point precision loss.
