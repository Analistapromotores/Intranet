/* Proyecto Infraestructura — información oficial recibida del proyecto.
   Cuando lleguen documentos, equipo o cifras, se agregan aquí. */

export const PROYECTO = {
  codigo: 'BP-26005375',
  entidad: 'Secretaría de Infraestructura',
  ciudad: 'Santiago de Cali',
  titulo: 'Recuperación de la infraestructura vial',
  objetivoGeneral:
    'Prestación de servicios de apoyo a la gestión técnica, logística y operativa de la Secretaría de Infraestructura para la provisión de talento humano y equipos en desarrollo del proyecto BP-26005375 Recuperación de la infraestructura vial del Distrito Especial Deportivo, Cultural, Turístico, Empresarial y de Servicios de Santiago de Cali.',
  objetivoEspecifico:
    'Proporcionar y mantener en óptimas condiciones el equipo humano y técnico especializado requerido para llevar a cabo de manera oportuna y eficiente las tareas de mantenimiento de vías en la ciudad.',
}

export const ACTIVIDADES = [
  {
    n: '1',
    titulo: 'Talento humano para las cuadrillas',
    texto:
      'Suministro del talento humano administrativo y operativo idóneo y especializado que conforme las cuadrillas y el equipo de respaldo para el mantenimiento de vías en la ciudad.',
    sub: [
      ['1.1', 'Suministro del talento humano administrativo y operativo idóneo y especializado que conforme las cuadrillas y el equipo de respaldo para el mantenimiento de vías en la ciudad.'],
      ['1.2', 'Suministro del recurso humano para la conformación de la cuadrilla de mantenimiento de la malla vial de la ciudad de Cali. Este equipo contará con la dotación y los elementos de protección personal adecuados para el desarrollo de su labor, al igual que equipo y herramientas.'],
    ],
  },
  {
    n: '2',
    titulo: 'Personal técnico y actividades conexas',
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
