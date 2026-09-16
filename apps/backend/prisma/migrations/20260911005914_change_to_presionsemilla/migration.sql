/*
  Warnings:

  - You are about to drop the column `presionSemilla` on the `siembra_partdas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `siembra_partdas` DROP COLUMN `presionSemilla`,
    ADD COLUMN `prensadoSemilla` DECIMAL(3, 1) NOT NULL DEFAULT 0;
