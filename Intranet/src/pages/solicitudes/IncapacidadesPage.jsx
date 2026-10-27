import { useEffect, useMemo, useRef, useState } from 'react'
import { CASOS_INCAPACIDAD, CORREO_INCAPACIDADES, plantillaIncapacidad } from '../../../shared/incapacidades.js'
import { ApiError, api } from './api.js'
import { recordarSolicitud, useSolicitudForm } from './form.js'
import { AnexosEditor, Enviado } from './anexos.jsx'
import { DigitsField, Field, PageHeader, Section, TextField } from './ui.jsx'
import { FOTOS } from './brand.js'
import { IconAlert, IconMedical, IconSend } from './icons.jsx'
import './incapacidades.css'

/* Incapacidades y licencias: se elige el tipo, se redacta el correo para Talento Humano (asunto, mensaje,
   archivos y enlaces) y se envía; queda registrado con número y se consulta con la cédula. */

const INICIAL = { caso: '', nombre: '', identificacion: '', correo: '', telefono: '', asunto: '', cuerpo: '', anexos: [], enlaces: [] }
const CAMPOS = ['caso', 'nombre', 'identificacion', 'correo', 'telefono', 'asunto', 'cuerpo', 'anexos', 'enlaces']

export default function IncapacidadesPage() {
  const form = useSolicitudForm('incapacidad', INICIAL, 'gys-borrador-incapacidad')
  const { datos, set, errores } = form
  const caso = CASOS_INCAPACIDAD.find((c) => c.id === datos.caso)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [resultado, setResultado] = useState(null)

  /* Asunto y mensaje se proponen solos mientras la persona no los haya escrito a mano. */
  const propio = useRef(null)
  if (propio.current === null) {
    const p = plantillaIncapacidad(datos.caso, datos)
    propio.current = { asunto: Boolean(datos.asunto) && datos.asunto !== p.asunto, cuerpo: Boolean(datos.cuerpo) && datos.cuerpo !== p.cuerpo }
  }
  useEffect(() => {
    if (!datos.caso) return
    const p = plantillaIncapacidad(datos.caso, datos)
    if (!propio.current.asunto) set('asunto', p.asunto)
    if (!propio.current.cuerpo) set('cuerpo', p.cuerpo)
  }, [datos.caso, datos.nombre, datos.identificacion, set]) // eslint-disable-line react-hooks/exhaustive-deps

  const hayErrores = useMemo(() => Object.keys(errores).length > 0, [errores])

  async function enviar(e) {
    e.preventDefault()
    form.tocarVarios(CAMPOS)
    if (hayErrores) {
      setErrorEnvio('Revisa los campos marcados antes de enviar.')
      requestAnimationFrame(() => document.querySelector('.sv-field.has-error, .sv-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
      return
    }
    setErrorEnvio('')
    setEnviando(true)
    try {
      const r = await api.enviar('incapacidad', datos)
      recordarSolicitud(r.numero, datos.correo)
      form.limpiarBorrador()
      setResultado(r)
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    } catch (err) {
      setErrorEnvio(err.message)
      if (err instanceof ApiError && Object.keys(err.fields).length) form.tocarVarios(Object.keys(err.fields))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="sv">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Incapacidades']]}
        eyebrow="Talento humano"
        title="Incapacidades y licencias"
        lead="Elige el tipo, redacta tu correo, anexa los documentos y envíalo a Talento Humano. Queda registrado con un número."
        icon={IconMedical}
        photo={FOTOS.equipoBanner}
      />
      <div className="sv-wrap sv-page">
        {resultado ? (
          <Enviado resultado={resultado} destino={CORREO_INCAPACIDADES} />
        ) : (
          <form className="in-form" onSubmit={enviar} noValidate>
            <Section number="1" title="¿Qué vas a enviar?" description="Al elegir el tipo se prepara el correo con el asunto y los documentos que necesitas.">
              <fieldset className="in-pick">
                <legend className="sv-sr">Tipo de incapacidad o licencia</legend>
                {CASOS_INCAPACIDAD.map((c) => (
                  <label key={c.id} className="in-pick__op">
                    <input type="radio" name="caso" value={c.id} checked={datos.caso === c.id} onChange={() => { set('caso', c.id); form.tocar('caso') }} />
                    <b>{c.titulo}</b>
                    <small>{c.docs.length} documentos</small>
                  </label>
                ))}
              </fieldset>
              {form.error('caso') && <small className="sv-error" role="alert"><IconAlert width={14} height={14} /> {form.error('caso')}</small>}
            </Section>

            {caso && (
              <>
                <Section number="2" title="Tus datos" description="Con tu cédula o tu correo podrás consultar el estado en «Mis solicitudes».">
                  <div className="sv-grid">
                    <TextField form={form} path="nombre" label="Nombres y apellidos" required autoComplete="name" />
                    <DigitsField form={form} path="identificacion" label="Número de cédula" required hint="Sin puntos ni espacios." />
                    <TextField form={form} path="correo" label="Tu correo electrónico" type="email" required autoComplete="email" />
                    <TextField form={form} path="telefono" label="Teléfono" type="tel" inputMode="tel" autoComplete="tel" />
                  </div>
                </Section>

                <Section number="3" title="Tu correo a Talento Humano">
                  <div className="in-mail">
                    <div className="in-mail__bar">Mensaje nuevo</div>
                    <div className="in-mail__body">
                      <div className="in-mail__row"><span>Para</span><b>{CORREO_INCAPACIDADES}</b></div>
                      <div className="in-mail__row"><span>De</span><span>{datos.correo || 'tu correo electrónico'}</span></div>
                      <Field form={form} path="asunto" label="Asunto" required>
                        {(a) => (
                          <input {...a} className="sv-input" value={datos.asunto} maxLength={150} onChange={(e) => { propio.current.asunto = true; set('asunto', e.target.value) }} onBlur={() => form.tocar('asunto')} />
                        )}
                      </Field>
                      <Field form={form} path="cuerpo" label="Mensaje" required>
                        {(a) => (
                          <textarea {...a} className="sv-input sv-textarea" rows={10} value={datos.cuerpo} maxLength={5000} onChange={(e) => { propio.current.cuerpo = true; set('cuerpo', e.target.value) }} onBlur={() => form.tocar('cuerpo')} />
                        )}
                      </Field>

                      <div className="in-need">
                        <b>Documentos que debes anexar para «{caso.titulo.toLowerCase()}»</b>
                        <ul>{caso.docs.map((d) => <li key={d}>{d}</li>)}</ul>
                        {caso.nota && <p>{caso.nota}</p>}
                      </div>

                      <AnexosEditor
                        anexos={datos.anexos}
                        enlaces={datos.enlaces}
                        onChange={({ anexos, enlaces }) => { set('anexos', anexos); set('enlaces', enlaces) }}
                        error={errores.anexos}
                        errorEnlaces={errores.enlaces}
                      />
                    </div>
                  </div>
                </Section>

                {errorEnvio && <p className="sv-alert sv-alert--error" role="alert">{errorEnvio}</p>}
                <div className="sv-actions">
                  <button type="submit" className="sv-btn sv-btn--lg" disabled={enviando}>
                    {enviando ? <><span className="sv-spinner" aria-hidden="true" /> Enviando…</> : <><IconSend width={18} height={18} /> Enviar a Talento Humano</>}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
