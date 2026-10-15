# Migración: GLPI al proxy compartido + intranet

Estado de partida en el servidor (oct 2026):

```
glpi-nginx-1   0.0.0.0:80->80, 0.0.0.0:443->443   ← nginx propio de GLPI (se va a retirar)
glpi-glpi-1    80/tcp
glpi-db-1      3306/tcp
~/proxy/nginx/templates/glpi.conf.template        ← ya existe
```

Objetivo: `~/proxy` (nginx único) atiende `glpi.gestionyservicios.com.co` e
`intranet.gestionyservicios.com.co`. Se hace en fases para que GLPI solo tenga un corte de segundos
y siempre haya vuelta atrás.

> **Regla clave:** nginx no arranca si falta un certificado de *cualquier* plantilla. La plantilla de la
> intranet **no** se copia a `~/proxy` hasta tener su certificado (fase 3), o GLPI también caería.

---

## Fase 0 — Preparación (sin corte)

```bash
# Respaldos
cp ~/glpi/docker-compose.yml ~/glpi/docker-compose.yml.con-nginx.bak
docker exec glpi-db-1 sh -c '$(command -v mariadb-dump || command -v mysqldump) -uroot -p"$MYSQL_ROOT_PASSWORD" --all-databases' > ~/glpi-$(date +%F).sql

# Red compartida (si ya existe, el error se puede ignorar)
docker network create proxy_net

# Unir el GLPI que está corriendo a proxy_net con el alias «glpi», en caliente (no reinicia nada)
docker network connect --alias glpi proxy_net glpi-glpi-1

# Proxy: compose y .env (la plantilla de GLPI ya está)
cp ~/intranet/despliegue-local/proxy/docker-compose.yml ~/proxy/
cp ~/intranet/despliegue-local/proxy/.env.example ~/proxy/.env   # si no existe ya
nano ~/proxy/.env     # NGINX_IMAGE y NGINX_CLIENT_MAX_BODY_SIZE: mismos valores que el .env de GLPI
```

Certificados de GLPI: deben estar donde los busca `glpi.conf.template`:

```bash
grep -n ssl_certificate ~/proxy/nginx/templates/glpi.conf.template
ls -l ~/proxy/nginx/certs/glpi/          # copiarlos desde el nginx actual de GLPI si faltan
```

Validar la configuración **sin ocupar los puertos** (no toca el nginx actual):

```bash
cd ~/proxy
docker compose run --rm --no-deps --entrypoint /bin/sh nginx -c 'for f in /etc/nginx/templates/*.conf.template; do envsubst "\$GLPI_DOMAIN \$INTRANET_DOMAIN \$NGINX_CLIENT_MAX_BODY_SIZE" < "$f" > /etc/nginx/conf.d/$(basename "$f" .template); done && nginx -t'
```

Debe terminar en `test is successful`. Si falla, corregir antes de seguir.

## Fase 1 — Corte de GLPI al proxy (segundos de corte)

```bash
cd ~/glpi  && docker compose stop nginx     # libera 80/443
cd ~/proxy && docker compose up -d          # los toma el proxy
```

Verificar:

```bash
docker compose -f ~/proxy/docker-compose.yml logs --tail 20 nginx
curl -skI --resolve glpi.gestionyservicios.com.co:443:127.0.0.1 https://glpi.gestionyservicios.com.co/ | head -3
```

Y entrar a GLPI desde el navegador (login, ver un ticket, subir un adjunto).

**Vuelta atrás** (si algo falla):

```bash
cd ~/proxy && docker compose down
cd ~/glpi  && docker compose start nginx
```

## Fase 2 — Quitar el nginx del proyecto GLPI (unos segundos de corte)

Cuando GLPI lleve un rato funcionando bien por el proxy. Comparar primero el compose nuevo con el actual:

```bash
diff ~/glpi/docker-compose.yml ~/intranet/despliegue-local/glpi/docker-compose.yml
```

Lo único que debe cambiar es: sin servicio `nginx`, `glpi` en `proxy_net` con alias `glpi`, y la red
`proxy_net` externa. Luego:

```bash
cp ~/intranet/despliegue-local/glpi/docker-compose.yml ~/glpi/docker-compose.yml
cd ~/glpi && docker compose up -d --remove-orphans   # recrea glpi en proxy_net y borra glpi-nginx-1
```

A partir de aquí el proxy ya no depende de la conexión en caliente de la fase 0.
Vuelta atrás: restaurar `docker-compose.yml.con-nginx.bak`, `docker compose up -d` en `~/glpi`
tras `docker compose down` en `~/proxy`.

## Fase 3 — Intranet

1. **DNS:** registro `A` `intranet` en Colombia Hosting con la misma IP que `glpi`.
2. **Certificado** (reto DNS, ver `info.md`):
   ```bash
   sudo certbot certonly --manual --preferred-challenges dns -d intranet.gestionyservicios.com.co
   mkdir -p ~/proxy/nginx/certs/intranet
   sudo cp /etc/letsencrypt/live/intranet.gestionyservicios.com.co/{fullchain,privkey}.pem ~/proxy/nginx/certs/intranet/
   sudo chown -R $(whoami):$(whoami) ~/proxy/nginx/certs/intranet
   ```
3. **Levantar la intranet** (no afecta a GLPI):
   ```bash
   cd ~/intranet && git fetch && git checkout despliegue-local
   cd despliegue-local/intranet && cp .env.example .env && nano .env
   docker compose up -d --build
   docker compose ps          # intranet-app → healthy
   ```
4. **Publicarla en el proxy:**
   ```bash
   cp ~/intranet/despliegue-local/proxy/nginx/templates/intranet.conf.template ~/proxy/nginx/templates/
   cd ~/proxy
   # validar (mismo comando de la fase 0) y, si dice «successful»:
   docker compose restart nginx
   docker exec -it proxy-nginx-1 wget -qO- http://intranet:3001/api/health
   ```
   Si la validación falla, borrar `intranet.conf.template` de `~/proxy/nginx/templates/` y GLPI sigue
   igual.
