refactor(legacy): reuse SiembraPartidasService for siembra creation

Replace direct prisma.siembraPartidas.create() call in PartidasService
with SiembraPartidasService.createSiembraPartida() to centralize
creation logic and remove duplicated mezcla resolution.

Also removes manual createdAt/updatedAt from SiembraPartidasRepository
since the Prisma schema handles timestamps via @default(now()) and
@updatedAt.
