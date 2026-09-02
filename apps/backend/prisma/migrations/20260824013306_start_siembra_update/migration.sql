-- CreateTable
CREATE TABLE `Mezcla` (
    `id` VARCHAR(191) NOT NULL,
    `sustrato1Id` VARCHAR(191) NOT NULL,
    `porcentaje1` INTEGER NOT NULL,
    `sustrato2Id` VARCHAR(191) NULL,
    `porcentaje2` INTEGER NULL,
    `sustrato3Id` VARCHAR(191) NULL,
    `porcentaje3` INTEGER NULL,
    `sustrato4Id` VARCHAR(191) NULL,
    `porcentaje4` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedByUserId` VARCHAR(191) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siembra_partdas` (
    `id` VARCHAR(191) NOT NULL,
    `partidaId` INTEGER NOT NULL,
    `anio` INTEGER NOT NULL,
    `indice` INTEGER NOT NULL,
    `metodoMaquina` BOOLEAN NOT NULL,
    `mezclaId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedByUserId` VARCHAR(191) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `siembra_partdas_partidaId_anio_indice_idx`(`partidaId`, `anio`, `indice`),
    INDEX `siembra_partdas_deletedByUserId_idx`(`deletedByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sustratos` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedByUserId` VARCHAR(191) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
