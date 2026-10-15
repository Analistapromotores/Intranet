# Renovación automática de certificados (GLPI e Intranet)

**Problema:** los certificados se sacaron con `certbot --manual --preferred-challenges dns`. Ese modo
**nunca se renueva solo**: certbot no puede crear el registro TXT en Colombia Hosting, y cada ~90 días
había que hacerlo a mano.

**Solución:** cambiar al reto **HTTP (webroot)**. Let's Encrypt pide
`http://<dominio>/.well-known/acme-challenge/<token>`; el nginx de `~/proxy` lo sirve desde
`~/proxy/certbot/www`, donde certbot (en el host) deja el archivo. Después de cada renovación un hook
copia el certificado a `~/proxy/nginx/certs/<sitio>/` y recarga nginx **sin corte**.

```
certbot.timer (2 veces al día) → certbot renew → ¿vence en < 30 días?
   └─ sí: escribe el token en ~/proxy/certbot/www → Let's Encrypt lo lee por :80 → certificado nuevo
          └─ hook: copia a ~/proxy/nginx/certs/<sitio>/ → nginx -t → nginx -s reload
```

Archivos en el repo:

- `proxy/nginx/templates/*.conf.template`: el bloque `:80` sirve `/.well-known/acme-challenge/` y
  redirige el resto a HTTPS.
- `proxy/docker-compose.yml`: monta `./certbot/www` en `/var/www/certbot`.
- `proxy/certbot/proxy-nginx-deploy-hook.sh`: el hook.

---

## 0. Requisito: el puerto 80 abierto desde Internet

Let's Encrypt valida desde fuera. Con el celular **en datos móviles** (no en el wifi de la oficina),
abrir `http://glpi.gestionyservicios.com.co`: si redirige a `https://`, el puerto 80 llega al servidor.
Si no carga, hay que abrir el 80 en el router hacia el servidor (el 443 ya está) antes de seguir.

## 1. Actualizar el repo y `~/proxy` (⏱ corte de segundos)

```bash
cd ~/intranet && git pull

cp ~/proxy/docker-compose.yml ~/proxy/docker-compose.yml.bak
cp -r ~/proxy/nginx/templates ~/proxy/nginx/templates.bak

cp ~/intranet/despliegue-local/proxy/docker-compose.yml ~/proxy/
cp ~/intranet/despliegue-local/proxy/nginx/templates/*.conf.template ~/proxy/nginx/templates/
mkdir -p ~/proxy/certbot/www
```

Validar con el comando del paso 5 de [`PASO-A-PASO.md`](PASO-A-PASO.md) y, solo si dice
`test is successful`:

```bash
cd ~/proxy && docker compose up -d      # recrea nginx con el volumen nuevo
```

Probar que el reto se sirve:

```bash
mkdir -p ~/proxy/certbot/www/.well-known/acme-challenge
echo ok > ~/proxy/certbot/www/.well-known/acme-challenge/prueba
curl -s http://intranet.gestionyservicios.com.co/.well-known/acme-challenge/prueba   # → ok
curl -s http://glpi.gestionyservicios.com.co/.well-known/acme-challenge/prueba       # → ok
rm ~/proxy/certbot/www/.well-known/acme-challenge/prueba
```

**↩ Vuelta atrás:** restaurar los `.bak` y `cd ~/proxy && docker compose up -d`.

## 2. Instalar el hook

```bash
sudo install -m 755 ~/intranet/despliegue-local/proxy/certbot/proxy-nginx-deploy-hook.sh \
  /etc/letsencrypt/renewal-hooks/deploy/proxy-nginx.sh
```

El hook asume `~/proxy` = `/home/gysadmin/proxy` y el contenedor `proxy-nginx-1`. Si fuera distinto,
editar `PROXY_DIR` / `CONTENEDOR` al inicio de `/etc/letsencrypt/renewal-hooks/deploy/proxy-nginx.sh`.

## 3. Pasar cada certificado al modo webroot

Ver qué certificados maneja certbot:

```bash
sudo certbot certificates
```

**Intranet** (y **GLPI**, si aparece en la lista): volver a emitirlo con webroot. Esto reescribe su
configuración de renovación; no hay que tocar DNS.

```bash
sudo certbot certonly --webroot -w /home/gysadmin/proxy/certbot/www \
  -d intranet.gestionyservicios.com.co --cert-name intranet.gestionyservicios.com.co --force-renewal

# Certbot solo ejecuta el hook en «renew»; esta primera vez se corre a mano:
sudo RENEWED_LINEAGE=/etc/letsencrypt/live/intranet.gestionyservicios.com.co \
  /etc/letsencrypt/renewal-hooks/deploy/proxy-nginx.sh
```

Para GLPI, lo mismo cambiando `intranet` por `glpi` en las tres apariciones del dominio.

> Si el certificado de GLPI **no** aparece en `certbot certificates` (por ejemplo, uno comprado), se puede
> seguir renovando como hasta ahora, o pasarlo a Let's Encrypt con el mismo comando (`--cert-name`
> nuevo); el hook lo copiará a `~/proxy/nginx/certs/glpi/`.

Comprobar que quedaron en webroot:

```bash
sudo grep -H authenticator /etc/letsencrypt/renewal/*.conf
# … = webroot   (si dice manual, ese certificado sigue sin renovarse solo)
```

## 4. Programar la renovación

Si certbot vino del paquete del sistema o de snap, ya trae un temporizador:

```bash
systemctl list-timers | grep -i certbot
```

Si no aparece nada, crear uno con cron:

```bash
echo '0 3,15 * * * root certbot renew -q' | sudo tee /etc/cron.d/certbot-renew
```

`certbot renew` solo renueva los que vencen en menos de 30 días; correrlo dos veces al día es lo
recomendado.

## 5. Prueba en seco

```bash
sudo certbot renew --dry-run
# «Congratulations, all simulated renewals succeeded»
```

(El dry-run no ejecuta el hook; ya se probó a mano en el paso 3.)

Ver la fecha de vencimiento que está sirviendo nginx:

```bash
for d in intranet glpi; do echo -n "$d: "; echo | openssl s_client -connect 127.0.0.1:443 -servername $d.gestionyservicios.com.co 2>/dev/null | openssl x509 -noout -enddate; done
```

Listo. Ya no hay que hacer nada cada 90 días. Los registros TXT `_acme-challenge` que quedaron en
Colombia Hosting se pueden borrar.

## Si una renovación falla

Let's Encrypt avisa por correo (al que se registró en certbot) ~20 días antes del vencimiento. Revisar:

```bash
sudo tail -50 /var/log/letsencrypt/letsencrypt.log
curl -sI http://intranet.gestionyservicios.com.co/.well-known/acme-challenge/x   # debe dar 404 de nginx, no 301
```

Causas típicas: el puerto 80 se cerró en el router, `proxy-nginx-1` estaba apagado, o
`~/proxy/certbot/www` no está montado (falta el `docker compose up -d` del paso 1).
