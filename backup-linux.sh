#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.local-install"
BACKUP_DIR="$SCRIPT_DIR/backups"
PROJECT_NAME="lar-em-dia"
[[ "$EUID" -ne 0 ]] || { printf 'Execute sem sudo; o script chamará sudo quando necessário.\n' >&2; exit 1; }
[[ -f "$ENV_FILE" ]] || { printf 'Execute primeiro ./install-linux.sh.\n' >&2; exit 1; }
command -v sudo >/dev/null 2>&1 || { printf 'sudo não está instalado.\n' >&2; exit 1; }
command -v gzip >/dev/null 2>&1 || { printf 'gzip não está instalado.\n' >&2; exit 1; }
sudo -v
umask 077
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

compose=(sudo docker compose --project-name "$PROJECT_NAME" --env-file "$ENV_FILE" --file "$SCRIPT_DIR/compose.yaml" --project-directory "$SCRIPT_DIR")
timestamp="$(date +%Y%m%d-%H%M%S-%N)"
output="$BACKUP_DIR/lar-em-dia-$timestamp.sql.gz"
temporary="$BACKUP_DIR/.lar-em-dia-$timestamp.tmp.gz"
trap 'rm -f "$temporary"' EXIT

"${compose[@]}" exec -T db sh -ec 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqldump --user="$MYSQL_USER" --single-transaction --no-tablespaces "$MYSQL_DATABASE"' | gzip -c > "$temporary"
chmod 600 "$temporary"
mv "$temporary" "$output"
printf 'Backup criado: %s\n' "$output"
printf 'Proteja também .env.local-install; ele contém as credenciais necessárias ao banco.\n'
