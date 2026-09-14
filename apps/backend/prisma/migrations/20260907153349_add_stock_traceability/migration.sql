-- AlterTable
ALTER TABLE `siembra_partdas` ADD COLUMN `stockAnio` INTEGER NULL,
    ADD COLUMN `stockEntradasAntes` DECIMAL(12, 2) NULL,
    ADD COLUMN `stockEntradasDespues` DECIMAL(12, 2) NULL,
    ADD COLUMN `stockLote` INTEGER NULL,
    ADD COLUMN `stockSalidasAntes` DECIMAL(12, 2) NULL,
    ADD COLUMN `stockSalidasDespues` DECIMAL(12, 2) NULL;
