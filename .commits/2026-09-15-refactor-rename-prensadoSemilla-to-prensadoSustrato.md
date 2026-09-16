refactor(siembraPartidas): rename prensadoSemilla to prensadoSustrato

Rename the prensadoSemilla field to prensadoSustrato across the entire
stack to better reflect that the pressure reading applies to the
substrate. Updates Prisma schema, shared schemas/labels, backend
services, frontend components, and all tests.

Field label stays "Prensado". Database migration excluded — to be
applied manually.
