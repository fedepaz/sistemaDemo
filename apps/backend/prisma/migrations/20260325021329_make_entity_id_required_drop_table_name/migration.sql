/*
  Warnings:

  - You are about to drop the column `tableName` on the `user_permissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,entityId]` on the table `user_permissions` will be added. If there are existing duplicate values, this will fail.
  - Made the column `entityId` on table `user_permissions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `user_permissions_tableName_idx` ON `user_permissions`;

-- DropIndex
DROP INDEX `user_permissions_userId_tableName_key` ON `user_permissions`;

-- AlterTable
ALTER TABLE `user_permissions` DROP COLUMN `tableName`,
    MODIFY `scope` ENUM('NONE', 'OWN', 'ALL') NOT NULL DEFAULT 'ALL',
    MODIFY `entityId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `user_permissions_entityId_idx` ON `user_permissions`(`entityId`);

-- CreateIndex
CREATE UNIQUE INDEX `user_permissions_userId_entityId_key` ON `user_permissions`(`userId`, `entityId`);
