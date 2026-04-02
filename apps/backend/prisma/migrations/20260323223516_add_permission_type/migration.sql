-- AlterTable
ALTER TABLE `user_permissions` ADD COLUMN `permissionType` ENUM('CRUD', 'PROCESS', 'READ_ONLY') NOT NULL DEFAULT 'CRUD';
