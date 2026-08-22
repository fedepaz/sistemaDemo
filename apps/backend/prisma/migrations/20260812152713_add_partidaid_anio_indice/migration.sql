/*
  Warnings:

  - Added the required column `anio` to the `taskShifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `indice` to the `taskShifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partidaId` to the `taskShifts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `taskShifts` ADD COLUMN `anio` INTEGER NOT NULL,
    ADD COLUMN `indice` INTEGER NOT NULL,
    ADD COLUMN `partidaId` INTEGER NOT NULL;
