-- CreateIndex
CREATE INDEX `entities_deletedByUserId_idx` ON `entities`(`deletedByUserId`);

-- CreateIndex
CREATE INDEX `user_permissions_deletedByUserId_idx` ON `user_permissions`(`deletedByUserId`);

-- CreateIndex
CREATE INDEX `users_deletedByUserId_idx` ON `users`(`deletedByUserId`);
