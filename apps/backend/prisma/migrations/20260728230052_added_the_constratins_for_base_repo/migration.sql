-- AlterTable
ALTER TABLE `alert_comments` ADD COLUMN `deletedAt` TIMESTAMP(0) NULL,
    ADD COLUMN `deletedByUserId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `alert_comments_deletedByUserId_idx` ON `alert_comments`(`deletedByUserId`);
