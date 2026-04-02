-- CreateTable
CREATE TABLE `entities` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `label` VARCHAR(50) NOT NULL,
    `permissionType` ENUM('CRUD', 'PROCESS', 'READ_ONLY') NOT NULL DEFAULT 'CRUD',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedByUserId` VARCHAR(191) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    UNIQUE INDEX `entities_name_key`(`name`),
    INDEX `entities_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
