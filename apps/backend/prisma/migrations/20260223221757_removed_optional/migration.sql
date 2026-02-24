/*
  Warnings:

  - Made the column `isActive` on table `audit_logs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `audit_logs` MODIFY `isActive` BOOLEAN NOT NULL DEFAULT true;
