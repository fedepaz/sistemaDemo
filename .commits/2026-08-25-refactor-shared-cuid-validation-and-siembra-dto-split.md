refactor(shared): add CUID validation and split siembra DTOs

- Add cuidSchema for Prisma @default(cuid()) field validation
- Replace z.string() and z.string().uuid() with cuidSchema across all schemas
- Split AsignarUbiSiembraCompletaDto into Partial (+ siembra) and Complete (+ TaskShift)
- Fix type mismatch in extendido-data-table.tsx (partida → partidaId, ano → anio)
- Update all tests to use valid CUIDs
