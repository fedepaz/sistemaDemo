feat(siembraPartidas): extend rich DTO with legacy siembra, task shift, and resolved names

Extend SiembraPartidaDto with 16 new optional fields from legacy partidas
table, task shift data, and resolved display names. Backend fetches from
3 sources (Prisma SiembraPartidas, legacy MySQL partidas, Prisma TaskShift)
and resolves tratamiento code, entity label, and employee usernames.
Frontend view form rewritten with 3 tabs (Siembra, Lote, Turno).
