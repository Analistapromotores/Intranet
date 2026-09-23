/* Contenido de los correos: primero el mensaje que escribió el solicitante,
   luego un resumen automático para identificar la solicitud de un vistazo. */
import { TIPOS, formatoFecha, formatoPesos } from '../../shared/solicitudes.js'

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function resumen(sol) {
  const d = sol.datos
  const base = [['Solicitud No.', sol.numero], ['Tipo', TIPOS[sol.tipo].nombre], ['Fecha de registro', new Date(sol.creada).toLocaleString('es-CO', { timeZone: 'America/Bogota' })]]
  if (sol.tipo === 'informe_ingreso') {
    return [
      ...base,
      ['Persona seleccionada', d.nombre],
      ['Identificación', d.identificacion],
      ['Cargo', d.cargo],
      ['Centro de costo', d.centroCosto],
      ['Fecha probable de ingreso', formatoFecha(d.fechaIngreso)],
      ['Salario', formatoPesos(d.salario)],
      ['Auxilio de transporte', formatoPesos(d.auxilioTransporte)],
      ['Solicitante', `${d.solicitanteNombre} · ${d.solicitanteCargo}`],
      ['Responsable de contratación', `${d.responsableNombre} · ${d.responsableCargo}`],
    ]
  }
  if (sol.tipo === 'orden_servicio') {
    return [
      ...base,
      ['Cargo solicitado', d.cargo],
      ['Cantidad de vacantes', d.cantidad],
      ['Centro de costo', d.centroCosto],
      ['Ciudad o sede', d.ciudadSede],
      ['Salario', formatoPesos(d.salario)],
      ['Fecha de ingreso', formatoFecha(d.fechaIngreso)],
      ['Solicitante', `${d.solicitanteNombre} · ${d.solicitanteCargo} · ${d.correo}`],
    ]
  }
  return [
    ...base,
    ['Solicitante', `${d.nombre} · ${d.cargo}`],
    ['Documento', d.documento],
    ['Celular', d.celular],
    ['Área', d.area],
    ['Equipos', d.equipos.map((e) => `${e.cantidad} × ${e.tipo === 'Otro' ? e.otro : e.tipo}`).join(', ')],
    ['Fecha en que se requiere', formatoFecha(d.fechaRequerida)],
    ['Fecha de devolución', formatoFecha(d.fechaDevolucion)],
    ['Observación', d.observacion || '—'],
  ]
}

export function componerCorreo(sol, { modo }) {
  const tipo = TIPOS[sol.tipo]
  const filas = resumen(sol)
  const mensaje = sol.datos.mensajeCorreo || `Se registró una nueva solicitud de préstamo de equipos en la intranet.`
  const prefijo = modo === 'produccion' ? '' : '[PRUEBA] '
  const subject = `${prefijo}${tipo.asunto} · ${sol.numero}`

  const text = [
    mensaje,
    '',
    '— Datos de la solicitud —',
    ...filas.map(([k, v]) => `${k}: ${v}`),
    '',
    tipo.documento ? 'Se adjunta el formato generado automáticamente.' : '',
    'Mensaje generado por la Intranet de Gestión y Servicios.',
  ].join('\n')

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7fb;font-family:Segoe UI,Arial,sans-serif;color:#102a56">
  <table role="presentation" width="100%" style="max-width:640px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e3e9f2">
    <tr><td style="background:#073b82;padding:20px 26px;color:#fff">
      <div style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;opacity:.8">${esc(tipo.categoria)}</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px">${esc(tipo.asunto)}</div>
      <div style="font-size:13px;margin-top:4px;opacity:.85">Solicitud No. ${esc(sol.numero)}</div>
    </td></tr>
    ${modo === 'produccion' ? '' : '<tr><td style="background:#fff7e6;color:#8a5200;padding:10px 26px;font-size:13px">Correo de prueba: en producción lo recibirá gerencia.</td></tr>'}
    <tr><td style="padding:24px 26px;font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(mensaje)}</td></tr>
    <tr><td style="padding:0 26px 24px">
      <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">
        ${filas.map(([k, v]) => `<tr><td style="padding:8px 10px;border-top:1px solid #e3e9f2;color:#52627d;width:42%">${esc(k)}</td><td style="padding:8px 10px;border-top:1px solid #e3e9f2;font-weight:600">${esc(v)}</td></tr>`).join('')}
      </table>
      ${tipo.documento ? '<p style="font-size:13px;color:#52627d;margin:18px 0 0">Se adjunta el formato en Excel generado automáticamente.</p>' : ''}
    </td></tr>
    <tr><td style="background:#f4f7fb;padding:14px 26px;font-size:12px;color:#6b7a92">Mensaje generado por la Intranet de Gestión y Servicios.</td></tr>
  </table></body></html>`

  return { subject, text, html }
}
