/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Sustratos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Sustratos_nombre_key` ON `Sustratos`(`nombre`);
