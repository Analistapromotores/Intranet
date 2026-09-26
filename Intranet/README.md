# Intranet Gestión y Servicios

Intranet corporativa de Gestión y Servicios: portada con noticias y cumpleaños, módulos por proyecto
(Promotores, Infraestructura, Corpoquindío, Mediadores, Pasaportes), formularios de Solicitudes,
reserva de salas, ausentismo laboral y un panel de TI.

> **Para quién es este documento:** una persona de desarrollo o TI que necesita **levantar el proyecto
> en su equipo** o entender **qué piezas lo componen**. Al terminar, tendrás la intranet corriendo en
> `http://localhost:5173` con datos de prueba.

| Documento | Para qué sirve |
| --- | --- |
| **Este README** | Levantar el entorno y conocer la estructura |
| [docs/erd.md](docs/erd.md) | Modelo de datos y cómo se relacionan las entidades |
| [docs/reglas-de-negocio.md](docs/reglas-de-negocio.md) | Reglas que no se ven a simple vista en el código |
| [docs/despliegue.md](docs/despliegue.md) | Dónde está en producción, cómo desplegar y reiniciar |
| [docs/usuarios-y-permisos.md](docs/usuarios-y-permisos.md) | Roles, qué puede hacer cada uno y cómo viaja la información |

## Arquitectura en una mirada

```
Navegador (React 19 + Vite)  ──HTTP/JSON──►  Servidor Express 5  ──►  Archivos JSON + uploads
   src/                          /api/*        server/index.js          DATA_DIR (volumen en Railway)
```

- **Frontend:** React 19 con enrutamiento por *hash* (`#promotores`, `#noticias`…), sin librería de rutas. El mapa
  de rutas está en [src/App.jsx](src/App.jsx).
- **Backend:** un solo proceso Express ([server/index.js](server/index.js)) que sirve la API en `/api` y, en
  producción, el build de Vite (`dist/`).
- **Almacenamiento:** archivos JSON con escritura atómica y en serie ([server/store.js](server/store.js)).
  No hay base de datos. Ver el porqué en [docs/erd.md](docs/erd.md#por-qué-archivos-json).
- **Sesiones:** cookie `gys_session` firmada con HMAC; contraseñas con `scrypt`.

Diagramas editables (Excalidraw) en [docs/diagramas/](docs/diagramas/).

## Requisitos

- **Node.js 20.19 o superior** (el `Dockerfile` usa Node 22).
- npm (viene con Node).
- Windows, macOS o Linux. En Windows, si PowerShell bloquea `npm`, usa `iniciar.bat` (ver abajo) o
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## Levantar el entorno local

```bash
cd Intranet
npm ci                 # instala dependencias
npm run dev:api        # terminal 1 → API en http://localhost:3001
npm run dev            # terminal 2 → web en http://localhost:5173
```

Atajo en Windows: doble clic en `iniciar.bat` (o `./iniciar.ps1`). Arranca los dos procesos y muestra la
IP de la red local para abrir la intranet desde otro equipo (`npm run dev -- --host`).

**Cómo saber que funcionó**

1. `http://localhost:5173` muestra la portada.
2. `http://localhost:3001/api/salas` responde un JSON con la sala del piso 2.
3. Inicia sesión con un usuario de desarrollo (abajo) y aparece tu nombre en el menú lateral.

Vite reenvía `/api` y `/uploads` al puerto 3001 ([vite.config.js](vite.config.js)), por eso no hace falta
configurar CORS.

### Usuarios de desarrollo

Solo se crean cuando `NODE_ENV` **no** es `production` y no hay variables definidas:

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `gestor` | `cumple2026` | gestor |
| `ti` | `ti12345` | ti |
| `admin` | `admin` | admin |

Se guardan en `data/users.json` la primera vez. Si ya existe ese archivo, no se vuelven a crear.

## Variables de entorno

Copia `.env.example` a `.env` **solo** si necesitas cambiar algo; en local no hace falta ninguna. El servidor
las lee de `process.env` (no carga `.env` por sí mismo: expórtalas o usa las variables del servicio en Railway).

| Variable | Qué hace | Valor por defecto |
| --- | --- | --- |
| `PORT` / `API_PORT` | Puerto del servidor | `3001` |
| `DATA_DIR` | Carpeta de datos (JSON, fotos, Excel generados, `outbox`) | `./data` |
| `SESSION_SECRET` | Firma de sesiones. Sin ella, reiniciar cierra todas las sesiones | aleatoria por arranque |
| `GESTOR_USER` / `GESTOR_PASSWORD` | Usuario gestor inicial | solo en desarrollo |
| `TI_USER` / `TI_PASSWORD` | Usuario de TI inicial | solo en desarrollo |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Administrador inicial | solo en desarrollo |
| `MAIL_MODE` | `produccion` envía a los destinatarios reales; cualquier otro valor manda todo a `EMAIL_PRUEBAS` | `pruebas` |
| `EMAIL_PRUEBAS` | Buzón que recibe todo mientras `MAIL_MODE` ≠ `produccion` | ver `server/config.js` |
| `EMAIL_PRODUCCION` | Destino de Informe de Ingreso y Orden de Servicio | `gerenciaadmin@gestionyservicios.com.co` |
| `EMAIL_PRESTAMOS` | Destino de Préstamo de equipos | `EMAIL_PRODUCCION` |
| `EMAIL_TI` | Destino del resumen diario de alertas de TI (en producción) | `EMAIL_PRODUCCION` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Servidor de correo. **Sin `SMTP_HOST` no se envía nada**: cada correo se guarda como `.eml` en `DATA_DIR/outbox` | vacío |
| `MAIL_FROM` | Remitente | `Intranet Gestión y Servicios <no-responder@…>` |
| `URL_GLPI` | Enlace a la mesa de ayuda | `https://glpi.gestionyservicios.com.co/` |
| `VITE_GLPI_URL` | Igual, pero para el navegador (se fija al compilar) | ver `.env.example` |

> ⚠️ El correo de pruebas por defecto en `server/config.js` (`…@gstionyservicios.com.co`) parece tener un
> error de digitación («gstiony…»). Define `EMAIL_PRUEBAS` explícitamente.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Vite con recarga en caliente |
| `npm run dev:api` | API con `node --watch` sobre `server/` |
| `npm run build` | Compila el frontend a `dist/` |
| `npm start` | Corre el servidor de producción (sirve `dist/` y la API) |
| `npm run lint` | ESLint |
| `npm run mapa:promotores` | Convierte el Excel «MAPA DE INTERVENCIONES» a JSON para el mapa de Promotores |
| `npm run geo:cali` | Descarga los polígonos de comunas/barrios de Cali (IDESC, WFS) |

Para probar el build de producción en local: `npm run build && NODE_ENV=production npm start` y abre
`http://localhost:3001`. En producción la cookie de sesión es `Secure`, así que solo funciona por HTTPS.

## Estructura del proyecto

```
Intranet/
├─ src/                    Frontend
│  ├─ App.jsx              Enrutamiento por hash y composición de la portada
│  ├─ components/          Header, Sidebar, tarjetas, VideoPlayer, Lightbox…
│  ├─ pages/               Un módulo por carpeta: noticias, promotores, infraestructura,
│  │                       gys, cumpleanos, solicitudes (incluye salas, ausentismo
│  │                       y gestión), ti, admin, mediadores, pasaportes…
│  ├─ data/                Menús, índice de búsqueda, proyectos, extensiones, festivos
│  ├─ lib/                 Sesión, redes sociales, video
│  └─ assets/              Imágenes y documentos empaquetados por Vite
├─ server/                 Backend Express
│  ├─ index.js             Sesiones, roles, cumpleaños, usuarios, arranque
│  ├─ store.js             Lectura/escritura atómica de JSON
│  ├─ config.js            Variables de entorno (datos, correo)
│  ├─ noticias/  salas/  solicitudes/  ti/     Un router por módulo
│  └─ templates/           Excel base (FT-OP-76, informe de ingreso, orden de servicio)
├─ shared/                 Reglas de validación compartidas por navegador y servidor
├─ public/                 Estáticos (favicon, videos de Promotores e Infraestructura)
├─ scripts/                Generadores de datos del mapa
├─ data/                   Datos locales (ignorado por git)
├─ Dockerfile  railway.json   Despliegue
└─ docs/                   Documentación
```

**Regla de oro del código:** lo que valida el formulario en el navegador también lo valida el servidor con el
mismo código de `shared/`. Si cambias una regla, cámbiala ahí y se aplica en los dos lados.

## Problemas frecuentes

| Síntoma | Causa y arreglo |
| --- | --- |
| `npm.ps1 … la ejecución de scripts está deshabilitada` | Política de PowerShell. Usa `iniciar.bat` o `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| «Tu sesión terminó» tras cada reinicio del servidor | Falta `SESSION_SECRET`; se genera uno nuevo en cada arranque |
| Sin sesión posible en producción | No hay `*_USER`/`*_PASSWORD`; el servidor avisa en el log y nadie puede entrar |
| Los correos no llegan | Sin `SMTP_HOST` se guardan en `data/outbox/*.eml`; con `MAIL_MODE` ≠ `produccion` todo va a `EMAIL_PRUEBAS` |
| Al abrir por `http://IP:5173` fallan cosas de crypto | Los navegadores limitan `crypto.randomUUID` fuera de HTTPS/localhost; el editor de noticias ya trae un respaldo |
| Puerto 5173 o 3001 ocupado | Cierra el proceso que lo usa; no relances con `taskkill /IM node.exe` si tienes otros Node abiertos |
