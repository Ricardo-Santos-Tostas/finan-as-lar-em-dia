#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.local-install"
PROJECT_NAME="lar-em-dia"
fail() { printf 'Erro: %s\n' "$*" >&2; exit 1; }

[[ "$EUID" -ne 0 ]] || fail "execute sem sudo; o script chamará sudo quando necessário."
[[ -f "$ENV_FILE" ]] || fail "arquivo .env.local-install não encontrado; execute ./install-linux.sh primeiro."
[[ "$#" -eq 1 ]] || fail "uso: ./restore-linux.sh caminho/para/backup.sql.gz"
command -v gzip >/dev/null 2>&1 || fail "gzip não está instalado."
BACKUP_FILE="$(realpath -- "$1")"
[[ -f "$BACKUP_FILE" ]] || fail "arquivo de backup não encontrado: $BACKUP_FILE"
gzip -t "$BACKUP_FILE" || fail "o arquivo gzip está incompleto ou inválido."

printf '\nATENÇÃO: restaurar substituirá as tabelas financeiras locais pelo conteúdo deste backup.\n'
printf 'Um backup de segurança do estado atual será criado antes da operação.\n'
read -r -p 'Digite SUBSTITUIR DADOS FINANCEIROS para continuar: ' confirmation
[[ "$confirmation" == "SUBSTITUIR DADOS FINANCEIROS" ]] || { printf 'Restauração cancelada; nada foi alterado.\n'; exit 0; }
sudo -v
"$SCRIPT_DIR/backup-linux.sh"

compose() {
  sudo docker compose --project-name "$PROJECT_NAME" --env-file "$ENV_FILE" --file "$SCRIPT_DIR/compose.yaml" --project-directory "$SCRIPT_DIR" "$@"
}
APP_PORT="$(sed -n 's/^APP_PORT=//p' "$ENV_FILE" | tail -n 1)"
compose stop app
compose up -d db

healthy=0
for attempt in $(seq 1 90); do
  if compose exec -T db sh -ec 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqladmin ping -h 127.0.0.1 --user="$MYSQL_USER" --silent' >/dev/null 2>&1; then
    healthy=1
    break
  fi
  sleep 2
done
[[ "$healthy" -eq 1 ]] || fail "o MySQL não ficou pronto; o app permaneceu parado e os dados atuais foram preservados."

if ! gunzip -c "$BACKUP_FILE" | compose exec -T db sh -ec 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysql --user="$MYSQL_USER" "$MYSQL_DATABASE"'; then
  compose up -d app || true
  fail "a importação falhou. O backup de segurança do estado anterior está em backups/; confira antes de tentar novamente."
fi
compose up -d app

for attempt in $(seq 1 90); do
  if curl -fsS "http://127.0.0.1:${APP_PORT:-3000}/api/health" >/dev/null 2>&1; then
    printf 'Restauração concluída. O app foi iniciado novamente em http://127.0.0.1:%s\n' "${APP_PORT:-3000}"
    exit 0
  fi
  sleep 2
done
compose logs --tail=40 app db || true
fail "os dados foram importados, mas o app não ficou saudável. Verifique os logs e execute ./install-linux.sh para iniciar os serviços."
