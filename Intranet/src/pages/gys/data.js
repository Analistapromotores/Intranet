import logo from '../../assets/gys/gys logo.png'
import vertical from '../../assets/gys/GyS_Imagotipo_Vertical.png'
import team from '../../assets/gys/trbajadoras_gys.png'

export const LINKS = [
  { title: 'Formatos internos', text: 'Anticipos, permisos y solicitudes de compra.', href: '#gys-formatos', tone: 'red' },
  { title: 'Calidad', text: 'Política, objetivos, alcance y mejora continua.', href: '#gys-calidad', tone: 'blue' },
  { title: 'Seguridad y salud', text: 'Recursos para un trabajo seguro y saludable.', href: '#gys-sst', tone: 'gold' },
]
export const FORMATS = [
  ['Autorización de descuento', 'https://docs.google.com/document/d/1i7QKXfENgfAv2oiN6QSmVvXWLpZSMFLi/edit'],
  ['Solicitud de permiso de trabajo', 'https://docs.google.com/spreadsheets/d/1mR91Sswm1H9sDphcdhHLduQED0YANfOF/edit?gid=2039227312#gid=2039227312'],
  ['Solicitud y legalización de anticipo', 'https://docs.google.com/spreadsheets/d/10DsVx1b7dqfb-R61VfJNTgUZ5uhU5p33/edit?gid=765771037#gid=765771037'],
  ['Solicitud de anticipo', 'https://docs.google.com/spreadsheets/d/19aWJ2r-rtZM9lLwaV-i2j1R8Mkh_UhcP/edit?gid=645297917#gid=645297917'],
  ['Solicitud de pedido', 'https://docs.google.com/spreadsheets/d/1rmrvV5VMJQRi3pXddXVkocDlN-cDXbZR/edit?gid=215689962#gid=215689962'],
  ['Orden de compra', 'https://docs.google.com/spreadsheets/d/1KiQ7XCrjX9mZIFQsW1YBgFhu0Mfhp8Q0/edit?gid=464868680#gid=464868680'],
]
export const QUALITY = [
  ['Política de calidad', 'https://drive.google.com/file/d/1gOaA7Dmdnl71WIIUNmiKmG4QLJar6mVX/view'], ['Objetivos de calidad', 'https://drive.google.com/file/d/1k-vxrcrFjG5cvwZz_RnxXSCuU7gKSeHl/view'], ['Alcance del SGC', 'https://drive.google.com/file/d/1Hd7CxuaJ3OhTDiC2wbAXuCVcwgZyf4hn/view'], ['Diseño y ajuste de procesos', 'https://drive.google.com/file/d/18VuCU_IMDVLkstAsgnHQ8-D_nIIx_E4d/view'], ['Mejoramiento continuo', 'https://drive.google.com/file/d/11kwHyZMZOnfVP-rmlYY0ZjHtX8myCL-E/view'], ['Salidas no conformes', 'https://drive.google.com/file/d/1Eo1tEsPbT6KsreM_UJPKqXaItIDQJpym/view'],
]
export const SST = [['Política de SST','https://drive.google.com/file/d/1wmreu5w0SRZbHCyAXEBEZmKLYFZCqjwT/view'],['Objetivos SST','https://drive.google.com/file/d/178ziRP2usmXA4RvRX4enbnJ9Uv2CAcKh/view'],['COPASST','https://drive.google.com/file/d/1D-s8vdSOocHmmhi_zeScAfTsjT3mffU2/view'],['Brigada de emergencias','https://drive.google.com/file/d/1CkkeqiduBdeE4VLcxg4C6IHgksgssu-9/view']]
export const ASSETS = { logo, vertical, team }

/* ---------- Contenido institucional (sitio web de Gestión y Servicios) ---------- */
export const SERVICIOS = [
  { id: 'operador', titulo: 'Operador de procesos', texto: 'Colaboramos con nuestras empresas usuarias en el desarrollo de sus actividades, según sus requerimientos, a través de la prestación de servicios para proyectos o procesos específicos.' },
  { id: 'temporal', titulo: 'Servicio temporal', texto: 'Unimos a personas y empresas al generar empleos formales con trabajadores temporales altamente capacitados.' },
  { id: 'seleccion', titulo: 'Selección de talentos', texto: 'Somos especialistas en reclutamiento de talento humano de alto nivel, en diversas áreas, adaptado a las necesidades de cada empresa.' },
  { id: 'portal', titulo: 'Portal de empleos', texto: 'Contamos con una plataforma propia para reclutar los mejores talentos de la región con procesos virtuales específicos.' },
]

/* "Así operamos" */
export const CIFRAS = [
  { valor: 50, prefijo: '+', etiqueta: 'ciudades con cobertura' },
  { valor: 1200, prefijo: '+', etiqueta: 'empleados activos' },
  { valor: 40, prefijo: '+', etiqueta: 'empresas en gestión' },
]

/* Cómo funcionamos: el recorrido de un servicio de talento humano, con las áreas que intervienen. */
export const FLUJO = [
  { paso: 'La empresa usuaria solicita', area: 'Gerencia y proyectos', texto: 'Se define el cargo y el perfil con la Orden de Servicio.', href: '#solicitudes-personal-orden' },
  { paso: 'Buscamos el talento', area: 'Selección', texto: 'Reclutamiento, pruebas y entrevistas para encontrar a la persona indicada.', href: '#extensiones' },
  { paso: 'Formalizamos el ingreso', area: 'Contratación', texto: 'Con el Informe de Ingreso se inicia la contratación.', href: '#solicitudes-personal-ingreso' },
  { paso: 'Acompañamos la operación', area: 'Nómina y SST', texto: 'Pagos, afiliaciones, seguridad y salud en el trabajo.', href: '#gys-sst' },
  { paso: 'Mejoramos continuamente', area: 'Calidad', texto: 'Seguimiento y mejora de cada proceso del sistema de gestión.', href: '#gys-calidad' },
]

export const VIDEOS = [
  { id: 'hayC4As4WGU', titulo: 'Gestión y Servicios: más humano, más calidad', tema: 'Quiénes somos' },
  { id: '5J6aEjeMEic', titulo: 'Outsourcing de recursos humanos', tema: 'Servicios' },
  { id: 'X98qsvOAa_k', titulo: 'Inducción en seguridad y salud en el trabajo', tema: 'SST' },
  { id: '0u8sEU-Uixg', titulo: 'Cómo firmar un documento PDF', tema: 'Tecnología' },
]
export const CANAL_YOUTUBE = 'https://www.youtube.com/channel/UCEbbLOy-HFe6OmWVAIAhGMg'

export const CONTACTO = {
  direccion: 'Calle 13 # 64-30, El Gran Limonar',
  ciudad: 'Santiago de Cali, Valle del Cauca, Colombia',
  pbx: '(602) 661 40 40',
  pbxHref: 'tel:+576026614040',
  incapacidades: 'incapacidadesgys@gestionyservicios.com.co',
}

/* ---------- Alianzas: cómo interviene G&S en cada proyecto ---------- */
export const APORTES = {
  personal: 'Personal',
  herramientas: 'Alquiler de herramientas',
  transporte: 'Transporte',
  espacio: 'Espacio físico',
  equipos: 'Equipos',
}

/* `proyecto` coincide con el id de src/data/projects.js (logo y enlace). */
export const ALIANZAS = [
  { proyecto: 'promotores', nombre: 'Promotores Mi Cali Bella', aportes: ['personal', 'herramientas', 'transporte'], texto: 'Suministramos todo el personal del proyecto, alquilamos las herramientas y ponemos el transporte para la operación en las comunas de Cali.' },
  { proyecto: 'infraestructura', nombre: 'Infraestructura', aportes: ['personal'], texto: 'Suministramos el personal administrativo, técnico y operativo para el mantenimiento de la malla vial de Cali.' },
  { proyecto: 'corpoquindio', nombre: 'Quindío Emprendedor', aportes: ['personal'], texto: 'Suministramos el personal que acompaña el fortalecimiento de las unidades productivas del Quindío.' },
  { proyecto: 'mediadores', nombre: 'Mediadores de Convivencia', aportes: ['personal'], texto: 'Suministramos el personal del programa (antes Gestores de Convivencia) en los municipios del Valle del Cauca.' },
  { proyecto: 'pasaportes', nombre: 'UT Gestión Pasaportes', aportes: ['personal', 'espacio', 'equipos'], texto: 'Aportamos el personal, el espacio físico y los equipos para la operación de las oficinas de pasaportes.' },
]
