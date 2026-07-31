/*
  Warnings:

  - You are about to drop the column `authorId` on the `alert_comments` table. All the data in the column will be lost.
  - Added the required column `userId` to the `alert_comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `alert_comments` DROP COLUMN `authorId`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;
