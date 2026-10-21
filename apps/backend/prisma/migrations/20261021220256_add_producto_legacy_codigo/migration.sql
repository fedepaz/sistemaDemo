/*
  Warnings:

  - A unique constraint covering the columns `[legacyCodigo]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Producto` ADD COLUMN `legacyCodigo` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Producto_legacyCodigo_key` ON `Producto`(`legacyCodigo`);
