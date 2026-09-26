# Reglas de negocio

> **Para quién es:** quien va a cambiar o revisar el comportamiento de la intranet y necesita saber **qué
> reglas existen aunque no se vean en la pantalla**. Solo se listan reglas que **no son obvias** al leer un
> formulario o una ruta; cada una indica dónde vive en el código y por qué existe.

Convención: **[srv]** la aplica el servidor (no se puede saltar desde el navegador), **[web]** solo el
navegador, **[ambos]** el mismo código en `shared/` corre en los dos lados.

## Zona horaria y fechas

| Regla | Dónde |
| --- | --- |
| «Hoy» siempre es la fecha de **Colombia (`America/Bogota`)**, no la del servidor. Railway corre en UTC; sin esto los cumpleaños y las reservas cambiarían de día a las 7 p. m. | `hoyBogota()` en `server/index.js`, `server/salas/routes.js`, `server/ti/routes.js` |
| Las fechas se guardan como texto `AAAA-MM-DD` y las marcas de tiempo en ISO UTC. | todo el servidor |
| El resumen diario de TI sale a las **8:00 a. m. hora Colombia** o después, una sola vez al día. | `programarResumenDiario()` |

## Cumpleaños y felicitaciones

- **Ventana de felicitación [srv]:** se puede felicitar desde el **día anterior hasta el día siguiente** al
  cumpleaños (3 días). Fuera de esa ventana el servidor responde 400. Se comparan las fechas en tres años
  (`y-1, y, y+1`) para que funcione en el cambio de año (31 dic ↔ 1 ene).
- **Solo personas publicadas [srv]:** la portada y la API pública ignoran a quien tenga `published: false`.
  Al crear, `published` es `true` salvo que se envíe explícitamente `false`.
- **El año de nacimiento es opcional** y nunca se muestra en la vista pública.
- **Felicitar sin cuenta:** quien felicita recibe una `key` secreta. Con ella puede **agregar o cambiar su
  mensaje** después (`PATCH …/wishes/:wid`). Es una prueba de posesión, no un usuario. La comparación es de
  tiempo constante.
- **Contador por año [srv]:** las felicitaciones se cuentan por `(persona, año)`; el muro muestra solo las del
  año actual y hasta 40 mensajes.
- **Freno de abuso [srv]:** máximo **40 felicitaciones por IP cada 10 min**. Es alto a propósito porque toda la
  oficina sale con la misma IP.
- **Carga masiva [srv]:** máximo 2000 filas; una fila se considera duplicada si coinciden
  `nombre (sin mayúsculas) + mes + día`; los duplicados se **omiten**, no se actualizan.
- **Foto:** WebP/JPEG/PNG, máximo **2,5 MB**; el navegador la redimensiona antes de enviarla.
- Al **eliminar una persona** se borran también su foto y todas sus felicitaciones.

## Noticias y comunicados

- **Solo lo publicado es público [srv]:** `GET /noticias` filtra `publicado`. Un borrador solo se puede abrir
  por id **con sesión**; sin sesión responde 404 (no revela que existe).
- **Orden [srv]:** primero los **destacados**, luego por fecha de publicación descendente.
- **`publicadoEn` es la primera vez que se hizo visible**: despublicar y volver a publicar no cambia la fecha.
- **Contenido por bloques:** el contenido es una lista de bloques (`titulo`, `texto`, `imagen`, `enlace`, `cita`,
  `video`, `separador`), máximo **60**. Los bloques vacíos (sin texto, sin imagen o sin URL) se descartan al
  guardar, y los tipos desconocidos se ignoran.
- **Enlaces seguros [srv]:** solo `http`, `https` y `mailto`. Un `javascript:` o `data:` se convierte en vacío
  (y el bloque se descarta). Si escriben `ejemplo.com` sin protocolo, se completa con `https://`.
- **Imágenes:** máximo **8 MB** cada una. La portada y las imágenes **no se recortan**: se guardan tal como se
  subieron (las tarjetas usan fondo difuminado para no deformarlas).
- **Limpieza de archivos:** al editar o eliminar, las imágenes que dejan de usarse se **borran del disco**.
- **Título:** mínimo 4 letras. El resumen se recorta a 280 caracteres.

### Redes sociales

- El gestor pega el enlace del **perfil** y el de la **última publicación**; no hay tokens ni APIs de las redes.
- **Se valida el dominio [srv]:** un enlace de Instagram debe ser de `instagram.com`; el de Facebook de
  `facebook.com`/`fb.watch`/`fb.com`; etc. Si no coincide, se rechaza.
- **Se quitan rastreadores** (`utm_*`, `igsh`, `igshid`, `fbclid`, `mibextid`, `si`…) antes de guardar.
- **Enlaces «compartir» de Facebook** (`facebook.com/share/…`) se **resuelven** siguiendo la redirección (8 s de
  espera) y se guarda el enlace real. Si falla o pide login, se guarda el original.

## Solicitudes

| Regla | Detalle |
| --- | --- |
| **Numeración** | `<prefijo>-<año>-<0001>`; consecutivo por serie y año, se asigna dentro de la cola de escritura para no repetirse |
| **Estados** | `borrador`, `enviada`, `en_proceso`, `pendiente`, `aprobada`, `rechazada`, `cerrada`. Toda solicitud nueva nace `enviada` |
| **Historial** | Cada cambio de estado agrega una entrada `{estado, fecha, comentario, por}`; nunca se sobrescribe |
| **Se registra primero, se envía después** | La solicitud se guarda **antes** de generar el Excel y el correo. Si eso falla, responde **201** con un `aviso` y la solicitud queda registrada; gestión puede usar «reenviar» |
| **Consulta pública** | Exige **número + correo** del solicitante; con uno solo no se encuentra. La vista pública **oculta** salario, documentos y firma |
| **Correo del solicitante** | En Informe de Ingreso es `solicitanteCorreo`; en las otras, `correo`. Se compara en minúsculas |
| **Freno de abuso** | 20 solicitudes por IP por hora |
| **Excel** | Informe de Ingreso y Orden de Servicio generan un `.xlsx` desde una plantilla de `server/templates`. Préstamo de equipos **no** genera archivo |
| **Destinatario** | Informe de Ingreso y Orden → `EMAIL_PRODUCCION`; Préstamo → `EMAIL_PRESTAMOS` (por defecto el mismo). El `Reply-To` es el correo del solicitante |
| **Modo pruebas** | Mientras `MAIL_MODE` ≠ `produccion` **todo** va a `EMAIL_PRUEBAS`, con asunto `[PRUEBA]` y un aviso en el cuerpo. Sin SMTP configurado, el correo se guarda en `outbox/*.eml` |

### Validaciones que sorprenden [ambos]

- **Informe de Ingreso:** fecha de ingreso **no anterior** a la de solicitud; máximo **3 beneficios** (es el
  espacio del formato); si la periodicidad es «Otro», hay que especificarla; salario y auxilio de transporte
  obligatorios.
- **Orden de Servicio:** los **porcentajes de evaluación deben sumar exactamente 100 %**; 4 competencias
  obligatorias; mínimo 4 responsabilidades (hay 5 espacios); hasta 3 documentos; justificación de **20 a 600**
  caracteres; salario > 0.
- **Préstamo de equipos:** entre 1 y **10** elementos; la devolución no puede ser anterior a la fecha requerida.
- **Fechas pasadas = advertencia, no error:** una fecha requerida o de ingreso que ya pasó avisa pero **no
  bloquea**, porque puede ser un registro tardío legítimo.
- **Nombre completo:** mínimo 5 caracteres (obliga a escribir nombre y apellido).
- **Firma:** llega como imagen; se quita de la vista de gestión y del reporte público.

## Reserva de salas

- **Horario:** solo entre **7:00 y 19:00**; el fin debe ser posterior al inicio.
- **Choques [srv]:** dos reservas de la misma sala y fecha se cruzan si `inicio₁ < fin₂ y inicio₂ < fin₁`. Es
  decir, **terminar a las 10:00 y empezar a las 10:00 no choca**. La verificación y el guardado ocurren en la
  misma operación atómica, así que dos personas no pueden reservar el mismo hueco a la vez (la segunda recibe 409).
- **No se reserva en el pasado** (`fecha ≥ hoy`).
- **Sin cuentas:** se identifica a quien reserva por **correo + nombre**. Recibe una `key` para cancelar.
- **Cancelar:** solo quien tenga la `key` **o cualquier usuario con sesión** (gestor, TI o admin).
- **Freno:** 60 reservas por IP por hora.
- Las salas son un catálogo en código (`shared/salas.js`); hoy existe una (**Sala piso 2**).

## Ausentismo laboral (FT-OP-76)

- **No se guarda nada:** el servidor rellena la plantilla `ausentismo.xlsx` y la devuelve para descargar.
- **El formato trae dos copias en la misma hoja** (desplazadas 33 filas): se rellenan ambas.
- Máximo **5 colaboradores** por formato; identificación de 5 a 15 caracteres alfanuméricos.
- Si no hay hora, se asume el día completo (`00:00` a `23:59`) para validar que el fin no sea anterior al inicio.
- **Las firmas quedan en blanco** a propósito (colaborador y Talento Humano): se firma a mano al imprimir.
- Freno: 120 por IP por hora.

## Panel de TI

- **Estado de una línea móvil:** `vencida` si `vence < hoy`; `por_vencer` si faltan `diasAviso` días o menos
  (5 por defecto); `sin_fecha` si no tiene vencimiento; si no, `ok`.
- **Recargar** fija `recarga = hoy` (o la fecha indicada) y `vence = recarga + diasRecarga` (30 por defecto).
- Si al crear una línea se da la recarga pero no el vencimiento, el vencimiento se calcula igual.
- **Correo inactivo:** alerta cuando lleva `diasInactivo` días sin acceso o más (30 por defecto). Si hay fecha de
  último acceso, los días se **recalculan cada día**; si solo hay un número reportado, se usa ese.
- **Importar el reporte:** acepta filas pegadas desde Excel/Sheets (tabulaciones) o CSV (`;` o `,`); reconoce las
  columnas por su nombre sin importar tildes; **ignora filas sin correo válido**. Modo «reemplazar» (por
  defecto) sustituye todo; «agregar» actualiza por correo y conserva el resto.
- **Fechas aceptadas:** `AAAA-MM-DD`, `DD/MM/AAAA`, `D/M/AAAA`, `DD-MM-AAAA`; una fecha imposible (31/02) se
  rechaza.
- **Resumen diario:** no se envía si **no hay alertas**, ni si ya se envió hoy, ni si `correoAuto` está apagado.
  «Enviar ahora» lo fuerza. Se revisa cada 30 minutos.
- La primera vez, las líneas se **siembran** con los datos entregados por el área (11 líneas).

## Sesiones y contraseñas (resumen; el detalle está en [usuarios-y-permisos.md](usuarios-y-permisos.md))

- Sesión de **12 horas**; cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- **8 intentos fallidos por IP en 15 minutos** bloquean el inicio de sesión.
- Contraseña de **8 caracteres mínimo**.
- **Siempre debe quedar al menos un administrador** y nadie puede eliminarse a sí mismo.
