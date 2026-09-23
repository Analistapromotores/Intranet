import { useState } from 'react'
import { EQUIPOS, MAX_EQUIPOS, formatoFecha, hoyISO } from '../../../shared/solicitudes.js'
import FormWizard from './FormWizard.jsx'
import { useSolicitudForm } from './form.js'
import { FOTOS } from './brand.js'
import { DigitsField, FormAside, PageHeader, Review, Section, SelectField, TextArea, TextField } from './ui.jsx'
import { IconAlert, IconLaptop, IconPlus, IconTrash } from './icons.jsx'

const nuevo = () => ({
  nombre: '', cargo: '', documento: '', celular: '', correo: '', area: '',
  equipos: [{ tipo: '', otro: '', cantidad: '1' }],
  fechaRequerida: hoyISO(), fechaDevolucion: '', observacion: '',
})

const LABELS = {
  nombre: 'Nombre completo', cargo: 'Cargo', documento: 'Número de documento', celular: 'Celular', correo: 'Correo electrónico', area: 'Área',
  equipos: 'Equipo o elemento', fechaRequerida: 'Fecha en la que lo requieres', fechaDevolucion: 'Fecha de devolución', observacion: 'Observación',
}
const AREAS = ['G&S', 'Promotores', 'Corpoquindío', 'Mediadores', 'Pasaportes', 'ValleInn', 'Talento humano', 'Tecnología']

export default function PrestamoPage() {
  const [inicial] = useState(nuevo)
  const form = useSolicitudForm('prestamo_equipos', inicial, 'gys-borrador-prestamo')
  const d = form.datos
  const items = d.equipos || []

  const steps = [
    {
      id: 'datos',
      title: 'Tus datos',
      campos: ['nombre', 'cargo', 'documento', 'celular', 'correo', 'area'],
      render: () => (
        <Section number="1" title="Datos de quien recibe el préstamo" description="Los equipos quedan bajo tu responsabilidad.">
          <div className="sv-grid">
            <TextField form={form} path="nombre" label="Nombre completo" required autoComplete="name" className="sv-col-2" />
            <TextField form={form} path="cargo" label="Cargo" required autoComplete="organization-title" />
            <DigitsField form={form} path="documento" label="Número de documento" required />
            <DigitsField form={form} path="celular" label="Celular" required maxLength={13} />
            <TextField form={form} path="correo" label="Correo electrónico" type="email" required autoComplete="email" hint="Para consultar el estado de tu préstamo." />
            <TextField form={form} path="area" label="Área" required list="sv-areas" hint="Elige de la lista o escribe tu área." className="sv-col-2" />
            <datalist id="sv-areas">{AREAS.map((a) => <option key={a} value={a} />)}</datalist>
          </div>
        </Section>
      ),
    },
    {
      id: 'equipos',
      title: 'Equipos y fechas',
      campos: ['equipos', 'fechaRequerida', 'fechaDevolucion', 'observacion'],
      render: () => (
        <>
          <Section number="2" title="Tipo de equipo o elemento" description="Puedes pedir varios elementos en la misma solicitud.">
            <div className="sv-repeat">
              {items.map((it, i) => (
                <div key={i} className="sv-repeat__item">
                  <div className="sv-repeat__head">
                    <b>Elemento {i + 1}</b>
                    {items.length > 1 && <button type="button" className="sv-link sv-link--danger" onClick={() => form.set('equipos', items.filter((_, j) => j !== i))}><IconTrash width={16} height={16} /> Quitar</button>}
                  </div>
                  <div className="sv-grid sv-grid--eq">
                    <SelectField form={form} path={`equipos.${i}.tipo`} label="Equipo o elemento" required options={EQUIPOS} />
                    <DigitsField form={form} path={`equipos.${i}.cantidad`} label="Cantidad" required maxLength={3} />
                    {it.tipo === 'Otro' && <TextField form={form} path={`equipos.${i}.otro`} label="Especifica el equipo o elemento" required className="sv-col-2" />}
                  </div>
                </div>
              ))}
            </div>
            {items.length < MAX_EQUIPOS && (
              <button type="button" className="sv-btn sv-btn--soft" onClick={() => form.set('equipos', [...items, { tipo: '', otro: '', cantidad: '1' }])}>
                <IconPlus width={18} height={18} /> Agregar otro elemento
              </button>
            )}
          </Section>
          <Section number="3" title="Fechas del préstamo">
            <div className="sv-grid">
              <TextField form={form} path="fechaRequerida" label="Fecha en la que requiere el equipo" type="date" required />
              <TextField form={form} path="fechaDevolucion" label="Fecha de devolución" type="date" required hint="No puede ser anterior a la fecha en que lo requieres." />
            </div>
          </Section>
          <Section number="4" title="Observación">
            <TextArea form={form} path="observacion" label="Observación" rows={4} maxLength={600} placeholder="Menciona detalles de la solicitud para tener en cuenta. Ejemplo: El equipo debe tener instalado X programa, debe tener HDMI, etc." />
          </Section>
        </>
      ),
    },
  ]

  const review = (irA) => (
    <Review
      onEdit={irA}
      groups={[
        { title: 'Tus datos', step: 0, items: [['Nombre', d.nombre], ['Cargo', d.cargo], ['Documento', d.documento], ['Celular', d.celular], ['Correo', d.correo], ['Área', d.area]] },
        { title: 'Equipos y fechas', step: 1, wide: ['Observación'], items: [['Elementos', items.map((it, i) => <span key={i} className="sv-review__li">{it.cantidad} × {it.tipo === 'Otro' ? it.otro : it.tipo}</span>)], ['Lo requieres el', formatoFecha(d.fechaRequerida)], ['Devolución', formatoFecha(d.fechaDevolucion)], ['Observación', d.observacion]] },
      ]}
    />
  )

  return (
    <div className="sv">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Préstamo de equipos']]}
        eyebrow="Tecnología"
        title="Préstamo de equipos"
        lead="Realiza aquí las solicitudes para el préstamo de los equipos y elementos que requieras para tus actividades."
        icon={IconLaptop}
        tone="teal"
        photo={FOTOS.prestamo}
      />
      <div className="sv-wrap sv-page">
        <aside className="sv-notice" aria-labelledby="sv-notice-title">
          <span className="sv-notice__icon"><IconAlert width={24} height={24} /></span>
          <div>
            <h2 id="sv-notice-title">Solicitud de préstamo de equipos tecnológicos</h2>
            <p>Se informa que los equipos tecnológicos que sean prestados son de <b>exclusiva responsabilidad del usuario receptor</b>.</p>
            <p>Estos equipos no pueden ser reasignados a otro usuario ni trasladados a otro lugar sin la autorización correspondiente.</p>
            <p>Al finalizar el período de préstamo, es obligatorio devolver los equipos al área de TI para su revisión y registro.</p>
            <p>Además, el préstamo de equipos está sujeto a la disponibilidad de los mismos.</p>
          </div>
        </aside>
        <FormWizard form={form} steps={steps} labels={LABELS} review={review} correoSolicitante={(x) => x.correo} volverHref="#solicitudes" aside={<FormAside title="Antes de pedir" tips={['Tu documento y número de celular', 'Las fechas de uso y de devolución', 'Detalles técnicos: programas, HDMI, cables…', 'Recuerda: el préstamo depende de la disponibilidad']} photo={FOTOS.soporte} note="El área de TI revisa y registra cada equipo al entregarlo y al recibirlo." />} />
      </div>
    </div>
  )
}
