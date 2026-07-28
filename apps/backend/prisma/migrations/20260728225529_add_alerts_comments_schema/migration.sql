-- CreateTable
CREATE TABLE `alert_comments` (
    `id` VARCHAR(191) NOT NULL,
    `alertType` VARCHAR(30) NOT NULL,
    `partidaId` INTEGER NOT NULL,
    `anio` INTEGER NOT NULL,
    `indice` INTEGER NOT NULL,
    `content` VARCHAR(500) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `alert_comments_alertType_partidaId_anio_indice_idx`(`alertType`, `partidaId`, `anio`, `indice`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
