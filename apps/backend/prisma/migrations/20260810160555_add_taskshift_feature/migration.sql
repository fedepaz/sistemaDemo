-- CreateTable
CREATE TABLE `taskShifts` (
    `id` VARCHAR(191) NOT NULL,
    `createdByUserId` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` TIMESTAMP(0) NULL,
    `deletedByUserId` VARCHAR(191) NULL,

    INDEX `taskShifts_createdByUserId_idx`(`createdByUserId`),
    INDEX `taskShifts_entityId_idx`(`entityId`),
    INDEX `taskShifts_startTime_idx`(`startTime`),
    INDEX `taskShifts_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taskShiftEmployees` (
    `id` VARCHAR(191) NOT NULL,
    `taskShiftId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `taskShiftEmployees_taskShiftId_idx`(`taskShiftId`),
    INDEX `taskShiftEmployees_userId_idx`(`userId`),
    UNIQUE INDEX `taskShiftEmployees_taskShiftId_userId_key`(`taskShiftId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
