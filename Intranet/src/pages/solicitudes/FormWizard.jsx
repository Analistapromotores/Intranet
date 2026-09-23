import { useEffect, useRef, useState } from 'react'
import { TIPOS } from '../../../shared/solicitudes.js'
import { api } from './api.js'
import { erroresDe, recordarSolicitud } from './form.js'
import { ErrorSummary, Modal, StatusBadge, Stepper } from './ui.jsx'
import { MARCA } from './brand.js'
import { IconArrowLeft, IconArrowRight, IconCheckCircle, IconClock, IconInfo, IconList, IconMail, IconSend } from './icons.jsx'

/* Asistente por pasos común a todas las solicitudes:
   pasos → revisión → confirmación → envío → pantalla de éxito con número y estado. */
export default function FormWizard({ form, steps, labels, review, correoSolicitante, volverHref, aside }) {
  const [paso, setPaso] = useState(0)
  const [hechos, setHechos] = useState(() => new Set())
  const [resumen, setResumen] = useState([])
  const [confirmar, setConfirmar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [resultado, setResultado] = useState(null)
  const [destino, setDestino] = useState(null)
  const topRef = useRef(null)
  const tipo = TIPOS[form.tipo]
  const todos = [...steps, { id: 'revision', title: 'Confirmación', campos: [] }]
  const ultimo = paso === todos.length - 1

  useEffect(() => {
    api.config().then((c) => setDestino({ correo: c.destino[form.tipo], modo: c.modoCorreo, smtp: c.smtp })).catch(() => {})
  }, [form.tipo])

  const irA = (i) => {
    setPaso(i)
    setResumen([])
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function siguiente() {
    const campos = todos[paso].campos
    const errs = erroresDe(form.errores, campos)
    form.tocarVarios(errs.map(([k]) => k))
    if (errs.length) return setResumen(errs)
    setHechos((h) => new Set(h).add(paso))
    irA(paso + 1)
  }

  async function enviar() {
    setEnviando(true)
    setErrorEnvio('')
    try {
      const r = await api.enviar(form.tipo, form.datos)
      recordarSolicitud(r.numero, correoSolicitante(form.datos))
      form.limpiarBorrador()
      setConfirmar(false)
      setResultado(r)
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    } catch (e) {
      setErrorEnvio(e.message)
      if (Object.keys(e.fields).length) {
        form.tocarVarios(Object.keys(e.fields))
        const i = todos.findIndex((s) => erroresDe(e.fields, s.campos).length)
        setConfirmar(false)
        if (i >= 0) {
          irA(i)
          setResumen(erroresDe(e.fields, todos[i].campos))
        }
      }
    } finally {
      setEnviando(false)
    }
  }

  if (resultado) return <Exito resultado={resultado} />

  return (
    <div className="sv-wizard" ref={topRef}>
      <div className="sv-wizard__top">
        <Stepper steps={todos} current={paso} completed={hechos} onJump={irA} />
        <p className="sv-draft" aria-live="polite">
          <StatusBadge estado="borrador" />
          {form.guardado ? <>Guardado automáticamente a las {new Date(form.guardado).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</> : 'Tus avances se guardan en este navegador'}
          <button type="button" className="sv-link" onClick={() => { if (window.confirm('¿Descartar el borrador y empezar de nuevo?')) { form.descartar(); setHechos(new Set()); irA(0) } }}>Descartar</button>
        </p>
      </div>

      <div className="sv-wizard__layout">
        <div className="sv-wizard__card">
          <p className="sv-wizard__progress">Paso {paso + 1} de {todos.length}</p>
          <h2 className="sv-wizard__title">{todos[paso].title}</h2>

          <ErrorSummary items={resumen} labels={labels} />

          <form onSubmit={(e) => { e.preventDefault(); if (ultimo) setConfirmar(true); else siguiente() }} noValidate>
            <div className="sv-wizard__body" key={paso}>
              {ultimo ? (
                <>
                  {review(irA)}
                  <div className="sv-callout sv-callout--info">
                    <IconMail width={20} height={20} />
                    <div>
                      <b>¿Qué pasa al enviar?</b>
                      <p>
                        {tipo.documento ? 'Se genera el formato oficial en Excel, se ' : 'Se '}
                        envía un correo con el asunto «{tipo.asunto}» a <b>{destino?.correo || 'gerencia'}</b>
                        {destino?.modo === 'pruebas' && <> (correo de pruebas)</>} y la solicitud queda registrada con un número para su seguimiento.
                      </p>
                    </div>
                  </div>
                </>
              ) : todos[paso].render()}
            </div>

            <footer className="sv-wizard__nav">
              {paso > 0 ? <button type="button" className="sv-btn sv-btn--ghost" onClick={() => irA(paso - 1)}><IconArrowLeft width={18} height={18} /> Anterior</button> : <a className="sv-btn sv-btn--ghost" href={volverHref}><IconArrowLeft width={18} height={18} /> Volver</a>}
              <button type="submit" className="sv-btn">{ultimo ? <><IconSend width={18} height={18} /> Enviar solicitud</> : <>Continuar <IconArrowRight width={18} height={18} /></>}</button>
            </footer>
          </form>
        </div>
        {aside}
      </div>

      {confirmar && (
        <Modal title="¿Enviar la solicitud?" onClose={() => !enviando && setConfirmar(false)} size="sm">
          <div className="sv-confirm">
            <p>Vas a enviar <b>{tipo.nombre}</b>. Después de enviarla no podrás editarla desde la intranet.</p>
            <ul>
              {tipo.documento && <li>Se generará el formato oficial en Excel.</li>}
              <li>Se enviará un correo a <b>{destino?.correo || 'gerencia'}</b>.</li>
              <li>Recibirás un número para consultar el estado.</li>
            </ul>
            {errorEnvio && <p className="sv-alert sv-alert--error" role="alert">{errorEnvio}</p>}
            <footer className="sv-modal__foot">
              <button type="button" className="sv-btn sv-btn--ghost" onClick={() => setConfirmar(false)} disabled={enviando}>Seguir revisando</button>
              <button type="button" className="sv-btn" onClick={enviar} disabled={enviando} aria-busy={enviando}>
                {enviando ? <><span className="sv-spinner" aria-hidden="true" /> Enviando…</> : <><IconSend width={18} height={18} /> Sí, enviar</>}
              </button>
            </footer>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Exito({ resultado }) {
  const tipo = TIPOS[resultado.tipo]
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])
  const correo = resultado.correo
  return (
    <div className="sv-success" role="status">
      <div className="sv-success__badge" aria-hidden="true"><IconCheckCircle width={44} height={44} /></div>
      <h2 tabIndex={-1} ref={ref}>Solicitud enviada correctamente</h2>
      <p className="sv-success__lead">Guarda el número de tu solicitud para consultar su estado cuando quieras.</p>

      <div className="sv-ticket">
        <div className="sv-ticket__brand"><img src={MARCA.logoHorizontal} alt="Gestión y Servicios" /><span>{tipo.categoria}</span></div>
        <div className="sv-ticket__num">
          <span>Número de solicitud</span>
          <b>{resultado.numero}</b>
        </div>
        <dl>
          <div><dt>Tipo</dt><dd>{tipo.nombre}</dd></div>
          <div><dt>Fecha</dt><dd>{new Date(resultado.creada).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}</dd></div>
          <div><dt>Estado</dt><dd><StatusBadge estado={resultado.estado} /></dd></div>
          <div><dt>Correo de destino</dt><dd>{correo?.to || '—'}</dd></div>
        </dl>
      </div>

      {correo?.estado === 'simulado' && (
        <p className="sv-callout sv-callout--warn"><IconInfo width={20} height={20} /> <span><b>Modo de pruebas:</b> el servidor de correo aún no está configurado, así que el correo quedó guardado en el sistema y no se envió.</span></p>
      )}
      {correo?.estado === 'error' && (
        <p className="sv-callout sv-callout--error"><IconInfo width={20} height={20} /> <span>La solicitud quedó registrada, pero el correo no se pudo enviar. El equipo de gestión lo reenviará.</span></p>
      )}
      {resultado.aviso && <p className="sv-callout sv-callout--warn"><IconInfo width={20} height={20} /> <span>{resultado.aviso}</span></p>}

      <div className="sv-success__actions">
        <a className="sv-btn sv-btn--ghost" href="#solicitudes"><IconArrowLeft width={18} height={18} /> Volver a Solicitudes</a>
        <a className="sv-btn" href="#solicitudes-consulta"><IconList width={18} height={18} /> Consultar mis solicitudes</a>
      </div>
      <p className="sv-success__next"><IconClock width={16} height={16} /> Consulta el avance en «Mis solicitudes»: Enviada → En proceso → Aprobada.</p>
    </div>
  )
}
