refactor(siembra): rename presionSemilla to prensadoSemilla and improve query invalidation

Rename presionSemilla to prensadoSemilla across entire codebase (schema,
service, controller, frontend, tests, field labels). Change type from
Int to Decimal(3,1) with migration. Replace free-text Input with Select
dropdown (0-6, 0.5 increments) in aSembrar edit form. Add
PrensadoSemillaValues constant and Zod validation for 0.5 step
increments. Add .refine() to ProfundidadSemillaSchema to reject 0.

Centralize query invalidation: siembraPartida mutation refreshes
registradas + aSembrar + extendidos + alerts; aSembrar mutation
refreshes registradas + extendidos + alerts.

Fix backend tests: mock prensadoSemilla as Decimal object, update
findAll where clause, fix createdAt type in mockDto. Fix frontend
tests: remove stale siembra-edit-form.test.tsx, fix
useSiembraAutorizacion mock, add register to useForm mock, pass
required props to SiembraDataTable.
