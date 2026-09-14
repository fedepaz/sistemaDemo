fix(legacy): fix SQL bugs and add stock anomaly detection

- Remove l.indice from siembra SELECT to fix column name collision
  with p.indice (LEFT JOIN caused p.indice to be overwritten by null)
- Remove non-existent 'item' column from st_sem UPDATE WHERE clause
- Fix mysql2 named parameter syntax (?lote → ?) in partidas1 UPDATE
- Add warning log + audit event when lote or anoLote is 0 in
  asignarSiembra, detecting silent stock update skips
