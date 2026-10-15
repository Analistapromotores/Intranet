# Despliegue de la intranet en el servidor interno de GyS

Contexto para Claude: así está montada la intranet en el servidor de la empresa
(red interna). Respeta esta arquitectura al tocar Docker, variables de entorno,
puertos o configuración de proxy.

## Estructura del servidor (`/home/gysadmin`)

Cada cosa es un proyecto Docker independiente:

```
~/proxy/      ← nginx: único que publica 80/443. Plantillas y certificados de todos los sitios.
~/glpi/       ← GLPI + MySQL (sin nginx propio)
~/intranet/   ← este repo (compose de despliegue dentro del repo)
```

Se comunican solo a través de la red Docker externa **`proxy_net`**
(creada una vez con `docker network create proxy_net`).

## Arquitectura

```
Internet / red interna / VPN pasaportes
              │  :80 / :443  (regla del router → servidor)
        ┌─────▼──────┐
        │   nginx    │  proyecto ~/proxy  (NO está en este repo)
        └──┬──────┬──┘
           │ proxy_net (red externa compartida)
     ┌─────▼──┐ ┌─▼──────────────┐
     │  glpi  │ │ intranet-app   │  alias "intranet", escucha en :3001
     └───┬────┘ └──────┬─────────┘
  glpi_net│            │ interna (solo app ↔ db)
     ┌───▼──┐   ┌──────▼──────┐
     │ db   │   │ intranet-db │  postgres:16-alpine
     │MySQL │   └─────────────┘
     └──────┘
```

- **Dominio:** `intranet.gestionyservicios.com.co` (GLPI: `glpi.gestionyservicios.com.co`).
- **Un solo proxy:** el nginx de `~/proxy` enruta por `server_name`. La intranet **no
  publica puertos** en el host.
- **Red `interna`:** solo `app` ↔ `db` de la intranet. La base de datos no está expuesta.
- La intranet **no** se une a ninguna red de GLPI. En `glpi_net` existe otro servicio
  llamado `db` (MySQL de GLPI).

## Reglas que no se deben romper

1. **No publicar puertos** (`ports:`) en el compose de la intranet. Todo entra por nginx.
2. **La app escucha en el puerto 3001** (`PORT: 3001`). Si cambia, hay que cambiar
   `set $intranet_upstream http://intranet:3001;` en
   `~/proxy/nginx/templates/intranet.conf.template`.
3. **El alias `intranet` en `proxy_net` es lo que usa nginx.** No renombrarlo.
4. **Host de la base de datos = `intranet-db`** (el `container_name`), nunca `db`.
5. **`TRUST_PROXY: 1`**: hay exactamente un proxy delante. La app confía en
   `X-Forwarded-For` / `X-Forwarded-Proto` de ese único salto (IP real del cliente, HTTPS,
   cookies `secure`).
6. **HTTPS lo termina nginx.** La app recibe HTTP plano en 3001; el esquema original llega en
   `X-Forwarded-Proto`. No configurar certificados dentro de la app.
7. Healthcheck de la app: `GET /api/health` en `127.0.0.1:3001`. Mantener ese endpoint.

## docker-compose.yml de la intranet (estado esperado)

```yaml
name: intranet

services:
  app:
    build:
      context: ../..
      dockerfile: Dockerfile
    image: intranet-app
    container_name: intranet-app
    restart: unless-stopped
    env_file: .env
    environment:
      NODE_ENV: production
      PORT: 3001
      TRUST_PROXY: 1          # un solo proxy delante (nginx de ~/proxy)
      DATA_DIR: /data
      DATABASE_URL: postgres://intranet:${POSTGRES_PASSWORD:?Define POSTGRES_PASSWORD en .env}@intranet-db:5432/intranet
    volumes:
      - intranet_data:/data
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3001/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    networks:
      interna: {}
      proxy:
        aliases:
          - intranet

  db:
    image: postgres:16-alpine
    container_name: intranet-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: intranet
      POSTGRES_USER: intranet
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Define POSTGRES_PASSWORD en .env}
    volumes:
      - intranet_pg:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U intranet -d intranet"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - interna

volumes:
  intranet_data:
  intranet_pg:

networks:
  interna: {}          # solo app <-> db
  proxy:
    external: true
    name: proxy_net    # compartida con el nginx de ~/proxy
```

## Lado nginx (`~/proxy`, fuera de este repo)

- Plantilla: `~/proxy/nginx/templates/intranet.conf.template`.
- Certificado: `~/proxy/nginx/certs/intranet/{fullchain,privkey}.pem`.
- El entrypoint de nginx procesa todas las `*.conf.template` con `envsubst`, sustituyendo
  solo `GLPI_DOMAIN`, `INTRANET_DOMAIN` y `NGINX_CLIENT_MAX_BODY_SIZE` (definidas en
  `~/proxy/.env`).
- Usa `resolver 127.0.0.11` + variable en `proxy_pass`, para que nginx arranque aunque la
  intranet esté apagada.
- Reenvía `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto` y soporta WebSocket.
- `client_max_body_size` = `NGINX_CLIENT_MAX_BODY_SIZE` en `~/proxy/.env`. Si la intranet
  necesita subir archivos más grandes, se sube allá.

## Certificados y DNS

- DNS: registro `intranet` en Colombia Hosting, misma IP que `glpi`. No se necesita regla
  nueva en el router.
- Let's Encrypt con certbot en el host, **reto HTTP (webroot)**: nginx sirve
  `/.well-known/acme-challenge/` desde `~/proxy/certbot/www` en el bloque `:80`. No quitar esa
  `location` de las plantillas ni el volumen del compose del proxy.
- Renovación automática (`certbot renew` por timer/cron); el hook
  `/etc/letsencrypt/renewal-hooks/deploy/proxy-nginx.sh` copia a `~/proxy/nginx/certs/<sitio>/` y hace
  `nginx -s reload`. Detalle en `CERTIFICADOS-AUTOMATICOS.md`.

## Comandos

```bash
# Intranet (desde la carpeta del compose de la intranet)
docker compose up -d --build
docker compose logs -f app

# Proxy
cd ~/proxy && docker compose logs -f nginx
docker network inspect proxy_net        # deben aparecer nginx, glpi e intranet-app
docker exec -it proxy-nginx-1 wget -qO- http://intranet:3001/api/health
```

## Problemas típicos

- **502 Bad Gateway:** la app no está corriendo, no está en `proxy_net` o no escucha en 3001.
- **Errores de conexión a la BD intermitentes:** se volvió a usar `db` como host o se unió la
  app a una red de GLPI. Usar `intranet-db`.
- **Redirecciones a http:// o cookies de sesión que no persisten:** revisar `TRUST_PROXY` y que
  la app respete `X-Forwarded-Proto`.
- **413 Request Entity Too Large:** subir `NGINX_CLIENT_MAX_BODY_SIZE` en `~/proxy/.env`.
