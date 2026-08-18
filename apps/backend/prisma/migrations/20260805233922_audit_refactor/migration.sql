-- AlterTable
ALTER TABLE `audit_logs` MODIFY `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'ACCESS', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'PROFILE_UPDATE', 'MFA_ENABLE', 'MFA_DISABLE') NOT NULL,
    MODIFY `entityType` ENUM('USER', 'TENANT', 'ROLE', 'LOCALE', 'MESSAGE', 'USER_PREFERENCE', 'AUDIT_LOG', 'UNKNOWN') NOT NULL;

-- CreateIndex
CREATE INDEX `audit_logs_timestamp_idx` ON `audit_logs`(`timestamp`);
