/* Proyecto Infraestructura — información oficial recibida del proyecto.
   Cuando lleguen documentos, equipo o cifras, se agregan aquí. */

export const PROYECTO = {
  entidad: 'Secretaría de Infraestructura',
  ciudad: 'Santiago de Cali',
  titulo: 'Recuperación de la infraestructura vial',
  objetivoGeneral:
    'Prestación de servicios de apoyo a la gestión técnica, logística y operativa de la Secretaría de Infraestructura para la provisión de talento humano y equipos en desarrollo del proyecto de Recuperación de la infraestructura vial del Distrito Especial Deportivo, Cultural, Turístico, Empresarial y de Servicios de Santiago de Cali.',
  objetivoEspecifico:
    'Proporcionar y mantener en óptimas condiciones el equipo humano y técnico especializado requerido para llevar a cabo de manera oportuna y eficiente las tareas de mantenimiento de vías en la ciudad.',
}

export const ACTIVIDADES = [
  {
    n: '1',
    titulo: 'Talento humano administrativo y operativo',
    texto:
      'Suministro del talento humano administrativo y operativo idóneo y especializado que conforme las cuadrillas y el equipo de respaldo para el mantenimiento de vías en la ciudad.',
    sub: [
      ['1.1', 'Suministro del talento humano administrativo y operativo idóneo y especializado que conforme las cuadrillas y el equipo de respaldo para el mantenimiento de vías en la ciudad.'],
      ['1.2', 'Suministro del recurso humano para la conformación de la cuadrilla de mantenimiento de la malla vial de la ciudad de Cali. Este equipo contará con la dotación y los elementos de protección personal adecuados para el desarrollo de su labor, al igual que equipo y herramientas.'],
    ],
  },
  {
    n: '2',
    titulo: 'Personal técnico, operativo y de apoyo',
    texto:
      'Suministro de personal técnico, operativo y de apoyo especializado, incluyendo de manera integral y conexa los componentes de seguridad y salud en el trabajo (SST), gestión social, transporte, equipos/herramientas menores y movimiento de equipos, ejecutados a través de bolsa única integrada a monto agotable de acuerdo con los requerimientos de la entidad.',
    sub: [
      ['2.1', 'Suministro de actividades conexas a monto agotable para el correcto funcionamiento de las intervenciones de la malla vial.'],
      ['2.2', 'Suministro de personal para el fortalecimiento del grupo operativo a través de bolsa con monto agotable, incluye dotación y elementos de protección personal para la ejecución de obras en la malla vial de Cali.'],
    ],
  },
]

/* Componentes conexos que integra la actividad 2. */
export const COMPONENTES = ['sst', 'social', 'transporte', 'herramientas', 'movimiento']

/* Cifras públicas de la Secretaría de Infraestructura de la Alcaldía de Cali (rendición de cuentas, 23 de mayo de 2026).
   Son resultados de la ciudad, no solo del proyecto: la página lo aclara y cita la fuente. */
export const CIFRAS_CALI = [
  { valor: '360+', unidad: 'kilómetros', texto: 'de vías recuperadas' },
  { valor: '760', unidad: 'tramos', texto: 'viales intervenidos' },
  { valor: '179', unidad: 'barrios', texto: 'impactados por las obras' },
  { valor: '22', unidad: 'comunas', texto: 'y 15 corregimientos con obras' },
  { valor: '30+', unidad: 'cuadrillas', texto: 'trabajando cada día, también de noche' },
]
export const FUENTE_CIFRAS = {
  texto: 'Secretaría de Infraestructura de Cali, rendición de cuentas (mayo de 2026)',
  url: 'https://www.cali.gov.co/boletines/publicaciones/192697/la-secretaria-de-infraestructura-rinde-cuentas-cali-supera-los-360-km-recuperados-y-fortalece-su-capacidad-operativa/',
}

/* Enlaces del proyecto (Google Drive). */
export const ENLACES = [
  {
    id: 'evidencias',
    titulo: 'Evidencias fotográficas de las intervenciones',
    texto: 'Carpeta con el registro fotográfico de las obras y de las cuadrillas en las vías.',
    url: 'https://drive.google.com/drive/u/0/folders/1BeZxA26-6qOIaJ1e7xdJhNFPWBCCFhGM',
  },
  {
    id: 'identidad',
    titulo: 'Mascota e identidad visual',
    texto: 'Carpeta con el castor, el logo y las piezas de la identidad visual del proyecto.',
    url: 'https://drive.google.com/drive/folders/1NhnHit6jPvmnCivrLSN7UzphhPe05Rja',
  },
]
