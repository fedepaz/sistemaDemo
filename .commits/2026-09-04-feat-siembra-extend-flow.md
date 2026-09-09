feat(legacy): extend siembra flow with stock, task shifts, and partidas1 updates

Add new fields to AsignarUbiSiembraCompletaDto (lote, anoLote, item,
semxgr, ajuste, cantidadGrs) and wire them through the full stack:

- Siembra query now SELECTs item from partidas table
- PartidasService uses TaskShiftsService and LegacyStockService
  instead of raw Prisma calls
- PartidasRepository.updateStock updates both st_sem_item and st_sem
  in a transaction
- PartidasRepository.asignarSiembra now also UPDATEs partidas1
- Frontend form pre-populates lote/anoLote/item/semxgr from selected
  row and adds cantidadGrs + ajuste input fields
- ajuste and cantidadGrs are required (validated on submit)
