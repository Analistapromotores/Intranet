# Despliegue local (servidor interno de GyS)

Archivos para correr la intranet en el servidor de la empresa, en la misma red Docker que GLPI,
detrás de un único nginx. **No reemplaza el despliegue en Railway**: el `Dockerfile`, `railway.json`
y el código de la raíz no se tocan; el compose de aquí reutiliza ese mismo `Dockerfile`.

La arquitectura y las reglas están en [`info.md`](info.md).

**Servidor actual (GLPI con su propio nginx): seguir [`PASO-A-PASO.md`](PASO-A-PASO.md)**, que pasa GLPI al
proxy compartido por fases, con vuelta atrás, y luego publica la intranet. La sección «Puesta en marcha» es para una instalación desde cero.

```
despliegue-local/
├── info.md                       ← arquitectura y reglas (leer primero)
├── PASO-A-PASO.md                ← pasos para el servidor actual
├── intranet/                     ← se usa desde el repo clonado en ~/intranet
│   ├── docker-compose.yml        ← app (alias «intranet», :3001) + Postgres (intranet-db)
│   └── .env.example
├── proxy/                        ← copiar a ~/proxy en el servidor
│   ├── docker-compose.yml        ← nginx: único que publica 80/443
│   ├── .env.example
│   └── nginx/templates/
│       ├── glpi.conf.template    ← GLPI con resolución dinámica
│       └── intranet.conf.template
└── glpi/                         ← referencia del compose de ~/glpi (sin nginx propio)
    └── docker-compose.yml
```

## Puesta en marcha desde cero

```bash
# 1. Red compartida
docker network create proxy_net

# 2. Proxy: copiar plantilla y compose a ~/proxy
cp -r ~/intranet/despliegue-local/proxy/. ~/proxy/
cd ~/proxy && cp .env.example .env     # ajustar NGINX_IMAGE / NGINX_CLIENT_MAX_BODY_SIZE como en GLPI
#    Certificados en ~/proxy/nginx/certs/intranet/{fullchain,privkey}.pem (ver info.md)

# 3. GLPI: quitarle su nginx y unirlo a proxy_net (ver glpi/docker-compose.yml)
cd ~/glpi && docker compose up -d

# 4. Intranet
cd ~/intranet/despliegue-local/intranet
cp .env.example .env                   # completar POSTGRES_PASSWORD, SESSION_SECRET, usuarios, correo
docker compose up -d --build

# 5. Proxy
cd ~/proxy && docker compose up -d
```

## Actualizar la intranet

```bash
cd ~/intranet && git pull
cd despliegue-local/intranet && docker compose up -d --build
```

## Verificar

```bash
docker compose ps                                   # intranet-app debe quedar «healthy»
docker network inspect proxy_net                    # nginx, glpi e intranet-app
docker exec -it proxy-nginx-1 wget -qO- http://intranet:3001/api/health
```

## Datos

- PostgreSQL en el volumen `intranet_intranet_pg`; archivos (fotos, outbox) en `intranet_intranet_data`.
- Respaldo de la BD:
  `docker exec intranet-db pg_dump -U intranet intranet > intranet-$(date +%F).sql`
