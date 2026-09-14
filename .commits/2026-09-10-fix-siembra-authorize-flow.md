fix(siembra): refactor authorization flow with dedicated read-only form

- Add AutorizarSiembraSchema (only partidaId, anio, indice)
- Create AutorizarSiembraEditForm for read-only display before authorization
- Remove unused SiembraEditForm and useSiembraMutation
- Change a_sembrar permission from update to create
- Clean up form validation to prevent Zod type mismatch errors
