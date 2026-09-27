# Reglas de negocio

Reglas que **no se ven a simple vista** al leer un formulario o una ruta. Cada una indica dónde vive en el código
y por qué existe.

Convención: **[srv]** la aplica el servidor (no se puede saltar desde el navegador), **[web]** solo el navegador,
**[ambos]** el mismo código de `shared/` corre en los dos lados.

## Zona horaria y fechas

| Regla | Dónde |
| --- | --- |
| «Hoy» es siempre la fecha de **Colombia (`America/Bogota`)**, sin importar la zona horaria del servidor (Railway corre en UTC). Así los cumpleaños, las reservas y el estado de las reuniones cambian de día a la medianoche colombiana | `hoyBogota()` en `server/index.js`, `server/salas/routes.js`, `server/ti/routes.js` |
| Las fechas se guardan como `AAAA-MM-DD` y las marcas de tiempo en ISO UTC | todo el servidor |
| El resumen diario de TI sale a las **8:00 a. m. hora Colombia** o después, una vez al día | `programarResumenDiario()` |

## Cumpleaños y felicitaciones

- **Ventana de felicitación [srv]:** se puede felicitar desde el día anterior hasta el día siguiente al cumpleaños
  (3 días). Se comparan las fechas en tres años (`y-1, y, y+1`) para que funcione en el cambio de año.
- **Solo personas publicadas [srv]:** la portada y la API pública ignoran a quien tenga `published: false`.
- **El año de nacimiento es opcional** y nunca se muestra en la vista pública.
- **Felicitar sin cuenta:** quien felicita recibe una `key`; con ella puede agregar o cambiar su mensaje después.
- **Contador por año [srv]:** las felicitaciones se cuentan por `(persona, año)`; el muro muestra las del año actual
  y hasta 40 mensajes.
- **Límite [srv]:** 40 felicitaciones por IP cada 10 minutos (una oficina completa comparte IP pública).
- **Carga masiva [srv]:** hasta 2000 filas; una fila es duplicada si coinciden `nombre + mes + día`; los duplicados
  se omiten.
- **Foto:** WebP, JPEG o PNG, máximo **2,5 MB**; el navegador la redimensiona antes de enviarla.
- Al **eliminar una persona** se eliminan también su foto y sus felicitaciones.

## Noticias y comunicados

- **Solo lo publicado es público [srv]:** un borrador solo se abre con sesión; sin ella responde 404.
- **Orden [srv]:** primero los destacados, luego por fecha de publicación descendente.
- **`publicadoEn` es la primera vez que se hizo visible:** despublicar y volver a publicar no cambia la fecha.
- **Contenido por bloques:** `titulo`, `texto`, `imagen`, `enlace`, `cita`, `video` y `separador`, máximo **60**.
  Los bloques vacíos se descartan al guardar y los tipos desconocidos se ignoran.
- **Enlaces seguros [srv]:** solo `http`, `https` y `mailto`; un `javascript:` o `data:` se descarta. Si escriben
  `ejemplo.com`, se completa con `https://`.
- **Imágenes [srv]:** máximo **8 MB** cada una y se verifica la firma real del archivo (PNG, JPEG o WebP), no solo lo
  que declara el navegador. No se recortan: las tarjetas usan fondo difuminado para no deformarlas.
- **Limpieza:** al editar o eliminar, las imágenes que dejan de usarse se eliminan.
- **Título:** mínimo 4 letras; el resumen se recorta a 280 caracteres.

### Redes sociales

- El gestor pega el enlace del **perfil** y el de la **última publicación**; no se usan claves de las redes.
- **Se valida el dominio [srv]:** un enlace de Instagram debe ser de `instagram.com`; el de Facebook de
  `facebook.com`/`fb.watch`/`fb.com`, y así con LinkedIn y YouTube.
- **Se quitan rastreadores** (`utm_*`, `igsh`, `fbclid`, `mibextid`…) antes de guardar.
- Los enlaces «compartir» de Facebook (`facebook.com/share/…`) se resuelven siguiendo la redirección (8 s de espera)
  y se guarda el enlace real.

## Solicitudes

| Regla | Detalle |
| --- | --- |
| **Numeración** | `<prefijo>-<año>-<0001>`; consecutivo por serie y año, asignado dentro de la transacción |
| **Estados** | `borrador`, `enviada`, `en_proceso`, `pendiente`, `aprobada`, `rechazada`, `cerrada`. Toda solicitud nace `enviada` |
| **Historial** | Cada cambio agrega una entrada `{estado, fecha, comentario, por}`; nunca se sobrescribe |
| **Se registra primero, se envía después** | La solicitud se guarda **antes** de generar el Excel y el correo. Si eso falla, responde 201 con un aviso y queda registrada; Gestión la reenvía |
| **Consulta pública** | Por **cédula o correo** (cualquiera de los dos, sin importar mayúsculas, puntos o guiones). Devuelve todas las solicitudes de esa persona sin salarios, documentos ni firma. Hasta 50 resultados |
| **Cédula en cada tipo** | Informe de Ingreso: `identificacion`; Préstamo de equipos: `documento`. La Orden de Servicio se encuentra por correo |
| **Correo del solicitante** | Informe de Ingreso: `solicitanteCorreo`; las demás: `correo` |
| **Límites [srv]** | 20 solicitudes por IP por hora; 60 consultas por IP cada 10 minutos |
| **Excel** | Informe de Ingreso y Orden de Servicio generan un `.xlsx` desde una plantilla de `server/templates`; Préstamo de equipos no genera archivo |
| **Destinatario** | Informe de Ingreso y Orden → `EMAIL_PRODUCCION`; Préstamo → `EMAIL_PRESTAMOS`. El `Reply-To` es el correo del solicitante |
| **Modo pruebas** | Mientras `MAIL_MODE` ≠ `produccion`, todo va a `EMAIL_PRUEBAS` con asunto `[PRUEBA]` y un aviso en el cuerpo |

### Validaciones que sorprenden [ambos]

- **Informe de Ingreso:** la fecha de ingreso no puede ser anterior a la de solicitud; máximo **3 beneficios** (es el
  espacio del formato); si la periodicidad es «Otro», hay que especificarla; salario y auxilio de transporte
  obligatorios.
- **Orden de Servicio:** los **porcentajes de evaluación deben sumar exactamente 100 %**; 4 competencias obligatorias;
  mínimo 4 responsabilidades (hay 5 espacios); hasta 3 documentos; justificación de 20 a 600 caracteres; salario > 0.
- **Préstamo de equipos:** entre 1 y **10** elementos; la devolución no puede ser anterior a la fecha requerida.
- **Fechas pasadas = advertencia, no error:** una fecha requerida o de ingreso que ya pasó avisa pero no bloquea,
  porque puede ser un registro tardío legítimo.
- **Nombre completo:** mínimo 5 caracteres (nombre y apellido).
- **Doble envío:** el botón se deshabilita y una guarda evita registrar la solicitud dos veces con un doble clic.

## Reserva de salas y calendario corporativo

- **Horario de las reservas:** entre **7:00 y 19:00**; el fin debe ser posterior al inicio.
- **Choques [srv]:** dos reservas de la misma sala y fecha se cruzan si `inicio₁ < fin₂ y inicio₂ < fin₁`; terminar a las
  10:00 y empezar a las 10:00 no choca. La verificación y el guardado son una sola operación atómica: dos personas no
  pueden reservar el mismo hueco a la vez (la segunda recibe 409).
- **No se reserva en el pasado** (`fecha ≥ hoy`).
- **Sin cuentas:** quien reserva se identifica con **correo + nombre** y recibe una `key` para cancelar. Cancelan la
  reserva quien tenga la `key` o cualquier usuario con sesión.
- **Calendario público:** la portada muestra las reservas y reuniones de cada mes. Cada una se abre para ver estado,
  tipo, lugar, fecha, horario, quién y motivo. Sin sesión, el correo de quien reservó se muestra parcialmente
  (`a***@dominio`).
- **Estado [srv]:** `programada`, `en_curso` o `finalizada`, calculado con la hora de Colombia.
- **Reuniones (eventos) [srv]:** solo un **administrador** puede crearlas y cancelarlas. No tienen el horario
  restringido de las reservas; pueden ir en una sala (bloquea el horario como cualquier reserva) o en «otro lugar».
- **Límites [srv]:** 60 reservas por IP por hora; 40 cancelaciones por IP cada 10 minutos.
- Las salas son un catálogo en código (`shared/salas.js`); hoy existe la **Sala piso 2**.

## Ausentismo laboral (FT-OP-76)

- **No se guarda nada:** el servidor rellena la plantilla `ausentismo.xlsx` y la devuelve para descargar.
- El formato trae **dos copias en la misma hoja** (desplazadas 33 filas): se rellenan ambas.
- Máximo **5 colaboradores** por formato; identificación de 5 a 15 caracteres alfanuméricos.
- Si no hay hora, se asume el día completo (`00:00` a `23:59`) para validar que el fin no sea anterior al inicio.
- Las firmas del colaborador y de Talento Humano quedan en blanco: se firman a mano al imprimir.
- Límite: 120 por IP por hora.

## Panel de TI

- **Estado de una línea móvil:** `vencida` si `vence < hoy`; `por_vencer` si faltan `diasAviso` días o menos (5 por
  defecto); `sin_fecha` si no tiene vencimiento; si no, `ok`.
- **Recargar** fija `recarga = hoy` (o la fecha indicada) y `vence = recarga + diasRecarga` (30 por defecto).
- **Correo inactivo:** alerta cuando lleva `diasInactivo` días sin acceso o más (30 por defecto). Con fecha de último
  acceso, los días se recalculan cada día; si solo hay un número reportado, se usa ese.
- **Importar el reporte:** acepta filas pegadas desde Excel o Sheets (tabulaciones) o CSV (`;` o `,`); reconoce las
  columnas por su nombre sin importar las tildes; ignora filas sin correo válido. Modo «reemplazar» (por defecto)
  sustituye todo; «agregar» actualiza por correo y conserva el resto.
- **Fechas aceptadas:** `AAAA-MM-DD`, `DD/MM/AAAA`, `D/M/AAAA`, `DD-MM-AAAA`; una fecha imposible (31/02) se rechaza.
- **Resumen diario:** no se envía si no hay alertas, si ya se envió hoy o si `correoAuto` está apagado. «Enviar
  ahora» lo fuerza. Se revisa cada 30 minutos.

## Seguridad y límites de uso

| Regla | Detalle |
| --- | --- |
| **IP real** | Detrás del proxy de Railway, `X-Forwarded-For` llega como «cliente, proxy de borde»; el servidor confía en 2 saltos, de modo que `req.ip` es la IP del cliente y no se puede falsificar. Todos los límites por IP dependen de esto |
| **Inicio de sesión** | 8 intentos fallidos por **usuario y IP** y 40 por IP, en 15 minutos → 429. Un error de una persona no bloquea a toda la oficina. Usuario inexistente y contraseña errónea dan el mismo mensaje y gastan el mismo tiempo |
| **Tope general** | 2400 lecturas y 300 escrituras por IP por minuto: solo frena automatismos |
| **Tamaño del cuerpo** | 1 MB por defecto; 25 MB en noticias, personas e importación (llevan imágenes); 5 MB en TI; 2 MB en solicitudes y documentos |
| **Origen** | En producción, una petición que modifica datos y trae `Origin` debe venir del mismo sitio (protección adicional contra CSRF; la cookie ya es `SameSite=Lax`) |
| **Archivos subidos** | Solo imágenes PNG, JPEG y WebP, verificadas por su firma; nombre nuevo (UUID); se sirven con `nosniff` |
| **Errores** | Nunca se envía traza ni ruta interna: el detalle se registra en el servidor y el usuario ve un mensaje claro |

## Sesiones y contraseñas

- Sesión de **12 horas**; cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- Contraseña de **8 caracteres mínimo**, guardada con `scrypt` y sal propia.
- **Siempre debe quedar al menos un administrador** y nadie puede eliminarse a sí mismo.
- Los usuarios iniciales se crean solo si no existen (`GESTOR_*`, `TI_*`, `ADMIN_*`).
