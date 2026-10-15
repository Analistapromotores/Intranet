#!/usr/bin/env bash
# Renueva los certificados Let's Encrypt del proxy (GLPI e Intranet) con el reto DNS.
# No necesita abrir puertos hacia Internet: solo hay que crear el registro TXT que el script muestra.
#
# Uso (en el servidor):
#   sudo ~/intranet/despliegue-local/proxy/certbot/renovar-certificados.sh            # renueva los que vencen en < 30 días
#   sudo ~/intranet/despliegue-local/proxy/certbot/renovar-certificados.sh estado     # solo muestra los días que quedan
#   sudo ~/intranet/despliegue-local/proxy/certbot/renovar-certificados.sh intranet   # solo uno (intranet | glpi)
#   Opciones: --forzar (renovar aunque no venza pronto)   --prueba (contra el entorno de pruebas, no cambia nada)
#
# Qué hace: por cada certificado, muestra el TXT a crear, espera hasta verlo publicado en los DNS
# de la zona, deja que Let's Encrypt lo valide, copia el certificado a ~/proxy/nginx/certs/<sitio>/
# y recarga nginx sin corte.
set -euo pipefail

ZONA="gestionyservicios.com.co"
SITIOS=(intranet glpi)                 # carpeta en ~/proxy/nginx/certs/ y subdominio de ZONA
DIAS_MINIMOS=30
ESPERA_MAX_MIN=60
CONTENEDOR="${CONTENEDOR:-proxy-nginx-1}"

YO="$(readlink -f "$0")"
usuario="${SUDO_USER:-$(id -un)}"
PROXY_DIR="${PROXY_DIR:-$(getent passwd "$usuario" | cut -d: -f6)/proxy}"

say() { printf '%b\n' "$*" > /dev/tty; }

# ─── Hooks que llama certbot (el mismo script, con un argumento) ────────────────────────────────

servidores_dns() {
  local ns
  ns="$(dig +short NS "$ZONA" 2>/dev/null | sed 's/\.$//')"
  [ -n "$ns" ] && echo "$ns" || printf '1.1.1.1\n8.8.8.8\n'
}

esperar_txt() {
  local nombre="$1" valor="$2" ns total vistos limite
  if ! command -v dig >/dev/null; then
    say "  (dig no está instalado: sudo apt install dnsutils)"
    say "  Presiona Enter cuando hayas creado el registro y hayan pasado unos minutos..."
    read -r < /dev/tty
    return
  fi
  mapfile -t ns < <(servidores_dns)
  total=${#ns[@]}
  limite=$(( $(date +%s) + ESPERA_MAX_MIN * 60 ))
  while :; do
    vistos=0
    for s in "${ns[@]}"; do
      dig +short TXT "$nombre" @"$s" 2>/dev/null | tr -d '"' | grep -qxF "$valor" && vistos=$((vistos + 1))
    done
    if [ "$vistos" -eq "$total" ]; then
      say "  ✔ Registro visible en los $total servidores DNS de $ZONA. Validando con Let's Encrypt..."
      sleep 10
      return
    fi
    if [ "$(date +%s)" -ge "$limite" ]; then
      say "  ✖ Pasaron $ESPERA_MAX_MIN min sin ver el registro. Se intenta validar de todas formas."
      return
    fi
    printf '\r  %s  visible en %d/%d servidores DNS... ' "$(date +%H:%M:%S)" "$vistos" "$total" > /dev/tty
    if read -r -t 20 < /dev/tty; then
      say "  Continuando sin esperar (Enter)."
      return
    fi
  done
}

if [ "${1:-}" = "--auth-hook" ]; then
  nombre="_acme-challenge.${CERTBOT_DOMAIN}"
  say ""
  say "┌──────────────────────────────────────────────────────────────────────"
  say "│  Crear en el DNS de ${ZONA} (Colombia Hosting):"
  say "│"
  say "│    Tipo:    TXT"
  say "│    Nombre:  ${nombre%."$ZONA"}"
  say "│    Valor:   ${CERTBOT_VALIDATION}"
  say "│    TTL:     300 (o el mínimo que permita)"
  say "│"
  say "│  Si ya hay un TXT con ese nombre de una renovación anterior, reemplazar su valor."
  say "└──────────────────────────────────────────────────────────────────────"
  say "  Esperando a que se publique (Enter = continuar sin esperar, Ctrl+C = cancelar)"
  esperar_txt "$nombre" "$CERTBOT_VALIDATION"
  exit 0
fi

if [ "${1:-}" = "--cleanup-hook" ]; then
  say "  Listo con ${CERTBOT_DOMAIN}. El TXT _acme-challenge.${CERTBOT_DOMAIN%."$ZONA"} ya se puede borrar (o dejarlo para la próxima)."
  exit 0
fi

# ─── Programa principal ────────────────────────────────────────────────────────────────────────

dias_restantes() {   # días hasta el vencimiento del certificado que usa nginx; -1 si no existe
  local pem="$PROXY_DIR/nginx/certs/$1/fullchain.pem" fin
  [ -f "$pem" ] || { echo -1; return; }
  fin="$(openssl x509 -enddate -noout -in "$pem" | cut -d= -f2)"
  echo $(( ($(date -d "$fin" +%s) - $(date +%s)) / 86400 ))
}

estado() {
  for sitio in "${SITIOS[@]}"; do
    d="$(dias_restantes "$sitio")"
    if [ "$d" -lt 0 ]; then echo "  $sitio.$ZONA: sin certificado en $PROXY_DIR/nginx/certs/$sitio/"
    elif [ "$d" -le "$DIAS_MINIMOS" ]; then echo "  $sitio.$ZONA: vence en $d días → renovar"
    else echo "  $sitio.$ZONA: vigente, $d días"
    fi
  done
}

instalar() {   # copia el certificado de certbot a la carpeta del proxy
  local sitio="$1" dominio="$2" destino="$PROXY_DIR/nginx/certs/$1"
  mkdir -p "$destino"
  cp -L "/etc/letsencrypt/live/$dominio/fullchain.pem" "/etc/letsencrypt/live/$dominio/privkey.pem" "$destino/"
  chown -R "$(stat -c %u:%g "$PROXY_DIR")" "$destino"
  chmod 600 "$destino/privkey.pem"
  echo "  Copiado a $destino"
}

recargar_nginx() {   # sin corte; si la configuración falla, nginx sigue con la anterior
  if ! docker ps --format '{{.Names}}' | grep -qx "$CONTENEDOR"; then
    echo "  $CONTENEDOR no está corriendo: tomará los certificados al arrancar."
    return
  fi
  docker exec "$CONTENEDOR" nginx -t -q && docker exec "$CONTENEDOR" nginx -s reload && echo "  nginx recargado."
}

[ "$(id -u)" -eq 0 ] || { echo "Ejecutar con sudo: sudo $0 $*"; exit 1; }
command -v certbot >/dev/null || { echo "Falta certbot (sudo apt install certbot)."; exit 1; }
[ -d "$PROXY_DIR/nginx/certs" ] || { echo "No existe $PROXY_DIR/nginx/certs (definir PROXY_DIR=...)."; exit 1; }

objetivo=todos; forzar=0; prueba=0
for a in "$@"; do
  case "$a" in
    estado) estado; exit 0 ;;
    todos|intranet|glpi) objetivo="$a" ;;
    --forzar) forzar=1 ;;
    --prueba) prueba=1 ;;
    *) echo "Opción desconocida: $a"; sed -n '5,9p' "$YO"; exit 1 ;;
  esac
done
[ "$objetivo" = todos ] && lista=("${SITIOS[@]}") || lista=("$objetivo")

echo "Certificados (${PROXY_DIR}/nginx/certs):"
estado
renovados=0
for sitio in "${lista[@]}"; do
  dominio="$sitio.$ZONA"
  d="$(dias_restantes "$sitio")"
  if [ "$forzar" -eq 0 ] && [ "$prueba" -eq 0 ] && [ "$d" -gt "$DIAS_MINIMOS" ]; then
    continue
  fi
  echo ""
  echo "═══ $dominio ═══"
  extra=(); [ "$prueba" -eq 1 ] && extra=(--dry-run)
  certbot certonly --manual --preferred-challenges dns \
    --manual-auth-hook "$(printf '%q' "$YO") --auth-hook" \
    --manual-cleanup-hook "$(printf '%q' "$YO") --cleanup-hook" \
    -d "$dominio" --cert-name "$dominio" \
    --force-renewal --non-interactive --agree-tos "${extra[@]}"
  if [ "$prueba" -eq 1 ]; then
    echo "  Prueba correcta para $dominio (no se cambió ningún certificado)."
  else
    instalar "$sitio" "$dominio"
    renovados=$((renovados + 1))
  fi
done

echo ""
if [ "$renovados" -gt 0 ]; then
  recargar_nginx
  echo ""
  echo "Estado final:"
  estado
elif [ "$prueba" -eq 0 ]; then
  echo "Nada que renovar (todos vigentes por más de $DIAS_MINIMOS días). Usa --forzar para renovar igual."
fi
