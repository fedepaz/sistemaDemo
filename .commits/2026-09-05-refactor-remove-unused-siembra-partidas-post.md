refactor(siembraPartidas): remove unused POST endpoint

Remove standalone POST /siembra-partidas endpoint since
createSiembraPartida is now called internally from
PartidasService.asignarSiembra within a transaction.
