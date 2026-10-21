
-- Formula.nombre: required unique display name (VarChar(50)).
-- Backfills existing rows with their composition string (buildFormulaNombre format):
--   "Turf (60%) + Perlita (40%)", truncated to 50 chars, collision-safe suffixes.

-- 1) Add nullable column
ALTER TABLE `Formula` ADD COLUMN `nombre` VARCHAR(50) NULL;

-- 2) Backfill: composition string, truncated to 50 chars
UPDATE `Formula` f
JOIN `Producto` p1 ON p1.`id` = f.`producto1Id`
LEFT JOIN `Producto` p2 ON p2.`id` = f.`producto2Id`
LEFT JOIN `Producto` p3 ON p3.`id` = f.`producto3Id`
LEFT JOIN `Producto` p4 ON p4.`id` = f.`producto4Id`
SET f.`nombre` = LEFT(
  CONCAT(
    p1.`nombre`, ' (', f.`porcentaje1`, '%)',
    IF(f.`producto2Id` IS NOT NULL AND f.`porcentaje2` IS NOT NULL,
       CONCAT(' + ', p2.`nombre`, ' (', f.`porcentaje2`, '%)'), ''),
    IF(f.`producto3Id` IS NOT NULL AND f.`porcentaje3` IS NOT NULL,
       CONCAT(' + ', p3.`nombre`, ' (', f.`porcentaje3`, '%)'), ''),
    IF(f.`producto4Id` IS NOT NULL AND f.`porcentaje4` IS NOT NULL,
       CONCAT(' + ', p4.`nombre`, ' (', f.`porcentaje4`, '%)'), '')
  ), 50);

-- 3) Deduplicate (identical compositions / truncation) with deterministic suffixes
UPDATE `Formula` f
JOIN (
  SELECT `nombre`,
         ROW_NUMBER() OVER (PARTITION BY `nombre` ORDER BY `createdAt`, `id`) AS rn
  FROM `Formula`
) d ON d.`nombre` = f.`nombre` AND d.rn > 1
SET f.`nombre` = CONCAT(
  LEFT(f.`nombre`, 50 - LENGTH(CONCAT(' (', d.rn, ')'))),
  ' (', d.rn, ')'
);

-- 4) Enforce NOT NULL + uniqueness (index name matches Prisma convention)
ALTER TABLE `Formula` MODIFY COLUMN `nombre` VARCHAR(50) NOT NULL;
CREATE UNIQUE INDEX `Formula_nombre_key` ON `Formula`(`nombre`);
