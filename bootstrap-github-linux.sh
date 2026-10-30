#!/usr/bin/env bash
set -Eeuo pipefail

REPOSITORY_URL="${LARFIN_REPOSITORY_URL:-git@github.com:Ricardo-Santos-Tostas/finan-as-lar-em-dia.git}"
BRANCH="${LARFIN_BRANCH:-main}"
INSTALL_DIR="${LARFIN_INSTALL_DIR:-$HOME/lar-em-dia}"
fail() { printf 'Erro: %s\n' "$*" >&2; exit 1; }

[[ "$EUID" -ne 0 ]] || fail "execute como usuário normal, sem sudo; o script chamará sudo quando necessário."
command -v sudo >/dev/null 2>&1 || fail "sudo não está instalado."
[[ "$BRANCH" =~ ^[A-Za-z0-9._/-]+$ && "$BRANCH" != -* ]] || fail "nome de branch inválido."
case "$REPOSITORY_URL" in
  git@github.com:Ricardo-Santos-Tostas/finan-as-lar-em-dia.git|https://github.com/Ricardo-Santos-Tostas/finan-as-lar-em-dia.git) ;;
  *) fail "URL não permitida. Defina LARFIN_REPOSITORY_URL como o repositório GitHub informado, por SSH ou HTTPS." ;;
esac

if [[ ! -f /etc/os-release ]]; then fail "não foi possível identificar a distribuição Linux."; fi
source /etc/os-release
case "${ID:-}" in
  ubuntu|debian) ;;
  *) fail "este bootstrap atende Ubuntu e Debian com APT." ;;
esac

packages=()
command -v git >/dev/null 2>&1 || packages+=(git)
command -v ssh >/dev/null 2>&1 || packages+=(openssh-client)
if ((${#packages[@]})); then
  sudo apt-get update
  sudo apt-get install -y "${packages[@]}"
fi

if [[ -e "$INSTALL_DIR" ]]; then
  [[ -d "$INSTALL_DIR/.git" ]] || fail "o destino já existe e não é um repositório Git: $INSTALL_DIR. Nada foi alterado."
  repo_root="$(git -C "$INSTALL_DIR" rev-parse --show-toplevel 2>/dev/null)" || fail "não foi possível identificar o repositório em $INSTALL_DIR."
  install_root="$(cd -- "$INSTALL_DIR" && pwd -P)"
  [[ "$repo_root" == "$install_root" ]] || fail "o destino aponta para um subdiretório Git; escolha a raiz com LARFIN_INSTALL_DIR."
  current_remote="$(git -C "$INSTALL_DIR" remote get-url origin 2>/dev/null)" || fail "o repositório existente não tem o remote origin esperado."
  [[ "$current_remote" == "$REPOSITORY_URL" ]] || fail "o remote origin existente é diferente do repositório solicitado; nada foi alterado."
  [[ "$(git -C "$INSTALL_DIR" branch --show-current)" == "$BRANCH" ]] || fail "o checkout existente não está na branch $BRANCH; selecione-o manualmente antes de atualizar."
  [[ -z "$(git -C "$INSTALL_DIR" status --porcelain --untracked-files=normal)" ]] || fail "há alterações locais no checkout. Salve-as antes de atualizar; nada foi sobrescrito."
  printf 'Buscando atualizações de %s (%s)…\n' "$REPOSITORY_URL" "$BRANCH"
  git -C "$INSTALL_DIR" fetch origin "$BRANCH" || fail "falha ao acessar o GitHub. Verifique a chave SSH/permissão do repositório ou use LARFIN_REPOSITORY_URL com HTTPS para um repositório público."
  git -C "$INSTALL_DIR" merge --ff-only "origin/$BRANCH" || fail "a atualização não pode ser aplicada em fast-forward. O checkout foi preservado."
else
  mkdir -p -- "$(dirname -- "$INSTALL_DIR")"
  printf 'Clonando %s (%s) para %s…\n' "$REPOSITORY_URL" "$BRANCH" "$INSTALL_DIR"
  git clone --branch "$BRANCH" --depth 1 "$REPOSITORY_URL" "$INSTALL_DIR" || fail "falha ao clonar. Confirme que o repositório e a branch existem e que este servidor tem acesso GitHub (chave SSH para URL SSH; HTTPS para repositório público)."
fi

[[ -f "$INSTALL_DIR/install-linux.sh" && -f "$INSTALL_DIR/compose.yaml" ]] || fail "o Git foi clonado, mas não encontrou install-linux.sh e compose.yaml. O repositório ainda precisa receber os arquivos do Lar em Dia."
cd -- "$INSTALL_DIR"
chmod +x install-linux.sh backup-linux.sh restore-linux.sh
printf 'Código atualizado sem sobrescrever alterações locais. Iniciando o setup Docker/MySQL…\n'
exec ./install-linux.sh
