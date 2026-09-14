fix(siembraPartidas): filter findAll to only return completed siembra records

- Add profundidadSemilla !== 0 filter to repository findAll method
- Ensures GET /siembra-partidas only returns completed (not pending) records
