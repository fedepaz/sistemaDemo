feat(siembra): refactor ubicacion flow with cg/germin fields

- Replace ubicacion/stock_ini/baja with cg/cantidaNroCont/germin
- Add extendido and germin to SiembraDto
- Remove dead asignarUbicacionSiembra from siembra module
- Fix INSERT column/value mismatch and UPDATE SET syntax
- Add germin field to siembra edit form
- Exclude .next/cache from turbo build outputs
