feat(siembra): make mezclaId optional with generic fallback

- Make mezclaId optional in CreateSiembraPartidaSchema
- Auto-create generic mezcla (100% sustrato) when none provided
- Add unique constraint on Sustratos.nombre
- Fix timezone offset in TaskShift datetime formatting
- Hide mezcla selection in edit form until client enables feature
