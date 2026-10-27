/* Incapacidades, licencias y ausentismo: correo de destino, tipos de caso y reglas de los anexos.
   Lo usan el navegador (formularios) y el servidor (validación y correo). */

/* Buzón de Talento Humano que recibe incapacidades, licencias y ausentismo. */
export const CORREO_INCAPACIDADES = 'incapacidadesgys@gestionyservicios.com.co'

export const CASOS_INCAPACIDAD = [
  { id: 'general', titulo: 'Incapacidad general', docs: ['Certificado de incapacidad.', 'Historia clínica o soporte de la atención médica.'] },
  { id: 'laboral', titulo: 'Accidente laboral', docs: ['Certificado de incapacidad.', 'Historia clínica o soporte de la atención médica.'] },
  {
    id: 'transito',
    titulo: 'Accidente de tránsito',
    docs: ['Certificado de incapacidad.', 'Historia clínica.', 'FURIPS.'],
    nota: 'Si el FURIPS no fue expedido, debes presentar una declaración juramentada ante notaría explicando el motivo.',
  },
  { id: 'maternidad', titulo: 'Licencia de maternidad', docs: ['Certificado de licencia.', 'Historia clínica.', 'Registro civil de nacimiento.', 'Certificado de nacido vivo.'] },
  { id: 'paternidad', titulo: 'Licencia de paternidad', docs: ['Certificado de licencia.', 'Historia clínica o soporte correspondiente.', 'Registro civil de nacimiento.', 'Certificado de nacido vivo.'] },
]

/* Asunto y mensaje que se proponen al elegir el tipo (la persona puede cambiarlos). */
export function plantillaIncapacidad(casoId, { nombre = '', identificacion = '' } = {}) {
  const caso = CASOS_INCAPACIDAD.find((c) => c.id === casoId)
  if (!caso) return { asunto: '', cuerpo: '' }
  const quien = nombre.trim() || '[tu nombre]'
  const cc = identificacion.trim() || '[tu cédula]'
  return {
    asunto: `${caso.titulo} – ${quien} – C.C. ${cc}`,
    cuerpo: [
      'Buen día,',
      '',
      `Envío la documentación de mi ${caso.titulo.toLowerCase()} para el trámite correspondiente.`,
      '',
      `Nombre: ${quien}`,
      `Cédula: ${cc}`,
      '',
      'Documentos que adjunto:',
      ...caso.docs.map((d) => `- ${d.replace(/\.$/, '')}`),
      '',
      'Quedo atento(a) a cualquier novedad. Gracias.',
    ].join('\n'),
  }
}

/* Anexos: archivos que se envían en el correo (y se guardan con la solicitud). */
export const MAX_ANEXOS = 5
export const MAX_ANEXO_BYTES = 5 * 1024 * 1024
export const MAX_ANEXOS_TOTAL = 15 * 1024 * 1024
export const MAX_ENLACES = 5
export const EXTENSIONES_ANEXO = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'xls', 'xlsx']
export const MIME_POR_EXTENSION = {
  pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}
export const extensionDe = (nombre) => String(nombre || '').toLowerCase().split('.').pop()
/* Tamaño real de un archivo recibido en base64. */
export const bytesDeBase64 = (b64) => Math.floor((String(b64 || '').length * 3) / 4)
export const formatoTamano = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)
export const ENLACE = /^https?:\/\/[^\s]{4,300}$/i

/* Valida `anexos` (archivos) y `enlaces` de una solicitud. Escribe los errores en `e`. */
export function validarAnexos(d, e) {
  const anexos = Array.isArray(d.anexos) ? d.anexos : []
  if (anexos.length > MAX_ANEXOS) e.anexos = `Máximo ${MAX_ANEXOS} archivos por envío.`
  let total = 0
  for (const a of anexos) {
    const nombre = String(a?.nombre || '')
    const bytes = a && typeof a.datos === 'string' ? bytesDeBase64(a.datos) : Number(a?.tamano) || 0
    total += bytes
    if (!nombre || !EXTENSIONES_ANEXO.includes(extensionDe(nombre))) { e.anexos = `«${nombre || 'archivo'}»: usa PDF, imagen (JPG, PNG, WebP), Word o Excel.`; break }
    if (bytes > MAX_ANEXO_BYTES) { e.anexos = `«${nombre}» supera ${formatoTamano(MAX_ANEXO_BYTES)}.`; break }
    if (bytes < 1) { e.anexos = `«${nombre}» está vacío.`; break }
  }
  if (!e.anexos && total > MAX_ANEXOS_TOTAL) e.anexos = `Los archivos suman más de ${formatoTamano(MAX_ANEXOS_TOTAL)}.`
  const enlaces = Array.isArray(d.enlaces) ? d.enlaces : []
  if (enlaces.length > MAX_ENLACES) e.enlaces = `Máximo ${MAX_ENLACES} enlaces.`
  else if (enlaces.some((u) => typeof u !== 'string' || !ENLACE.test(u.trim()))) e.enlaces = 'Cada enlace debe empezar por http:// o https://.'
}
