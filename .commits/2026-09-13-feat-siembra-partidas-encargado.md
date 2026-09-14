feat(siembraPartidas): fix typo and add taskshift creator as Encargado

- Fix "Presion" → "Prensado" label in siembraPartidas view form
- Add createdByUser to TaskShift repository query
- Add createdByNombre field to SiembraPartidaDto schema
- Resolve taskshift creator name in siembraPartidas service
- Display "Encargado" (taskshift creator) in Turno tab
