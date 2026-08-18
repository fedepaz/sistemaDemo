-- Allow anonymous audit events (e.g. LOGIN_FAILED for unknown users) to be
-- persisted. tenantId/userId reference User/Tenant rows; when there is no
-- authenticated identity they are now NULL instead of a fake value that
-- violates the foreign keys and silently drops the audit record.

ALTER TABLE `audit_logs` MODIFY `tenantId` VARCHAR(191) NULL,
MODIFY `userId` VARCHAR(191) NULL;
