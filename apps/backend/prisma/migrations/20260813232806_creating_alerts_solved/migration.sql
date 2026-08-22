-- CreateTable
CREATE TABLE `alerts_solved` (
    `id` VARCHAR(191) NOT NULL,
    `partidaId` INTEGER NOT NULL,
    `anio` INTEGER NOT NULL,
    `indice` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedByUserId` VARCHAR(191) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `alerts_solved_partidaId_anio_indice_idx`(`partidaId`, `anio`, `indice`),
    INDEX `alerts_solved_deletedByUserId_idx`(`deletedByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
