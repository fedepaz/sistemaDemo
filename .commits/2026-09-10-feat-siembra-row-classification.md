feat(siembra): add row classification, date sorting, and createdAt to siembra tables

- Add createdAt field to SiembraPartidaSchema and mapToDto
- Add getRowClassName prop to DataTable for dynamic row styling
- Classify siembra rows by aSembrar/registradas status (yellow/green)
- Sort all three siembra tables by date (newest first)
- Add createdAt column to aSembrar and registradas tables
- Convert siembra columns to function accepting classification keys
- Wire autorizar-siembra-edit-form onSubmit (was no-op)
- Remove unused useSiembraMutation export
