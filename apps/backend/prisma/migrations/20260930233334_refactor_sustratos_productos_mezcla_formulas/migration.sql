-- Rename: sustrato → producto, mezcla → formula (RENAME-based, non-destructive)
--
-- Replaces the DROP+CREATE draft: tables/columns keep their data.
-- Apply ONLY together with the code that depends on it (Task 9 handoff):
-- nav/guards 403 until the `entities` UPDATE below lands; open sessions
-- hold the old permission map until re-login.
--
-- Notes:
-- - MySQL/MariaDB updates FK definitions automatically on RENAME; FK
--   *constraint* names (e.g. `SiembraPartidas_mezclaId_fkey`) stay stale —
--   cosmetic only; MariaDB cannot rename constraints without drop/recreate.
-- - The generic record (`'Sustrato Genérico'`, cuids c000...001/c000...002)
--   is data and is intentionally untouched.
-- - No @@map on Formula/Producto models, so table names = model names.

-- 1) Tables
RENAME TABLE `Mezcla` TO `Formula`, `Sustratos` TO `Producto`;

-- 2) Formula slot columns
ALTER TABLE `Formula`
  RENAME COLUMN `sustrato1Id` TO `producto1Id`,
  RENAME COLUMN `sustrato2Id` TO `producto2Id`,
  RENAME COLUMN `sustrato3Id` TO `producto3Id`,
  RENAME COLUMN `sustrato4Id` TO `producto4Id`;

-- 3) SiembraPartidas FK column (table is `siembra_partdas`, note the @@map typo)
ALTER TABLE `siembra_partdas` RENAME COLUMN `mezclaId` TO `formulaId`;

-- 4) Permission entities — the ONLY permission data change needed
--    (user_permissions links by entityId FK, no string columns to fix)
UPDATE `entities` SET `name`='formulas',  `label`='Fórmulas'  WHERE `name`='mezclas';
UPDATE `entities` SET `name`='productos', `label`='Productos' WHERE `name`='sustratos';

-- 5) Optional cosmetics so a future `prisma migrate diff` stays quiet
ALTER TABLE `Producto` RENAME INDEX `Sustratos_nombre_key` TO `Producto_nombre_key`;
