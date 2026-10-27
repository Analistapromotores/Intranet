/* Contenido del manual de usuario de Solicitudes. Un solo lugar: si cambia un formulario o un correo, se edita aquí. */

/* Correo al que se envía el formato de ausentismo (FT-OP-76) con sus anexos. */
export const CORREO_AUSENTISMO = 'incapacidadesgys@gestionyservicios.com.co'

export const ANTES_DE_EMPEZAR = [
  ['No necesitas usuario ni contraseña', 'Todas las solicitudes se hacen desde la intranet, sin iniciar sesión.'],
  ['Ten a la mano tus datos', 'Nombre, cargo, documento y correo corporativo. Con ellos podrás consultar tus solicitudes después.'],
  ['Guarda el número de solicitud', 'Al enviar recibes un número (por ejemplo PE-2026-0001). Con él o con tu cédula o correo consultas el estado.'],
  ['Revisa antes de enviar', 'Cada formulario tiene un paso final de confirmación. Una vez enviada, la solicitud no se edita desde la intranet.'],
]

export const SECCIONES = [
  {
    id: 'personal',
    numero: '1',
    titulo: 'Búsqueda de personal',
    ruta: 'Solicitudes › Búsqueda de personal',
    intro: 'Son dos formatos que se usan en orden: primero pides el cargo con la Orden de Servicio y, cuando ya elegiste a la persona, envías el Informe de Ingreso.',
    subsecciones: [
      {
        numero: '1.1',
        titulo: 'Petición de Orden de Servicio (FT-OP-03)',
        cuando: 'Cuando necesitas cubrir un cargo.',
        href: '#solicitudes-personal-orden',
        pasos: [
          ['Solicitud', 'Fecha de ingreso, tu correo, centro de costo y la justificación de la vacante (mínimo 20 caracteres).'],
          ['Perfil del cargo', 'Cargo, ciudad o sede, número de vacantes, salario, tipo de contratación, horario, formación, experiencia y habilidades.'],
          ['Competencias y funciones', 'Al menos 4 competencias y 4 responsabilidades (hasta 5), y los documentos que debe presentar quien ingrese.'],
          ['Evaluación', 'Marca los servicios complementarios que requieres y reparte los porcentajes de evaluación: deben sumar 100 %.'],
          ['Observaciones y firma', 'Tu nombre y cargo, observaciones si las hay, y tu firma dibujada en el recuadro con el mouse o el dedo.'],
          ['Mensaje del correo', 'Escribe el mensaje que recibirá gerencia (mínimo 10 caracteres).'],
          ['Confirmación', 'Revisa el resumen y pulsa Enviar solicitud.'],
        ],
        resultado: 'Se genera el formato oficial en Excel y la solicitud llega a gerencia. Recibes el número OS-AAAA-0001.',
      },
      {
        numero: '1.2',
        titulo: 'Informe de Ingreso (FT-OP-10)',
        cuando: 'Cuando ya elegiste a la persona que ingresa.',
        href: '#solicitudes-personal-ingreso',
        pasos: [
          ['Persona seleccionada', 'Nombre, identificación, cargo, centro de costo, teléfono, correo, dirección, barrio y fecha probable de ingreso.'],
          ['Salario y beneficios', 'Salario y auxilio de transporte, y hasta 3 beneficios con su valor y periodicidad.'],
          ['Autorización y responsable', 'Tus datos y tu correo, tu firma en el recuadro y el responsable de la contratación.'],
          ['Mensaje del correo', 'El mensaje que recibirá gerencia.'],
          ['Confirmación', 'Revisa el resumen y envía.'],
        ],
        resultado: 'Se genera el formato en Excel y la solicitud llega a gerencia. Recibes el número II-AAAA-0001.',
      },
    ],
  },
  {
    id: 'prestamo',
    numero: '2',
    titulo: 'Préstamo de equipos',
    ruta: 'Solicitudes › Préstamo de equipos',
    intro: 'Para pedir portátiles, video beam, sonido, pendones y otros elementos para tus actividades. El préstamo depende de la disponibilidad.',
    href: '#solicitudes-prestamo',
    pasos: [
      ['Tus datos', 'Nombre, cargo, documento, celular, correo y área.'],
      ['Equipos y fechas', 'Agrega hasta 10 elementos con su cantidad (si no está en la lista, elige «Otro» y escríbelo), la fecha en que lo necesitas y la de devolución. La devolución no puede ser anterior a la fecha de uso.'],
      ['Confirmación', 'Revisa el resumen y envía.'],
    ],
    resultado: 'Tu solicitud llega al área responsable, que registra cada equipo al entregarlo y al recibirlo. Recibes el número PE-AAAA-0001.',
  },
  {
    id: 'salas',
    numero: '3',
    titulo: 'Reserva de salas',
    ruta: 'Solicitudes › Reserva de salas',
    intro: 'El calendario muestra la disponibilidad en tiempo real para todo el equipo. Puedes verlo por día, semana o mes.',
    href: '#solicitudes-salas',
    pasos: [
      ['Mira la disponibilidad', 'Las reservas existentes aparecen como bloques de color. No puedes reservar fechas pasadas.'],
      ['Elige el espacio', 'Pulsa un horario libre en la vista de semana, o el signo + de un día en la vista de mes.'],
      ['Completa los datos', 'Tu correo, tu nombre, la sala, la fecha, la hora de inicio y fin, y para qué es la reunión (máximo 160 caracteres).'],
      ['Guarda la reserva', 'Las salas se reservan entre las 7:00 a. m. y las 7:00 p. m. Si el horario se cruza con otra reserva, el sistema te avisa y debes elegir otro.'],
    ],
    resultado: 'La reserva se ve al instante en el calendario. Para cancelarla, ábrela y pulsa Cancelar: solo puedes hacerlo desde el mismo navegador en que la creaste.',
    notas: ['Las reuniones generales de la empresa las publica un administrador y aparecen en el mismo calendario.'],
  },
  {
    id: 'ausentismo',
    numero: '4',
    titulo: 'Ausentismo laboral (permisos)',
    ruta: 'Solicitudes › Ausentismo laboral',
    intro: 'Para pedir un permiso o reportar una ausencia. Aquí solo diligencias el formato FT-OP-76: el trámite termina cuando lo envías por correo con tus anexos. La intranet no lo registra ni lo envía por ti, y por eso no genera número de solicitud.',
    href: '#solicitudes-ausentismo',
    pasos: [
      ['Diligencia el formato', 'Entra a Ausentismo laboral y completa: fecha de solicitud, empresa usuaria, motivo (cita médica, diligencia personal, calamidad doméstica, empresarial o licencia), descripción, si tiene soporte, fechas y horas de inicio y fin, los colaboradores (hasta 5 por formato) y el nombre del jefe inmediato.'],
      ['Revisa la vista previa', 'Pulsa Vista previa para ver el formato tal como saldrá.'],
      ['Descárgalo', 'Pulsa Descargar Excel, o Imprimir o guardar PDF si prefieres el formato en PDF.'],
      ['Fírmalo', 'Imprime el formato y fírmalo a mano: cada colaborador y el jefe inmediato. El espacio de Talento Humano se deja en blanco. Luego escanéalo o tómale una foto legible.'],
      ['Reúne los anexos', 'Los soportes que respaldan el motivo (por ejemplo, el certificado de la cita médica, la citación o la constancia de la diligencia). Que estén completos y se lean bien.'],
      ['Envía el correo', 'Escribe a incapacidadesgys@gestionyservicios.com.co con el formato firmado y los anexos adjuntos. Sugerencia de asunto: «Ausentismo – tu nombre – fecha de inicio».'],
    ],
    resultado: 'Talento Humano revisa tu correo y los anexos. Pide el permiso con anticipación siempre que sea posible.',
    notas: [
      'Si tienes una incapacidad médica o una licencia, consulta los documentos que necesitas en Solicitudes › Incapacidades.',
      'La información que escribes en el formato no se guarda en el servidor; si recargas la página, tu borrador se conserva solo en este navegador.',
    ],
    correo: true,
  },
  {
    id: 'consulta',
    numero: '5',
    titulo: 'Consultar mis solicitudes',
    ruta: 'Solicitudes › Mis solicitudes',
    intro: 'Sirve para las solicitudes de personal y de préstamo de equipos (las reservas se ven en el calendario y el ausentismo se sigue por correo).',
    href: '#solicitudes-consulta',
    pasos: [
      ['Escribe tu dato', 'Tu número de cédula o el correo con el que registraste la solicitud. Con cualquiera de los dos aparecen todas tus solicitudes.'],
      ['Mira el estado', 'Cada solicitud muestra su estado y el historial de cambios con fecha.'],
    ],
    estados: [
      ['Enviada', 'La recibimos y está en la fila de atención.'],
      ['En proceso', 'El equipo responsable ya la está gestionando.'],
      ['Pendiente', 'Falta información o una autorización para continuar.'],
      ['Aprobada', 'La solicitud fue aceptada.'],
      ['Rechazada', 'No se pudo aprobar; el historial explica el motivo.'],
      ['Cerrada', 'El trámite terminó.'],
    ],
  },
]

export const PREGUNTAS = [
  ['¿Necesito crear una cuenta?', 'No. Las solicitudes, las reservas y el formato de ausentismo se usan sin usuario. Solo el personal de gestión inicia sesión.'],
  ['Me equivoqué en una solicitud ya enviada, ¿qué hago?', 'Las solicitudes no se editan desde la intranet. Escribe al área responsable indicando tu número de solicitud y qué hay que corregir, o envía una nueva.'],
  ['¿Cómo cancelo una reserva de sala?', 'Ábrela en el calendario y pulsa Cancelar. Solo funciona desde el navegador en que la hiciste; si no es posible, pide a gestión que la cancele.'],
  ['¿El ausentismo queda registrado en la intranet?', 'No. Solo diligencias y descargas el formato; el trámite es el correo con los anexos a incapacidadesgys@gestionyservicios.com.co.'],
  ['¿Qué hago si la intranet no me deja enviar?', 'Revisa los campos marcados en rojo: el formulario te indica qué falta. Si el problema continúa, repórtalo a Tecnología por el GLPI (Solicitudes › Soporte IT).'],
]
