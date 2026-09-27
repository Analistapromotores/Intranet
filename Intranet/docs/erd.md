# Modelo de datos (ERD)

Esta guía explica **qué se guarda, dónde y cómo se relaciona**, para consultar, construir reportes o ampliar el
sistema. Diagrama editable: [diagramas/erd.excalidraw](diagramas/erd.excalidraw) (ábrelo en <https://excalidraw.com>).

![Modelo de datos](diagramas/erd.png)

## Cómo se almacena

Los datos viven en **PostgreSQL** (servicio propio en Railway, con volumen persistente) y se organizan en dos tablas:

| Tabla | Contenido | Columnas |
| --- | --- | --- |
| `kv` | Una fila por **colección** (usuarios, personas, noticias, solicitudes…) | `name` (PK, p. ej. `people.json`), `data` (jsonb), `updated_at` |
| `blobs` | **Archivos**: fotos, imágenes de noticias, Excel generados, correos guardados | `name` (PK, p. ej. `uploads/<uuid>.webp`), `mime`, `data` (bytea), `created_at` |

Cada modificación se hace dentro de una **transacción con bloqueo de fila** (`SELECT … FOR UPDATE`): dos peticiones
simultáneas sobre la misma colección se ejecutan una tras otra, sin pisarse. Por eso los consecutivos de las
solicitudes y las reservas de una sala nunca se duplican. Las lecturas son directas.

Al arrancar, el servidor crea las tablas si no existen y espera a la base hasta 20 segundos. En desarrollo, sin
`DATABASE_URL`, la misma interfaz guarda las colecciones como JSON en `data/` y los archivos en `data/blobs/`.

## Diagrama entidad-relación

```mermaid
erDiagram
    USERS ||--o{ NOTICIAS : "autor (nombre)"
    USERS ||--o{ SOLICITUD_HISTORIAL : "por (nombre)"
    PEOPLE ||--o{ WISHES : "personId"
    SOLICITUDES ||--|{ SOLICITUD_HISTORIAL : "contiene"
    SOLICITUDES ||--o| ARCHIVO_XLSX : "archivo.ruta"
    SOLICITUDES ||--o| CORREO_ENVIADO : "correo"
    NOTICIAS ||--o{ BLOQUES : "bloques[]"
    NOTICIAS ||--o| UPLOAD : "portada"
    BLOQUES ||--o| UPLOAD : "imagen.archivo"
    PEOPLE ||--o| UPLOAD : "photo"
    SALAS_CATALOGO ||--o{ RESERVAS : "sala"
    TI_LINEAS }o--|| TI_CONFIG : "diasRecarga / diasAviso"
    TI_CORREOS }o--|| TI_CONFIG : "diasInactivo"

    USERS {
        string username PK "3-32, único sin distinguir mayúsculas"
        string name
        string role "gestor | ti | admin"
        string password "scrypt salt:hash"
    }
    PEOPLE {
        uuid id PK
        string name
        string cargo
        string area
        string message "máx 240"
        int month "1-12"
        int day
        int year "opcional"
        bool published
        string photo "archivo en blobs"
    }
    WISHES {
        uuid id PK
        string key "llave de quien felicita"
        uuid personId FK
        int year
        string name "máx 40"
        string message "máx 160"
        iso createdAt
    }
    NOTICIAS {
        uuid id PK
        string tipo "noticia | comunicado"
        string titulo
        string resumen "máx 280"
        string portada "archivo en blobs"
        bool destacado
        bool publicado
        string autor "nombre del usuario"
        iso publicadoEn
    }
    BLOQUES {
        string id
        string type "titulo|texto|imagen|enlace|cita|video|separador"
        json contenido "según el tipo"
    }
    REDES {
        string id PK "instagram|facebook|linkedin|youtube"
        string perfil
        string publicacion
    }
    SOLICITUDES {
        uuid id PK
        string numero UK "II-2026-0001"
        string tipo "informe_ingreso|orden_servicio|prestamo_equipos"
        string estado
        json datos "campos del formulario"
        iso creada
    }
    SOLICITUD_HISTORIAL {
        string estado
        iso fecha
        string comentario
        string por
    }
    ARCHIVO_XLSX {
        string nombre
        string ruta "solicitudes/id.xlsx en blobs"
    }
    CORREO_ENVIADO {
        string estado "enviado | simulado | error"
        string to
        iso fecha
        string canal "gmail | smtp"
    }
    RESERVAS {
        uuid id PK
        string tipo "reserva | evento"
        string sala FK "opcional en eventos"
        string lugar "solo eventos sin sala"
        date fecha
        string inicio "HH:MM"
        string fin "HH:MM"
        string colaborador "correo (reservas)"
        string nombre
        string descripcion "máx 160"
        string key "llave para cancelar"
    }
    SALAS_CATALOGO {
        string id PK "piso2"
        string nombre
    }
    TI_LINEAS {
        uuid id PK
        string grupo "principal | caja_menor"
        string linea
        string area
        int plan "pesos"
        date recarga
        date vence
    }
    TI_CORREOS {
        uuid id PK
        string nombre
        string correo
        string estado
        date ultimoAcceso
        int diasReportados
    }
    TI_CONFIG {
        int diasAviso "5"
        int diasInactivo "30"
        int diasRecarga "30"
        bool correoAuto
        date ultimoResumen
    }
    UPLOAD {
        string archivo "uuid.webp | jpg | png"
    }
```

## Dónde vive cada entidad

| Entidad | Nombre en `kv` / `blobs` | Forma del dato | Código |
| --- | --- | --- | --- |
| Usuarios | `users.json` | `[ usuario ]` | [server/index.js](../server/index.js) |
| Personas (cumpleaños) | `people.json` | `[ persona ]` | [server/index.js](../server/index.js) |
| Felicitaciones | `wishes.json` | `[ felicitación ]` | [server/index.js](../server/index.js) |
| Noticias y comunicados | `noticias.json` | `{ items: [ publicación ] }` | [server/noticias/routes.js](../server/noticias/routes.js) |
| Redes sociales | `redes.json` | `{ items: [ red ] }` | [server/noticias/routes.js](../server/noticias/routes.js) |
| Solicitudes | `solicitudes.json` | `{ consecutivos: { "II-2026": 3 }, items: [ … ] }` | [server/solicitudes/routes.js](../server/solicitudes/routes.js) |
| Reservas y reuniones | `reservas.json` | `{ items: [ reserva | evento ] }` | [server/salas/routes.js](../server/salas/routes.js) |
| Líneas móviles | `ti-lineas.json` | `{ items: [ línea ] }` | [server/ti/routes.js](../server/ti/routes.js) |
| Correos (reporte de inactivos) | `ti-correos.json` | `{ actualizado, items: [ correo ] }` | ídem |
| Configuración de alertas de TI | `ti-config.json` | `{ diasAviso, diasInactivo, diasRecarga, correoAuto, ultimoResumen }` | ídem |
| Fotos e imágenes | `blobs`: `uploads/<uuid>.webp\|jpg\|png` | binario, servido en `/uploads/<archivo>` | varios |
| Excel de solicitudes | `blobs`: `solicitudes/<id>.xlsx` | binario | [server/solicitudes/routes.js](../server/solicitudes/routes.js) |
| Correos guardados (sin Gmail ni SMTP) | `blobs`: `outbox/*.eml` | RFC 822 | [server/solicitudes/mailer.js](../server/solicitudes/mailer.js) |

Los catálogos de salas, tipos y estados de solicitud y opciones de formularios están en código compartido:
[shared/salas.js](../shared/salas.js) y [shared/solicitudes.js](../shared/solicitudes.js).

## Relaciones

| Relación | Cómo se enlaza | Detalle |
| --- | --- | --- |
| Persona → Felicitaciones | `wishes.personId = people.id` | Al eliminar una persona se eliminan sus felicitaciones y su foto |
| Publicación → autor | `noticias.autor` guarda el nombre | Conserva el nombre con el que se publicó |
| Solicitud → historial | Lista incrustada | `por` guarda el nombre de quien cambió el estado; en el primer registro, el solicitante |
| Solicitud → Excel | `archivo.ruta = <id>.xlsx` | «Reenviar» lo regenera y reemplaza |
| Publicación, bloque o persona → imagen | Nombre de archivo en `blobs` | Las imágenes que dejan de usarse se eliminan |
| Reserva → sala | `reservas.sala = SALAS[].id` | Los eventos pueden ir sin sala (con `lugar`) |
| Reserva → dueño | `colaborador` (correo) + `key` | Cancelar exige la `key` o una sesión (los eventos, sesión de administrador) |
| Solicitud → solicitante | Correo o cédula dentro de `datos` | La consulta pública busca por cédula o por correo |

## Numeración de solicitudes

`numero = <prefijo>-<año>-<consecutivo de 4 dígitos>`, por ejemplo `OS-2026-0007`. Prefijos: `II` (Informe de Ingreso),
`OS` (Orden de Servicio) y `PE` (Préstamo de equipos). El consecutivo se guarda en
`solicitudes.json → consecutivos["OS-2026"]`, se asigna dentro de la misma transacción que crea la solicitud y
reinicia cada año.

## Consultas de ejemplo

```sql
-- Colecciones y su tamaño
SELECT name, pg_column_size(data) AS bytes, updated_at FROM kv ORDER BY name;

-- Solicitudes por estado
SELECT s->>'estado' AS estado, count(*)
FROM kv, jsonb_array_elements(data->'items') s
WHERE name = 'solicitudes.json' GROUP BY 1;

-- Archivos guardados y su peso
SELECT split_part(name, '/', 1) AS carpeta, count(*), pg_size_pretty(sum(length(data))) FROM blobs GROUP BY 1;
```
