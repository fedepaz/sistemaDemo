/*
  Warnings:

  - A unique constraint covering the columns `[partidaId,anio,indice]` on the table `siembra_partdas` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `siembra_partdas_partidaId_anio_indice_idx` ON `siembra_partdas`;

-- CreateIndex
CREATE UNIQUE INDEX `siembra_partdas_partidaId_anio_indice_key` ON `siembra_partdas`(`partidaId`, `anio`, `indice`);
