fix(siembra): prevent duplicate siembra authorization

- Add @@unique constraint on (partidaId, anio, indice) in SiembraPartidas
- Add existence check in autorizarSiembra backend service (409 ConflictException)
- Add isAlreadyAuthorized warning banner to AutorizarSiembraEditForm
- Sort siembra table by category (yellow → green → others) then by date
