feat(siembraPartidas): add stock traceability columns for debugging and auditing

Add 6 nullable columns to siembraPartidas to capture stock snapshot
(lote, anio, entradas/salidas before and after update). UpdateStock
now returns StockSnapshot, threaded through PartidasService into
createSiembraPartida for full traceability.
