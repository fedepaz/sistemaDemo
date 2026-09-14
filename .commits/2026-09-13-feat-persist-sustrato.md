feat(siembraPartidas): persist sustrato field to database

Add sustrato column to SiembraPartidas Prisma model and wire it
through create, update, and mapToDto in the service layer.

Run migration: pnpm --filter backend db:migrate:dev
