feat(sustratos): improve UX and migrate createdAt to Date type

- Migrate SustratoDto.createdAt from string to Date in shared schema
- Update backend service to return raw Date instead of ISO string
- Improve view form with overflow handling, gradient header, active badge, and long-format date
- Improve create form helper text with examples
- Add export columns for PDF/CSV
- Improve table column styling and date formatting