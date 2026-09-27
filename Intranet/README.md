# Intranet Gestión y Servicios

Intranet corporativa de Gestión y Servicios: portada con carrusel, noticias y comunicados, cumpleaños, calendario
corporativo con reservas y reuniones, módulos por proyecto (Promotores, Infraestructura, Corpoquindío, Mediadores,
Pasaportes), formularios de Solicitudes, reserva de salas, ausentismo laboral y panel de TI.

**Sitio en producción:** https://intranet-production-a9d0.up.railway.app

| Documento | Para qué sirve |
| --- | --- |
| **Este README** | Levantar el entorno, variables y estructura del proyecto |
| [docs/erd.md](docs/erd.md) | Modelo de datos y relaciones entre entidades |
| [docs/reglas-de-negocio.md](docs/reglas-de-negocio.md) | Reglas que no son obvias al leer el código |
| [docs/despliegue.md](docs/despliegue.md) | Dónde está, cómo desplegar y reiniciar, dominios, puertos y servicios |
| [docs/usuarios-y-permisos.md](docs/usuarios-y-permisos.md) | Roles, permisos, reglas de acceso y flujo de la información |

## Arquitectura

![Arquitectura](docs/diagramas/arquitectura.png)

- **Frontend:** React 19 + Vite 8, con enrutamiento por *hash* (`#promotores`, `#noticias`…) y carga por secciones
  (cada vista se descarga al abrirla). El mapa de rutas está en [src/App.jsx](src/App.jsx).
- **Backend:** un servicio Node con Express 5 ([server/index.js](server/index.js)) que sirve la API en `/api` y, en
  producción, el build de Vite (`dist/`).
- **Datos:** PostgreSQL. Cada colección (usuarios, personas, noticias, solicitudes…) es una fila de la tabla `kv`
  y los archivos (fotos, Excel generados) están en la tabla `blobs` ([server/store.js](server/store.js)).
  En desarrollo, sin `DATABASE_URL`, los mismos datos se guardan en archivos dentro de `data/`.
- **Sesiones:** cookie `gys_session` firmada con HMAC (12 h); contraseñas con `scrypt`.
- **Correo:** API de Gmail con una cuenta de servicio de Google (o SMTP).

## Requisitos

- **Node.js 20.19 o superior** (el `Dockerfile` usa Node 22) y npm.
- Windows, macOS o Linux. En Windows, si PowerShell bloquea `npm`, usa `iniciar.bat` o
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- No hace falta instalar una base de datos para desarrollar.

## Levantar el entorno local

```bash
cd Intranet
npm ci                 # instala dependencias
npm run dev:api        # terminal 1 → API en http://localhost:3001
npm run dev            # terminal 2 → web en http://localhost:5173
```

Atajo en Windows: doble clic en `iniciar.bat` (o `./iniciar.ps1`). Arranca los dos procesos y muestra la IP de la
red local para abrir la intranet desde otro equipo.

**Cómo comprobar que funcionó**

1. `http://localhost:5173` muestra la portada.
2. `http://localhost:3001/api/health` responde `{"ok":true,"db":"archivos"}`.
3. Inicia sesión con un usuario de desarrollo y aparece tu nombre en el menú lateral.

Vite reenvía `/api` y `/uploads` al puerto 3001 ([vite.config.js](vite.config.js)); no se necesita CORS.

### Usuarios de desarrollo

Se crean solo cuando `NODE_ENV` no es `production` y no hay variables definidas:

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `gestor` | `cumple2026` | gestor |
| `ti` | `ti12345` | ti |
| `admin` | `admin` | admin |

### Probar con PostgreSQL en local (opcional)

```bash
DATABASE_URL=postgres://usuario:clave@localhost:5432/intranet npm run dev:api
```

Al arrancar crea las tablas `kv` y `blobs` si no existen. Para copiar los datos de la carpeta `data/` a la base:
`DATABASE_URL=... npm run db:migrar`.

## Variables de entorno

En local no hace falta ninguna. En Railway se definen en *Variables* del servicio.

| Variable | Qué hace | Valor por defecto |
| --- | --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL (en Railway: `${{Postgres.DATABASE_URL}}`) | archivos en `DATA_DIR` |
| `PGSSL` / `PG_POOL` | `true` si la base exige SSL / conexiones máximas | — / `10` |
| `PORT` | Puerto del servidor (lo asigna Railway) | `3001` |
| `SITE_URL` | Dirección pública (enlace canónico, imagen social, sitemap) | se toma del host |
| `SESSION_SECRET` | Firma de las sesiones | aleatoria por arranque |
| `GESTOR_USER` / `GESTOR_PASSWORD` | Usuario gestor inicial | solo en desarrollo |
| `TI_USER` / `TI_PASSWORD` | Usuario de TI inicial | solo en desarrollo |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Administrador inicial | solo en desarrollo |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON de la cuenta de servicio de Google (envío por Gmail) | — |
| `GMAIL_SENDER` | Buzón del dominio desde el que se envía | — |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Alternativa SMTP | — |
| `MAIL_MODE` | `produccion` envía a los destinatarios reales; otro valor manda todo a `EMAIL_PRUEBAS` | `pruebas` |
| `EMAIL_PRUEBAS` | Buzón que recibe todo en modo pruebas | `analistapromotores@gestionyservicios.com.co` |
| `EMAIL_PRODUCCION` | Destino de Informe de Ingreso y Orden de Servicio | `gerenciaadmin@gestionyservicios.com.co` |
| `EMAIL_PRESTAMOS` | Destino de Préstamo de equipos | `EMAIL_PRODUCCION` |
| `EMAIL_TI` | Destino del resumen diario de alertas de TI | `EMAIL_PRODUCCION` |
| `MAIL_FROM` | Remitente cuando se usa SMTP | `Intranet Gestión y Servicios <no-responder@…>` |
| `URL_GLPI` / `VITE_GLPI_URL` | Enlace a la mesa de ayuda (servidor / navegador) | glpi.gestionyservicios.com.co |
| `DATA_DIR` | Carpeta de datos en modo archivos | `./data` |

Los secretos (`GOOGLE_SERVICE_ACCOUNT_JSON`, contraseñas, `SESSION_SECRET`, `DATABASE_URL`) viven solo en el
servidor: nunca en el repositorio ni en el frontend. `.env` está en `.gitignore`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Vite con recarga en caliente |
| `npm run dev:api` | API con `node --watch` sobre `server/` |
| `npm run build` | Compila el frontend a `dist/` |
| `npm start` | Servidor de producción (sirve `dist/` y la API) |
| `npm run lint` | ESLint |
| `npm run db:migrar` | Copia `data/` a PostgreSQL |
| `npm run mapa:promotores` | Convierte el Excel «MAPA DE INTERVENCIONES» a JSON para el mapa de Promotores |
| `npm run geo:cali` | Descarga los polígonos de comunas y barrios de Cali (IDESC) |

Para probar el build de producción en local: `npm run build && NODE_ENV=production npm start` y abre
`http://localhost:3001`.

## Estructura

```
Intranet/
├─ src/                    Frontend
│  ├─ App.jsx              Enrutamiento por hash, títulos por sección y portada
│  ├─ components/          Header, Sidebar, calendario, tarjetas, ErrorBoundary, VideoPlayer…
│  ├─ pages/               Un módulo por carpeta: noticias, promotores, infraestructura, gys, cumpleanos,
│  │                       solicitudes (incluye salas, ausentismo y gestión), ti, admin, mediadores,
│  │                       pasaportes, estados (404)…
│  ├─ data/                Menús, índice de búsqueda, proyectos, extensiones, festivos
│  ├─ lib/                 Sesión, redes sociales, video
│  └─ assets/              Imágenes y documentos empaquetados por Vite
├─ server/                 Backend Express
│  ├─ index.js             Sesiones, roles, cumpleaños, usuarios, arranque
│  ├─ store.js             PostgreSQL (o archivos en desarrollo): colecciones y archivos
│  ├─ seguridad.js         Cabeceras, HTTPS, origen, límites de uso, verificación de imágenes, errores
│  ├─ config.js            Variables de entorno (datos y correo)
│  ├─ noticias/  salas/  solicitudes/  ti/     Un router por módulo (solicitudes incluye gmail.js)
│  └─ templates/           Excel base (FT-OP-76, informe de ingreso, orden de servicio)
├─ shared/                 Reglas de validación compartidas por navegador y servidor
├─ public/                 Estáticos (favicon, imagen social, videos de Promotores e Infraestructura)
├─ scripts/                Generadores de datos del mapa y migración a PostgreSQL
├─ Dockerfile  railway.json   Despliegue
└─ docs/                   Documentación y diagramas
```

**Regla de oro:** lo que valida el formulario en el navegador lo valida el servidor con el mismo código de
`shared/`. Si cambias una regla, cámbiala ahí y se aplica en los dos lados.

## Preguntas frecuentes

| Situación | Qué hacer |
| --- | --- |
| `npm.ps1 … la ejecución de scripts está deshabilitada` | Usa `iniciar.bat` o `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Las sesiones se cierran al reiniciar el servidor | Define `SESSION_SECRET` |
| Los correos no salen en local | Sin Gmail ni SMTP se guardan como `.eml` en la bandeja del sistema; con `MAIL_MODE` ≠ `produccion` todo va a `EMAIL_PRUEBAS` |
| Abrir la intranet desde otro equipo de la red | Usa la IP que muestra `iniciar.bat` (`http://IP:5173`) |
