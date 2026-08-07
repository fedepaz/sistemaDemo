chore(scripts): make legacy-update.sh executable and use remote mysqldump path

- chmod +x for direct execution
- Add MYSQLDUMP_REMOTE variable with Windows MariaDB path
- Update ssh command to use full remote mysqldump path
