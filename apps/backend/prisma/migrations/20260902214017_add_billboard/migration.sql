/*
  Warnings:

  - You are about to alter the column `tratamientoSemilla` on the `siembra_partdas` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `siembra_partdas` MODIFY `tratamientoSemilla` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `billboard_messages` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `body` VARCHAR(500) NOT NULL,
    `tag` VARCHAR(50) NOT NULL,
    `permissionTable` VARCHAR(50) NOT NULL,
    `permissionAction` VARCHAR(20) NOT NULL,
    `permissionScope` VARCHAR(10) NOT NULL,
    `targetNewUsers` BOOLEAN NOT NULL DEFAULT false,
    `effectiveFrom` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedByUserId` VARCHAR(191) NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    INDEX `billboard_messages_tag_idx`(`tag`),
    INDEX `billboard_messages_isActive_deletedAt_idx`(`isActive`, `deletedAt`),
    INDEX `billboard_messages_deletedByUserId_idx`(`deletedByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_billboard_reads` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `billboardMessageId` VARCHAR(191) NOT NULL,
    `readAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_billboard_reads_userId_idx`(`userId`),
    INDEX `user_billboard_reads_billboardMessageId_idx`(`billboardMessageId`),
    UNIQUE INDEX `user_billboard_reads_userId_billboardMessageId_key`(`userId`, `billboardMessageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
