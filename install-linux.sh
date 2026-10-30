#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.local-install"
PROJECT_NAME="lar-em-dia"

fail() { printf 'Erro: %s\n' "$*" >&2; exit 1; }

if [[ "$EUID" -eq 0 ]]; then
  fail "execute sem sudo (ex.: ./install-linux.sh); o script pedirá privilégios somente quando necessário."
fi
command -v sudo >/dev/null 2>&1 || fail "sudo não está instalado."
[[ -f "$SCRIPT_DIR/compose.yaml" && -f "$SCRIPT_DIR/Dockerfile" ]] || fail "compose.yaml ou Dockerfile não encontrado ao lado deste script."
[[ -f /etc/os-release ]] || fail "não foi possível identificar esta distribuição Linux."
source /etc/os-release

case "${ID:-}" in
  ubuntu)
    DOCKER_REPO_DISTRO="ubuntu"
    CODENAME="${UBUNTU_CODENAME:-${VERSION_CODENAME:-}}"
    ;;
  debian)
    DOCKER_REPO_DISTRO="debian"
    CODENAME="${VERSION_CODENAME:-}"
    ;;
  *)
    fail "sistema não suportado: ${PRETTY_NAME:-${ID:-desconhecido}}. Este instalador atende Ubuntu e Debian."
    ;;
esac
[[ -n "$CODENAME" ]] || fail "não foi possível detectar o codinome da distribuição."
ARCH="$(dpkg --print-architecture)"
[[ "$ARCH" == "amd64" || "$ARCH" == "arm64" ]] || fail "arquitetura não suportada pelo instalador: $ARCH (use amd64 ou arm64)."

sudo -v

install_docker() {
  if sudo docker compose version >/dev/null 2>&1; then
    return
  fi

  local conflicts=(docker.io docker-compose docker-doc podman-docker containerd runc)
  local installed=()
  for package in "${conflicts[@]}"; do
    if dpkg-query -W -f='${Status}' "$package" 2>/dev/null | grep -q 'install ok installed'; then
      installed+=("$package")
    fi
  done
  if ((${#installed[@]})); then
    fail "há pacotes Docker conflitantes instalados (${installed[*]}). Para evitar interromper containers existentes, remova-os manualmente ou configure Docker/Compose antes de repetir."
  fi

  printf 'Instalando Docker Engine e Docker Compose pelo repositório oficial…\n'
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl
  sudo install -m 0755 -d /etc/apt/keyrings
  local key_tmp
  key_tmp="$(mktemp)"
  curl -fsSL "https://download.docker.com/linux/$DOCKER_REPO_DISTRO/gpg" -o "$key_tmp"
  sudo install -m 0644 "$key_tmp" /etc/apt/keyrings/docker.asc
  rm -f "$key_tmp"
  sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/$DOCKER_REPO_DISTRO
Suites: $CODENAME
Components: stable
Architectures: $ARCH
Signed-By: /etc/apt/keyrings/docker.asc
EOF
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

install_docker
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl enable --now docker
fi
sudo docker info >/dev/null 2>&1 || fail "Docker não está respondendo. Verifique o serviço docker e tente novamente."
sudo docker compose version >/dev/null 2>&1 || fail "o plugin Docker Compose não está disponível."

if ! command -v curl >/dev/null 2>&1 || ! command -v openssl >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y curl openssl
fi

if [[ ! -e "$ENV_FILE" ]]; then
  temporary_env="$ENV_FILE.tmp.$$"
  umask 077
  {
    printf 'MYSQL_DATABASE=larfin\n'
    printf 'MYSQL_USER=larfin\n'
    printf 'MYSQL_ROOT_PASSWORD=%s\n' "$(openssl rand -hex 32)"
    printf 'MYSQL_PASSWORD=%s\n' "$(openssl rand -hex 32)"
    printf 'APP_PORT=3000\n'
  } > "$temporary_env"
  chmod 600 "$temporary_env"
  mv -n "$temporary_env" "$ENV_FILE"
  rm -f "$temporary_env"
  printf 'Credenciais locais criadas em .env.local-install com permissão restrita.\n'
else
  printf 'Mantendo .env.local-install existente; ele não será sobrescrito.\n'
fi
[[ ! -L "$ENV_FILE" ]] || fail ".env.local-install não pode ser um link simbólico."
[[ -f "$ENV_FILE" ]] || fail ".env.local-install não é um arquivo regular."
chmod 600 "$ENV_FILE"
read_setting() { sed -n "s/^$1=//p" "$ENV_FILE" | tail -n 1; }
MYSQL_DATABASE="$(read_setting MYSQL_DATABASE)"
MYSQL_USER="$(read_setting MYSQL_USER)"
MYSQL_ROOT_PASSWORD="$(read_setting MYSQL_ROOT_PASSWORD)"
MYSQL_PASSWORD="$(read_setting MYSQL_PASSWORD)"
APP_PORT="$(read_setting APP_PORT)"
[[ "$MYSQL_DATABASE" == "larfin" && "$MYSQL_USER" == "larfin" ]] || fail ".env.local-install deve usar MYSQL_DATABASE=larfin e MYSQL_USER=larfin."
[[ "$MYSQL_ROOT_PASSWORD" =~ ^[a-f0-9]{64}$ && "$MYSQL_PASSWORD" =~ ^[a-f0-9]{64}$ ]] || fail "as senhas locais devem ser os valores hexadecimais de 64 caracteres criados pelo instalador."
[[ "$APP_PORT" =~ ^[0-9]{4,5}$ ]] || fail "APP_PORT deve ser uma porta numérica entre 1024 e 65535."
PORT_NUMBER=$((10#$APP_PORT))
(( PORT_NUMBER >= 1024 && PORT_NUMBER <= 65535 )) || fail "APP_PORT deve estar entre 1024 e 65535."
APP_PORT="$PORT_NUMBER"

compose() {
  sudo docker compose --project-name "$PROJECT_NAME" --env-file "$ENV_FILE" --file "$SCRIPT_DIR/compose.yaml" --project-directory "$SCRIPT_DIR" "$@"
}

printf 'Construindo e iniciando Lar em Dia e MySQL…\n'
if ! compose up -d --build; then
  compose logs --tail=40 app db || true
  fail "não foi possível iniciar a aplicação. Confira as mensagens acima e execute o instalador novamente depois de corrigir a causa."
fi

for attempt in $(seq 1 150); do
  if curl -fsS "http://127.0.0.1:$APP_PORT/api/health" >/dev/null 2>&1; then
    printf '\nInstalação concluída. Abra: http://127.0.0.1:%s\n' "$APP_PORT"
    printf 'Banco: volume Docker persistente local_finance_data. Não use docker compose down -v.\n'
    printf 'Backup: execute ./backup-linux.sh. Guarde também .env.local-install em local seguro.\n'
    exit 0
  fi
  sleep 2
done

compose logs --tail=60 app db || true
fail "o serviço não ficou pronto dentro do tempo esperado. Os dados e o arquivo de credenciais foram preservados; confira os logs e execute ./install-linux.sh novamente."
