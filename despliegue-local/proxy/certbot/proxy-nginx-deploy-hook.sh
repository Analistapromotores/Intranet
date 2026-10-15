#!/bin/sh
# Hook de certbot: se ejecuta después de cada renovación exitosa.
# Copia el certificado renovado a ~/proxy/nginx/certs/<sitio>/ y recarga nginx sin cortar el servicio.
#
# Instalación (una vez, en el servidor):
#   sudo install -m 755 ~/intranet/despliegue-local/proxy/certbot/proxy-nginx-deploy-hook.sh \
#     /etc/letsencrypt/renewal-hooks/deploy/proxy-nginx.sh
#
# Certbot define RENEWED_LINEAGE (p. ej. /etc/letsencrypt/live/intranet.gestionyservicios.com.co).
# Se puede probar a mano:  sudo RENEWED_LINEAGE=/etc/letsencrypt/live/<dominio> /etc/letsencrypt/renewal-hooks/deploy/proxy-nginx.sh
set -eu

PROXY_DIR="${PROXY_DIR:-/home/gysadmin/proxy}"
CONTENEDOR="${CONTENEDOR:-proxy-nginx-1}"

# Dominio del certificado → carpeta en ~/proxy/nginx/certs (la que usa cada plantilla).
case "$(basename "${RENEWED_LINEAGE:?certbot no definió RENEWED_LINEAGE}")" in
  intranet.gestionyservicios.com.co) SITIO=intranet ;;
  glpi.gestionyservicios.com.co)     SITIO=glpi ;;
  *) echo "[proxy-nginx] $RENEWED_LINEAGE no es de este proxy; nada que hacer."; exit 0 ;;
esac

DESTINO="$PROXY_DIR/nginx/certs/$SITIO"
mkdir -p "$DESTINO"
# -L sigue los enlaces de live/ hacia archive/; se copian los archivos reales.
cp -L "$RENEWED_LINEAGE/fullchain.pem" "$RENEWED_LINEAGE/privkey.pem" "$DESTINO/"
chown -R "$(stat -c %u:%g "$PROXY_DIR")" "$DESTINO"
chmod 600 "$DESTINO/privkey.pem"
echo "[proxy-nginx] Certificado de $SITIO copiado a $DESTINO"

# Recarga sin corte. nginx -t primero: si algo está mal, nginx sigue con la configuración anterior.
if docker ps --format '{{.Names}}' | grep -qx "$CONTENEDOR"; then
  docker exec "$CONTENEDOR" nginx -t && docker exec "$CONTENEDOR" nginx -s reload
  echo "[proxy-nginx] nginx recargado"
else
  echo "[proxy-nginx] $CONTENEDOR no está corriendo; tomará el certificado al arrancar."
fi
