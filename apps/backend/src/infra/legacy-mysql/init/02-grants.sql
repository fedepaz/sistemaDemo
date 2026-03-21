-- Create read-only user for NestJS app (prevents accidental writes)
CREATE USER IF NOT EXISTS 'nestjs_legacy'@'%' IDENTIFIED BY 'readonly_pass';
GRANT SELECT ON martin3.* TO 'nestjs_legacy'@'%';
FLUSH PRIVILEGES;