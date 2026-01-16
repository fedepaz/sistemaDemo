/*
  Warnings:

  - You are about to alter the column `action` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `entityType` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `audit_logs` MODIFY `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS') NOT NULL,
    MODIFY `entityType` ENUM('USER', 'TENANT', 'ROLE', 'AUDIT_LOG', 'LOCALE', 'MESSAGE', 'USER_PREFERENCE') NOT NULL;

-- CreateIndex
CREATE INDEX `audit_logs_action_idx` ON `audit_logs`(`action`);
