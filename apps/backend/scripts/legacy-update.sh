#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env not found at $ENV_FILE" >&2
  exit 1
fi

# shellcheck source=../.env
source "$ENV_FILE"

for var in SSH_HOST DATABASE_LEGACY_NAME DATABASE_LEGACY_USERNAME DATABASE_LEGACY_PASSWORD; do
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: $var is not set in .env" >&2
    exit 1
  fi
done

SSH_HOST="$SSH_HOST"
DB_NAME="$DATABASE_LEGACY_NAME"
DB_USER="$DATABASE_LEGACY_USERNAME"
DB_PASS="$DATABASE_LEGACY_PASSWORD"
YEAR_FROM=2025
MYSQLDUMP_REMOTE='"C:/Program Files/MariaDB 10.11/bin/mysqldump.exe"'

OUTPUT_DIR="./legacy_update_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

# Tablas con columna "ano" genérica (confirmadas contra information_schema)
TABLES=(
  partidas partidas1 partidas2 partidas3 partidas4 partidas_recorrido
  orden_cl orden_cl_aromaticas orden_c orden_carga orden_carga_a
  orden_compra orden_compra_c orden_retiro
  st_sem st_sem_item st_sem_movim st_sem_observ
  semanas pedidos cierre fondo ivac articulo_registros_partidas
)

echo "→ Dumpeando ${#TABLES[@]} tablas, ano >= $YEAR_FROM, desde $SSH_HOST ..."

for TABLE in "${TABLES[@]}"; do
  OUT_FILE="$OUTPUT_DIR/${TABLE}_${YEAR_FROM}plus.sql"
  echo "  - $TABLE ..."
  ssh "$SSH_HOST" "$MYSQLDUMP_REMOTE -u $DB_USER -p$DB_PASS --no-create-info --single-transaction --where=\"ano >= $YEAR_FROM\" $DB_NAME $TABLE" > "$OUT_FILE" 2>"$OUTPUT_DIR/${TABLE}.err" \
    || echo "    ⚠ falló $TABLE, ver $OUTPUT_DIR/${TABLE}.err"
done

echo ""
echo "→ Listo. Archivos en $OUTPUT_DIR"
echo "→ Revisá antes de importar. Filas por tabla:"
for TABLE in "${TABLES[@]}"; do
  OUT_FILE="$OUTPUT_DIR/${TABLE}_${YEAR_FROM}plus.sql"
  if [ -f "$OUT_FILE" ]; then
    COUNT=$(grep -c "^INSERT INTO" "$OUT_FILE" 2>/dev/null || echo 0)
    echo "  $TABLE: $COUNT línea(s) de INSERT"
  fi
done