feat(frontend): display stock traceability fields in siembra partidas lote tab

Add 6 InfoRow components for stock traceability fields (stockLote,
stockAnio, entradas/salidas before and after) to the Lote tab.
Conditionally rendered when stockLote is present to avoid showing
empty rows for legacy records.
