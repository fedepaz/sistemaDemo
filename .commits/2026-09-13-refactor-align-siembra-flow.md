refactor(siembra): align flow with simplified backend schema

- Remove f_siembra, cantidadGrs, ajuste from AsignarUbiSiembraDtoSchema
- Add semEntrega to SiembraDtoSchema and LegacySiembra interface
- Auto-set f_siembra to today in completarSiembraLegacy
- Replace fechaSiembraReal column with semEntrega in siembra table
- Update aSembrar form reset and confirmation dialog summaryFields
- Update all related tests
