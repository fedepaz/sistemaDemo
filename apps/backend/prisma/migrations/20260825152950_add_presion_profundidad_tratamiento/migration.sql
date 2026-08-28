-- AlterTable
ALTER TABLE `siembra_partdas` ADD COLUMN `presionSemilla` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `profundidadSemilla` DECIMAL(5, 3) NOT NULL DEFAULT 0,
    ADD COLUMN `tratamientoSemilla` BOOLEAN NOT NULL DEFAULT false;
