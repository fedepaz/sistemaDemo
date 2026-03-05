-- AlterTable
ALTER TABLE `audit_logs` ADD COLUMN `deletedAt` TIMESTAMP(0) NULL,
    ADD COLUMN `deletedByUserId` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NULL DEFAULT true;
