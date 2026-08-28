feat(mezcla): add CRUD endpoints and Zod DTOs for mezcla management

- Add MezclaSchema and CreateMezclaSchema in packages/shared
- Add GET /:id and POST / endpoints to MezclaController
- Add getMezclaById and createMezcla to MezclaService
- Add nombre validation and await to SustratosService
