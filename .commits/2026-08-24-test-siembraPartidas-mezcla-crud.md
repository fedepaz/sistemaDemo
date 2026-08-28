test(siembraPartidas, mezcla): add CRUD endpoints, Zod DTOs, and comprehensive tests

- Add SiembraPartidaSchema and CreateSiembraPartidaSchema in packages/shared
- Add GET /:id and POST / endpoints to SiembraPartidasController
- Add getSiembraPartidaById and createSiembraPartida to SiembraPartidasService
- Fix route typo: siembra-partdas → siembra-partidas
- Remove dead local types from mezcla and siembraPartidas services
- Add schema tests for sustratos, mezcla, and siembraPartida (21 tests)
- Add service/controller/repository tests for siembraPartidas (12 tests)
- Expand service/controller/repository tests for mezcla (12 tests)
