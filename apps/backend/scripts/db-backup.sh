#!/usr/bin/env bash
set -euo pipefail

# Elige la connection string según el entorno: DATABASE_URL tiene prioridad
# si está seteada a mano; si no, usa DATABASE_PROD_URL o DATABASE_DEV_URL
# según BACKEND_NODE_ENV.
if [ -n "${DATABASE_URL:-}" ]; then
  DB_URL="$DATABASE_URL"
elif [ "${BACKEND_NODE_ENV:-development}" = "production" ]; then
  DB_URL="${DATABASE_PROD_URL:?DATABASE_PROD_URL no está seteada}"
else
  DB_URL="${DATABASE_DEV_URL:?DATABASE_DEV_URL no está seteada}"
fi

# Parseo básico de mysql://user:pass@host:port/dbname
DB_USER=$(echo "$DB_URL" | sed -E 's|mysql://([^:]+):.*|\1|')
DB_PASS=$(echo "$DB_URL" | sed -E 's|mysql://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "$DB_URL" | sed -E 's|.*@([^:/]+).*|\1|')
DB_PORT=$(echo "$DB_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
DB_NAME=$(echo "$DB_URL" | sed -E 's|.*/([^?]+).*|\1|')

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

echo "→ Dumpeando $DB_NAME a $BACKUP_FILE ..."
mysqldump --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"

echo "→ Backup OK ($(du -h "$BACKUP_FILE" | cut -f1))"

# Conserva solo los últimos 10 backups
cd "$BACKUP_DIR" && ls -t "${DB_NAME}"_*.sql | tail -n +11 | xargs -r rm --