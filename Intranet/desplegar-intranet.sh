#!/usr/bin/env bash
set -Eeuo pipefail

# Despliegue repetible de la intranet por GitHub -> Railway.
# Uso: ./desplegar-intranet.sh "Mensaje del cambio"

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BRANCH="main"

fail() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

command -v npm >/dev/null 2>&1 || fail "npm no está disponible en el PATH."
command -v git >/dev/null 2>&1 || fail "git no está disponible en el PATH."

cd "$APP_DIR"

printf '\n==> Validando la intranet\n'
if [[ ! -d node_modules ]]; then
  npm ci
fi
npm run lint
npm run build

MESSAGE="${1:-}"
if [[ -z "$MESSAGE" ]]; then
  read -r -p "Mensaje para el commit (vacío cancela): " MESSAGE
fi

if [[ -z "$MESSAGE" ]]; then
  fail "Despliegue cancelado: se necesita un mensaje de commit."
fi

CURRENT_BRANCH="$(git -C "$APP_DIR/.." branch --show-current)"
[[ "$CURRENT_BRANCH" == "$BRANCH" ]] || fail "Estás en '$CURRENT_BRANCH'; cambia a '$BRANCH' antes de desplegar."

printf '\n==> Enviando cambios a GitHub\n'
git -C "$APP_DIR/.." add -A
if ! git -C "$APP_DIR/.." diff --cached --quiet; then
  git -C "$APP_DIR/.." commit -m "$MESSAGE"
fi
git -C "$APP_DIR/.." -c http.version=HTTP/1.1 push origin "$BRANCH"

printf '\n==> Push completado. Railway desplegará automáticamente Intranet.\n'
printf 'URL: https://intranet-production-a9d0.up.railway.app\n'
