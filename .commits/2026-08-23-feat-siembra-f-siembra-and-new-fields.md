feat(siembra): replace germin with f_siembra date and add lote/anoLote/ajuste fields

- AsignarUbiSiembraDto: replace germin (number) with f_siembra (z.coerce.date)
- SiembraDto: add fechaSiembraReal, lote, anoLote, ajuste fields
- PartidasRepository: remove dead INSERT INTO partidas1, only UPDATE remains
- SiembraRepository: add lote/ano_lote/ajuste to SELECT, remove partidas1 JOIN
- Frontend: add date picker, date formatting, and new columns/fields
- Update all schema and integration tests
