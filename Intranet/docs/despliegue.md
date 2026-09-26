# Despliegue

> **Para quién es:** quien tiene que **publicar, reiniciar o diagnosticar** la intranet en producción. Al
> terminar sabrás dónde está, qué la compone, cómo subir un cambio y qué mirar si algo falla.

Diagrama: [diagramas/arquitectura.excalidraw](diagramas/arquitectura.excalidraw).

![Arquitectura y despliegue](diagramas/arquitectura.png)

## Dónde está

| Dato | Valor |
| --- | --- |
| Plataforma | [Railway](https://railway.com) — cuenta `analistapromotores` |
| Proyecto activo | `Intranet` · id `00240132-9c74-4a5c-880c-def01fd58314` |
| Entorno / servicio | `production` / `Intranet` |
| Dominio público | `https://intranet-production-a9d0.up.railway.app` |
| Dominio propio | ninguno configurado |
| Repositorio | <https://github.com/Analistapromotores/Intranet> (rama `main`) |
| Servicios en el proyecto | **uno**: `Intranet` (Node + frontend). No hay base de datos ni Redis |
| Volumen persistente | **no hay ninguno configurado a la fecha de este documento** (ver «Pendiente crítico») |

> ⚠️ **Hay dos proyectos llamados «Intranet» en la cuenta.** El activo es `00240132…`. El otro
> (`c5e8813a-bac3-44a8-b7bb-b754c07c9163`, dominio `intranet-production-642d…`) está conectado al repositorio
> de GitHub pero su último despliegue **falló** y no se usa; conviene eliminarlo para no confundirse. Antes de
> ejecutar cualquier comando de Railway, confirma a cuál estás vinculado con `railway status`.

## Qué corre y en qué puerto

Un **único contenedor** Node 22 ([Dockerfile](../Dockerfile)) construido en dos etapas:

1. **build:** `npm ci` + `npm run build` → genera `dist/` (frontend estático).
2. **runtime:** `npm ci --omit=dev`, copia `dist/`, `server/` y `shared/`, y arranca `node server/index.js`.

| Aspecto | Detalle |
| --- | --- |
| Puerto | Lo asigna Railway en la variable `PORT`; el servidor la lee (`PORT` → `API_PORT` → `3001`). No lo fijes a mano |
| Qué sirve | `/api/*` (API), `/uploads/*` (imágenes subidas) y el resto → `dist/index.html` (SPA con rutas por hash) |
| `NODE_ENV` | `production` (lo pone el Dockerfile): cookie `Secure`, sin usuarios de desarrollo |
| Reinicio automático | `restartPolicyType: ON_FAILURE`, hasta 3 reintentos ([railway.json](../railway.json)) |
| Instancias | **Una sola.** El almacenamiento en archivos no admite réplicas (ver [erd.md](erd.md#por-qué-archivos-json)) |
| Dominio en desarrollo | `localhost:5173` (web, Vite) y `localhost:3001` (API) |

## Variables del servicio

Configuradas hoy en Railway (los valores no se documentan aquí): `ADMIN_USER`, `ADMIN_PASSWORD`,
`GESTOR_USER`, `GESTOR_PASSWORD`, `SESSION_SECRET`.

| Variable | Estado | Consecuencia |
| --- | --- | --- |
| `SESSION_SECRET` | ✅ definida | Las sesiones sobreviven a reinicios |
| `GESTOR_*`, `ADMIN_*` | ✅ definidas | Se crean **solo si `users.json` no existe** o si el usuario no está |
| `TI_USER`, `TI_PASSWORD` | ❌ faltan | En producción **no** se crea el usuario de TI; créalo desde Administración → Accesos y roles, o define estas variables |
| `DATA_DIR` | ❌ falta | Los datos se escriben en el sistema de archivos del contenedor y **se pierden en cada despliegue** |
| `MAIL_MODE`, `EMAIL_*`, `SMTP_*`, `MAIL_FROM` | ❌ faltan | Modo pruebas y sin SMTP: los correos se guardan como `.eml`, no se envían |

La lista completa está en [README.md](../README.md#variables-de-entorno).

## Pendiente crítico: volumen persistente

Todo lo que la gente crea (usuarios, noticias, cumpleaños, solicitudes, reservas, fotos) se guarda en
`DATA_DIR`. **Sin un volumen, cada despliegue borra esa información.**

1. En Railway → servicio `Intranet` → **Volumes → New Volume**, punto de montaje `/data`.
2. Agrega la variable `DATA_DIR=/data`.
3. Redespliega. El log debe decir `datos en /data`.

Con `railway` CLI: `railway volume add --mount-path /data` y luego `railway variable set DATA_DIR=/data`.

**Respaldo:** el volumen no es un respaldo. Para copiar los datos, descarga la carpeta con la CLI
(`railway ssh` y `tar`) o expón temporalmente un endpoint de exportación; no hay respaldo automático.

## Cómo desplegar

Hay dos caminos; el proyecto activo **hoy se despliega por el segundo** porque su servicio no está conectado
a GitHub (su origen es una subida directa).

### A. Por GitHub (Railway redespliega solo)

Solo funciona si el servicio está conectado al repositorio (Settings → Source → Connect Repo, rama `main`).

```bash
git add -A && git commit -m "Describe el cambio" && git push origin main
```

### B. Subida directa con la CLI (la que usa el proyecto activo)

```bash
railway link -p 00240132-9c74-4a5c-880c-def01fd58314 -e production -s Intranet   # una vez
railway up --detach                                                              # sube la carpeta Intranet/
railway logs                                                                     # ver el arranque
```

El script [deploy-railway.ps1](../../deploy-railway.ps1) automatiza ambos: valida (`lint` + `build`) y luego
hace push (por defecto) o `railway up` (con `-Direct`). Ejemplos:

```powershell
.\deploy-railway.ps1 -Message "Ajusta Infraestructura"     # commit + lint + build + push
.\deploy-railway.ps1 -Direct -Logs                         # railway up y muestra logs
```

**Antes de desplegar:** `npm run lint` y `npm run build` deben pasar sin errores.

### Cómo verificar que quedó bien

1. `railway status` muestra el último despliegue en `SUCCESS`.
2. `https://intranet-production-a9d0.up.railway.app/api/salas` responde JSON.
3. La portada carga y puedes iniciar sesión.

## Reiniciar

| Necesidad | Cómo |
| --- | --- |
| Reiniciar sin cambiar código | Railway → servicio → **Deployments → ⋯ → Restart** (o `railway redeploy`) |
| Volver a la versión anterior | Deployments → despliegue anterior → **Rollback** (o `railway redeploy` sobre ese despliegue) |
| Cambiar una variable | Editarla en **Variables**; Railway redespliega solo |

Reiniciar **no borra datos** si hay volumen. Sin volumen, sí.

## Si algo falla

| Síntoma | Qué mirar |
| --- | --- |
| Despliegue en `FAILED` | `railway logs --build`: casi siempre `npm ci` (desfase entre `package.json` y `package-lock.json`) o un error de `vite build` |
| El servicio arranca pero la página da 502 | El servidor debe escuchar en `PORT`; no lo sobrescribas. Revisa el log de arranque: debe imprimir `[intranet] http://localhost:<PORT>` |
| Nadie puede iniciar sesión | Log: `Sin GESTOR_USER/GESTOR_PASSWORD ni ADMIN_USER/ADMIN_PASSWORD`. Define las variables y redespliega: los usuarios iniciales se crean al arrancar si no existen |
| Perdí usuarios/noticias tras desplegar | No hay volumen o `DATA_DIR` no apunta a él |
| Piden iniciar sesión otra vez tras cada despliegue | Falta `SESSION_SECRET` |
| Las solicitudes no envían correo | Sin `SMTP_HOST` no se envía; revisa `data/outbox` y `MAIL_MODE` |
| El mapa de Promotores no carga | Usa teselas de OpenStreetMap: requiere salida a internet desde el navegador |
| Subir videos grandes | La API acepta cuerpos JSON de hasta 60 MB; los videos de Promotores e Infraestructura van en `public/media` (parte del build), no se suben por la API |

## Desarrollo local vs. producción

| | Local | Producción |
| --- | --- | --- |
| Web | Vite en `:5173` (proxy a `/api`) | El mismo Express sirve `dist/` |
| API | `node --watch` en `:3001` | `node server/index.js` en `$PORT` |
| Datos | `./data` | `DATA_DIR` (volumen) |
| Usuarios | Se crean `gestor`, `ti`, `admin` de desarrollo | Solo los definidos en variables |
| Cookie | Sin `Secure` | `Secure` (requiere HTTPS) |
| Correo | `outbox/*.eml` | SMTP si se configura |
