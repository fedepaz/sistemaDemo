feat(siembraPartidas): add read-only DataTable for registered planting records

Extend SiembraPartidaDto with resolved mezcla composition and username,
override repository findAll to include Prisma relations, and add new
frontend feature at /siembra/partidas-registradas with DataTable, slide-over
detail view, export columns, and sidebar navigation entry.
