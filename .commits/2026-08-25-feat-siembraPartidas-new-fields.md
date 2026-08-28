feat(siembraPartidas): add presionSemilla, profundidadSemilla, and tratamientoSemilla

- Add Prisma Decimal(5,3) for profundidadSemilla with validated string DTO
- Add ProfundidadSemillaSchema with regex validation (1-2 digits, 0-3 decimals)
- Add mapToDto to convert Prisma Decimal to string on read
- Add createSiembraPartida in repository with Prisma nested connect
- Fix mezcla controller permission table names
- Include Prisma migration
