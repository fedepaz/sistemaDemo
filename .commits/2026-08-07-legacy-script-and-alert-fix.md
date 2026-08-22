fix(alerts): show past-due indicator for overdue siembra dates and add legacy DB dump script

- alert-columns: change isToday to isPastDue so the warning dot
  appears for any date before today, not only the current day
- Add apps/backend/scripts/legacy-update.sh for one-off mysqldump
  of legacy martin3 tables via SSH (reads credentials from .env)
- Document SSH_HOST in .env.example for legacy scripts
- Move commit message file from app/.commits/ to .commits/
