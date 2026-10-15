# Entrega para el servidor propio

Guía para quien sube los cambios a https://intranet.gestionyservicios.com.co/ (servidor propio con nginx y PostgreSQL).
Sustituye a lo que [despliegue.md](despliegue.md) cuenta sobre Railway; el resto de ese documento (puertos, seguridad
HTTP, diagnóstico) sigue valiendo.

## Qué cambió en esta entrega

- Correcciones en formularios: ya no devuelven error 500 con datos mal formados, y la firma debe ser un PNG real.
- Usuarios, cumpleaños y felicitaciones se guardan con bloqueo: dos personas a la vez ya no se pisan.
- El resumen diario de TI se reintenta si el envío falla (antes se daba por enviado).
- **Solicitudes en Google Sheets** en lugar de correo (opcional, ver abajo).
- `TRUST_PROXY` (por defecto 1 en producción) para contar bien las IP detrás de nginx.
- Avisos en el log al arrancar si falta alguna configuración importante de producción.

## 1. Construir y arrancar

```bash
npm ci
npm run build          # genera dist/
NODE_ENV=production node server/index.js
```

O con Docker, desde la raíz del repositorio: `docker build -t intranet .` y `docker run -p 3001:3001 --env-file .env intranet`.
Requiere Node 22. Mantén el proceso vivo con systemd o con `--restart unless-stopped`.

## 2. Variables de entorno

Plantilla completa en [.env.example](../.env.example). Las que importan en producción:

| Variable | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | puerto interno (3001 por defecto) |
| `DATABASE_URL` | cadena de conexión de PostgreSQL (`PGSSL=true` si la base exige SSL) |
| `SESSION_SECRET` | texto largo y aleatorio; sin él las sesiones se cierran en cada reinicio |
| `ADMIN_USER`, `ADMIN_PASSWORD` | administrador inicial (con clave propia, no `admin`) |
| `GESTOR_USER`, `GESTOR_PASSWORD`, `TI_USER`, `TI_PASSWORD` | usuarios iniciales de gestor y TI |
| `SITE_URL` | `https://intranet.gestionyservicios.com.co` |
| `TRUST_PROXY` | `1` (un solo nginx delante) |
| `SHEET_ID` y `GOOGLE_SERVICE_ACCOUNT_JSON` | registro de solicitudes en Sheets (sección 4) |
| `MAIL_MODE` | `produccion` solo si se usa correo (SMTP) |

Los usuarios iniciales se crean al arrancar únicamente si no existen. Si ya existen, cambiar la variable no cambia la clave:
se hace desde *Administración → Accesos y roles*.

## 3. nginx

```nginx
server {
  listen 443 ssl;
  server_name intranet.gestionyservicios.com.co;
  client_max_body_size 30m;            # noticias y cumpleaños suben imágenes (la app acepta hasta 25 MB)

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
  }
}
```

Sin `X-Forwarded-For` todos los visitantes compartirían una IP y los límites de uso bloquearían a la oficina entera.

## 4. Dónde llegan las solicitudes

Gmail con cuenta de servicio **no funciona**: Google responde `unauthorized_client` porque el dominio no activó la
delegación. Hay dos opciones; si no se configura ninguna, las solicitudes se guardan pero **no avisan a nadie**.

**Opción A: Google Sheets** (implementada y probada contra una simulación de la API)
1. Crear una hoja de Google, por ejemplo «Intranet – Solicitudes».
2. Compartirla como **Editor** con el `client_email` de la cuenta de servicio.
3. Poner `SHEET_ID` (lo que va entre `/d/` y `/edit`) y `GOOGLE_SERVICE_ACCOUNT_JSON` (el JSON completo) en el entorno.
4. El servidor debe poder salir a `oauth2.googleapis.com` y `sheets.googleapis.com` por el puerto 443.
5. Las pestañas se crean solas. Las solicitudes y el resumen diario de TI se anotan ahí; el Excel de cada formato se
   descarga desde *Gestión de solicitudes*.

**Opción B: correo SMTP interno.** Definir `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`,
`EMAIL_PRODUCCION`, `EMAIL_PRESTAMOS`, `EMAIL_TI` y `MAIL_MODE=produccion`. Si `SHEET_ID` está definido, la hoja tiene
prioridad y no se envía correo.

## 5. Lista de comprobación tras subir

- [ ] `GET /api/health` responde `{"ok":true,"db":"postgres"}`.
- [ ] En el log de arranque no aparecen líneas `[config]` de advertencia.
- [ ] `/api/solicitudes/config` incluye `"canal":"hoja"` (o `"correo"` con `"smtp":true`).
- [ ] No se puede entrar con `admin`/`admin`.
- [ ] Registrar un préstamo de equipos de prueba: aparece la fila en la hoja (o llega el correo) y el estado cambia desde Gestión.
- [ ] Publicar una noticia con una imagen grande (unos 8 MB) funciona (si falla con 413, revisar `client_max_body_size`).
- [ ] Un gestor no ve *Panel de TI* ni *Accesos y roles*; TI no ve *Accesos y roles*.

## 6. Operación

- **Copias de seguridad de PostgreSQL** (por ejemplo `pg_dump` diario): usuarios, noticias, solicitudes y fotos viven ahí.
- Monitorear `/api/health`.
- Revisar el log de vez en cuando: `[hoja]`, `[correo]` y `[limite]` indican problemas de envío o abusos.
- Cambiar `SESSION_SECRET` y reiniciar cierra todas las sesiones.
- Si la clave de la cuenta de servicio se compartió por chat o correo, crear una nueva y borrar la anterior.
