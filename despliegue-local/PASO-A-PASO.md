# Paso a paso en el servidor: GLPI + Intranet detrás de un solo nginx

Objetivo final:

| Dominio | Contenedor | Puerto interno |
|---|---|---|
| `glpi.gestionyservicios.com.co` | `glpi` (proyecto `~/glpi`) | 80 |
| `intranet.gestionyservicios.com.co` | `intranet-app` (alias `intranet`) | 3001 |

Un único nginx (`~/proxy`) publica 80/443 y reparte por dominio. Arquitectura y reglas: [`info.md`](info.md).

**Estado de partida:** `glpi-nginx-1` (nginx propio de GLPI) tiene 80/443. `~/proxy` existe con
`glpi.conf.template` pero no está corriendo.

**Cortes de GLPI:** solo en los pasos 6 y 7, de unos segundos cada uno. Conviene hacerlos fuera del
horario de uso. Cada paso con corte tiene su **vuelta atrás**.

> ⚠️ **Regla de oro:** nginx no arranca si falta el certificado de *cualquier* plantilla, y entonces se
> caen todos los sitios. La plantilla de la intranet solo se copia a `~/proxy` en el paso 11, cuando su
> certificado ya existe.

Todos los comandos se ejecutan como `gysadmin`, en bash.

---

## 1. Traer el repositorio con la rama `despliegue-local`

Si `~/intranet` **no existe**:

```bash
cd ~
git clone -b despliegue-local git@github.com:Analistapromotores/Intranet.git intranet
```

Si **ya existe**:

```bash
cd ~/intranet
git fetch origin
git checkout despliegue-local
git pull
```

Comprobar:

```bash
ls ~/intranet/despliegue-local
# debe mostrar: glpi  info.md  intranet  PASO-A-PASO.md  proxy  README.md
```

> Si el servidor no tiene llave SSH para GitHub, clonar por HTTPS
> (`https://github.com/Analistapromotores/Intranet.git`) con un token personal como contraseña.

## 2. Respaldos (sin corte)

```bash
# Compose actual de GLPI (con su nginx)
cp ~/glpi/docker-compose.yml ~/glpi/docker-compose.yml.con-nginx.bak

# Plantilla actual de ~/proxy
cp ~/proxy/nginx/templates/glpi.conf.template ~/glpi.conf.template.proxy.bak

# Base de datos de GLPI
docker exec glpi-db-1 sh -c '$(command -v mariadb-dump || command -v mysqldump) -uroot -p"$MYSQL_ROOT_PASSWORD" --all-databases' > ~/glpi-$(date +%F).sql
ls -lh ~/glpi-$(date +%F).sql      # no debe pesar 0 bytes
```

## 3. Red compartida y GLPI en ella (sin corte)

```bash
# Crear la red (si dice «already exists», está bien)
docker network create proxy_net

# Conectar el GLPI que está corriendo a proxy_net con el alias «glpi». No reinicia nada.
docker network connect --alias glpi proxy_net glpi-glpi-1
```

Comprobar:

```bash
docker network inspect proxy_net --format '{{range .Containers}}{{.Name}} {{end}}'
# debe aparecer: glpi-glpi-1
```

## 4. Preparar `~/proxy` (sin corte)

```bash
# Compose y plantilla de GLPI corregida (resolución dinámica)
cp ~/intranet/despliegue-local/proxy/docker-compose.yml ~/proxy/
cp ~/intranet/despliegue-local/proxy/nginx/templates/glpi.conf.template ~/proxy/nginx/templates/

# .env del proxy (si ya existe ~/proxy/.env, solo revisarlo)
[ -f ~/proxy/.env ] || cp ~/intranet/despliegue-local/proxy/.env.example ~/proxy/.env
grep -E 'NGINX_IMAGE|NGINX_CLIENT_MAX_BODY_SIZE' ~/glpi/.env    # valores de hoy
nano ~/proxy/.env
```

En `~/proxy/.env` deben quedar:

- `NGINX_IMAGE` y `NGINX_CLIENT_MAX_BODY_SIZE`: **los mismos valores que `~/glpi/.env`**.
- `NGINX_HTTP_PORT=80`, `NGINX_HTTPS_PORT=443`.
- `GLPI_DOMAIN=glpi.gestionyservicios.com.co`
- `INTRANET_DOMAIN=intranet.gestionyservicios.com.co`

Certificados de GLPI. Primero ver dónde los lee hoy el nginx de GLPI:

```bash
grep ssl_certificate ~/glpi/nginx/templates/glpi.conf.template
ls -l ~/glpi/nginx/certs/ ~/glpi/nginx/certs/glpi/ 2>/dev/null
```

Copiarlos a la ruta que usa el proxy (`/etc/nginx/certs/glpi/` = `~/proxy/nginx/certs/glpi/`):

```bash
mkdir -p ~/proxy/nginx/certs/glpi
cp ~/glpi/nginx/certs/glpi/fullchain.pem ~/glpi/nginx/certs/glpi/privkey.pem ~/proxy/nginx/certs/glpi/
# (si el grep mostró otra ruta, copiar desde esa)
ls -l ~/proxy/nginx/certs/glpi/
```

## 5. Validar la configuración del proxy (sin corte)

No ocupa los puertos 80/443 ni toca el nginx actual:

```bash
cd ~/proxy
docker compose run --rm --no-deps --entrypoint /bin/sh nginx -c 'for f in /etc/nginx/templates/*.conf.template; do envsubst "\$GLPI_DOMAIN \$INTRANET_DOMAIN \$NGINX_CLIENT_MAX_BODY_SIZE" < "$f" > /etc/nginx/conf.d/$(basename "$f" .template); done && nginx -t'
```

✅ Debe terminar en `test is successful`. **Si falla, no seguir**: revisar el mensaje (casi siempre es
una ruta de certificado) y repetir.

## 6. Cambiar GLPI al proxy (⏱ corte de segundos)

```bash
cd ~/glpi  && docker compose stop nginx     # libera 80/443
cd ~/proxy && docker compose up -d          # los toma el proxy
```

Comprobar:

```bash
cd ~/proxy && docker compose ps                     # proxy-nginx-1 «Up»
docker compose logs --tail 20 nginx                 # sin errores
curl -skI --resolve glpi.gestionyservicios.com.co:443:127.0.0.1 https://glpi.gestionyservicios.com.co/ | head -1
# HTTP/1.1 200 o 302
```

Y en el navegador: entrar a GLPI, iniciar sesión, abrir un ticket y subir un adjunto.

**↩ Vuelta atrás** (si algo falla):

```bash
cd ~/proxy && docker compose down
cd ~/glpi  && docker compose start nginx
```

## 7. Quitar el nginx del proyecto GLPI (⏱ corte de segundos)

Cuando GLPI lleve un rato funcionando bien por el proxy. Primero revisar las diferencias:

```bash
diff ~/glpi/docker-compose.yml ~/intranet/despliegue-local/glpi/docker-compose.yml
```

Solo debe cambiar: desaparece el servicio `nginx`, `glpi` entra a `proxy_net` con alias `glpi`, y se
declara la red externa `proxy_net`. Si aparece algo más (otro volumen, otra variable), avisar antes de
seguir.

```bash
cp ~/intranet/despliegue-local/glpi/docker-compose.yml ~/glpi/docker-compose.yml
cd ~/glpi && docker compose up -d --remove-orphans    # recrea glpi en proxy_net y borra glpi-nginx-1
docker compose ps                                     # db y glpi «Up», ya no hay nginx
```

Volver a comprobar GLPI con el `curl` del paso 6 y en el navegador. No hace falta reiniciar el proxy.

**↩ Vuelta atrás:**

```bash
cd ~/proxy && docker compose down
cp ~/glpi/docker-compose.yml.con-nginx.bak ~/glpi/docker-compose.yml
cd ~/glpi && docker compose up -d
```

## 8. DNS de la intranet

En Colombia Hosting, crear un registro **A** `intranet` con **la misma IP** que `glpi`. No se toca el
router. Comprobar (puede tardar unos minutos):

```bash
getent hosts intranet.gestionyservicios.com.co glpi.gestionyservicios.com.co   # misma IP
```

## 9. Certificado de la intranet

Reto DNS manual: certbot pide crear un registro TXT `_acme-challenge.intranet` en Colombia Hosting.
Esperar a que propague antes de pulsar Enter.

```bash
sudo certbot certonly --manual --preferred-challenges dns -d intranet.gestionyservicios.com.co
mkdir -p ~/proxy/nginx/certs/intranet
sudo cp /etc/letsencrypt/live/intranet.gestionyservicios.com.co/{fullchain,privkey}.pem ~/proxy/nginx/certs/intranet/
sudo chown -R $(whoami):$(whoami) ~/proxy/nginx/certs/intranet
ls -l ~/proxy/nginx/certs/intranet/
```

## 10. Levantar la intranet (sin afectar a GLPI)

```bash
cd ~/intranet/despliegue-local/intranet
cp .env.example .env
openssl rand -hex 24     # usar como POSTGRES_PASSWORD
openssl rand -hex 32     # usar como SESSION_SECRET
nano .env
```

En `.env`, como mínimo:

- `POSTGRES_PASSWORD` y `SESSION_SECRET`: los valores generados arriba.
- `ADMIN_USER` / `ADMIN_PASSWORD` y `GESTOR_USER` / `GESTOR_PASSWORD` (y `TI_USER` / `TI_PASSWORD`):
  sin ellos nadie puede iniciar sesión. Solo se crean la primera vez.
- Correo: `GOOGLE_SERVICE_ACCOUNT_JSON` + `GMAIL_SENDER` (o los `SMTP_*`). Dejar `MAIL_MODE=pruebas`
  hasta validar; luego `produccion`.

> Guardar `POSTGRES_PASSWORD` en un lugar seguro: si se cambia después, la app ya no podrá entrar a la
> base de datos existente.

```bash
docker compose up -d --build      # la primera vez tarda varios minutos
docker compose ps                 # esperar a que intranet-app diga «healthy» (~30 s)
docker compose logs --tail 20 app # «PostgreSQL listo» y «datos en PostgreSQL»
```

## 11. Publicar la intranet en el proxy (⏱ corte de 1–2 s para GLPI)

```bash
cp ~/intranet/despliegue-local/proxy/nginx/templates/intranet.conf.template ~/proxy/nginx/templates/
cd ~/proxy
```

Validar con el **mismo comando del paso 5**. Solo si dice `test is successful`:

```bash
docker compose restart nginx
```

Si la validación falla: `rm ~/proxy/nginx/templates/intranet.conf.template` y GLPI sigue igual.

## 12. Comprobación final

```bash
docker network inspect proxy_net --format '{{range .Containers}}{{.Name}} {{end}}'
# proxy-nginx-1, glpi-glpi-1, intranet-app

docker exec proxy-nginx-1 wget -qO- http://intranet:3001/api/health
# {"ok":true,"db":"postgres"}

curl -skI --resolve intranet.gestionyservicios.com.co:443:127.0.0.1 https://intranet.gestionyservicios.com.co/ | head -1
curl -skI --resolve glpi.gestionyservicios.com.co:443:127.0.0.1     https://glpi.gestionyservicios.com.co/     | head -1

docker ps --format '{{.Names}}\t{{.Ports}}'
# solo proxy-nginx-1 publica 0.0.0.0:80 y 0.0.0.0:443
```

En el navegador (red interna y VPN):

- [ ] `https://glpi.gestionyservicios.com.co` abre, inicia sesión y sube adjuntos.
- [ ] `https://intranet.gestionyservicios.com.co` abre con candado válido.
- [ ] `http://` de ambos redirige a `https://`.
- [ ] En la intranet se puede iniciar sesión con el usuario admin y la sesión se mantiene al recargar.
- [ ] Una solicitud de prueba envía el correo (a `EMAIL_PRUEBAS` mientras `MAIL_MODE=pruebas`).

---

## Después: mantenimiento

**Actualizar la intranet**

```bash
cd ~/intranet && git pull
cd despliegue-local/intranet && docker compose up -d --build
```

**Renovar certificados (~cada 60–80 días).** El script hace todo y solo muestra el TXT que hay que
crear en Colombia Hosting. No necesita abrir puertos.

```bash
sudo ~/intranet/despliegue-local/proxy/certbot/renovar-certificados.sh estado   # días que le quedan a cada uno
sudo ~/intranet/despliegue-local/proxy/certbot/renovar-certificados.sh          # renueva los que vencen en < 30 días
```

Por cada certificado que toca renovar muestra un recuadro así:

```
│    Tipo:    TXT
│    Nombre:  _acme-challenge.intranet
│    Valor:   gfj9Xq...Rg85nM
│    TTL:     300
```

Se crea (o se actualiza) ese registro y se deja la terminal abierta: el script detecta solo cuándo el
registro ya está publicado, valida con Let's Encrypt, copia el certificado a
`~/proxy/nginx/certs/<sitio>/` y recarga nginx sin corte. Si GLPI e Intranet vencen a la vez, muestra un
TXT para cada uno, uno después del otro.

Otras opciones: `intranet` o `glpi` (solo uno), `--forzar` (renovar aunque no venza pronto),
`--prueba` (ensayo contra el entorno de pruebas de Let's Encrypt; requiere crear el TXT igual, no cambia
ningún certificado).

> Let's Encrypt ya no envía correos de aviso de vencimiento: conviene un recordatorio en el calendario
> o revisar `estado` cada mes.

**Respaldo de la base de la intranet**

```bash
docker exec intranet-db pg_dump -U intranet intranet > ~/intranet-$(date +%F).sql
```

## Problemas típicos

| Síntoma | Causa probable | Revisar |
|---|---|---|
| 502 en la intranet | app caída o fuera de `proxy_net` | `cd ~/intranet/despliegue-local/intranet && docker compose ps` |
| 502 en GLPI | `glpi` fuera de `proxy_net` | `docker network inspect proxy_net` |
| nginx no arranca (todo caído) | falta un certificado o error en plantilla | `cd ~/proxy && docker compose logs nginx` |
| 413 al subir archivos | límite de nginx | subir `NGINX_CLIENT_MAX_BODY_SIZE` en `~/proxy/.env` y reiniciar nginx |
| La intranet no deja iniciar sesión | faltan usuarios en `.env` | `docker compose logs app \| grep usuarios` |
