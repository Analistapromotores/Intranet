import { useState } from 'react'
import { MAX_BENEFICIOS, PERIODICIDADES, formatoFecha, formatoPesos, hoyISO } from '../../../shared/solicitudes.js'
import FormWizard from './FormWizard.jsx'
import { useSolicitudForm } from './form.js'
import { FOTOS } from './brand.js'
import { DigitsField, FormAside, MoneyField, PageHeader, Review, Section, SelectField, SignaturePad, TextArea, TextField } from './ui.jsx'
import { IconLock, IconPlus, IconTrash, IconUserCheck } from './icons.jsx'

const nuevo = () => ({
  fechaSolicitud: hoyISO(),
  nombre: '', identificacion: '', centroCosto: '', cargo: '', telefono: '', barrio: '', correo: '', direccion: '', fechaIngreso: '',
  salario: '', auxilioTransporte: '', beneficios: [],
  solicitanteNombre: '', solicitanteCargo: '', solicitanteCorreo: '', firma: '',
  responsableNombre: '', responsableCargo: '',
  mensajeCorreo: '',
})

const LABELS = {
  fechaSolicitud: 'Fecha de solicitud', nombre: 'Nombres y apellidos', identificacion: 'Identificación', centroCosto: 'Centro de costo', cargo: 'Cargo',
  telefono: 'Teléfono', barrio: 'Barrio', correo: 'Correo electrónico', direccion: 'Dirección', fechaIngreso: 'Fecha probable de ingreso',
  salario: 'Salario a pagar', auxilioTransporte: 'Auxilio de transporte', beneficios: 'Beneficio adicional',
  solicitanteNombre: 'Nombre del solicitante', solicitanteCargo: 'Cargo del solicitante', solicitanteCorreo: 'Tu correo electrónico', firma: 'Firma',
  responsableNombre: 'Responsable de contratación', responsableCargo: 'Cargo del responsable', mensajeCorreo: 'Mensaje del correo',
}

export default function IngresoForm() {
  const [inicial] = useState(nuevo)
  const form = useSolicitudForm('informe_ingreso', inicial, 'gys-borrador-informe-ingreso')
  const ben = form.datos.beneficios || []

  const steps = [
    {
      id: 'persona',
      title: 'Persona seleccionada',
      campos: ['fechaSolicitud', 'nombre', 'identificacion', 'centroCosto', 'cargo', 'telefono', 'barrio', 'correo', 'direccion', 'fechaIngreso'],
      render: () => (
        <>
          <Section number="1" title="Datos de la solicitud" description="La fecha de hoy se carga automáticamente; puedes cambiarla si lo necesitas.">
            <div className="sv-grid">
              <TextField form={form} path="fechaSolicitud" label="Fecha de solicitud" type="date" required />
            </div>
          </Section>
          <Section number="2" title="Información de la persona" description="Datos de la persona seleccionada para el cargo.">
            <div className="sv-grid">
              <TextField form={form} path="nombre" label="Nombres y apellidos" required autoComplete="off" className="sv-col-2" />
              <DigitsField form={form} path="identificacion" label="Identificación" required hint="Número de documento, sin puntos." />
              <TextField form={form} path="cargo" label="Cargo" required hint="Cargo que va a ocupar." />
              <TextField form={form} path="centroCosto" label="Centro de costo" required hint="De dónde sale el pago." />
              <DigitsField form={form} path="telefono" label="Teléfono" required maxLength={13} />
              <TextField form={form} path="correo" label="Correo electrónico" type="email" required inputMode="email" />
              <TextField form={form} path="direccion" label="Dirección" required />
              <TextField form={form} path="barrio" label="Barrio" required />
              <TextField form={form} path="fechaIngreso" label="Fecha probable de ingreso" type="date" required hint="Fecha en la que se espera que la persona seleccionada inicie labores." />
            </div>
          </Section>
        </>
      ),
    },
    {
      id: 'salario',
      title: 'Salario y beneficios',
      campos: ['salario', 'auxilioTransporte', 'beneficios'],
      render: () => (
        <>
          <Section number="3" title="Información salarial" description="Valores en pesos colombianos. Escribe solo números: el formato se aplica solo.">
            <div className="sv-grid">
              <MoneyField form={form} path="salario" label="Salario a pagar" required />
              <MoneyField form={form} path="auxilioTransporte" label="Auxilio de transporte" required hint="Escribe 0 si no aplica." />
            </div>
          </Section>
          <Section number="4" title="Beneficios adicionales" description={`Opcional. El formato tiene espacio para ${MAX_BENEFICIOS} beneficios.`}>
            {ben.length === 0 && <p className="sv-empty-line">No has agregado beneficios adicionales.</p>}
            <div className="sv-repeat">
              {ben.map((_, i) => (
                <div key={i} className="sv-repeat__item">
                  <div className="sv-repeat__head">
                    <b>Beneficio {i + 1}</b>
                    <button type="button" className="sv-link sv-link--danger" onClick={() => form.set('beneficios', ben.filter((__, j) => j !== i))}><IconTrash width={16} height={16} /> Quitar</button>
                  </div>
                  <div className="sv-grid sv-grid--3">
                    <TextField form={form} path={`beneficios.${i}.descripcion`} label="Descripción" required placeholder="Ej. Bonificación por cumplimiento" />
                    <MoneyField form={form} path={`beneficios.${i}.valor`} label="Valor" required />
                    <SelectField form={form} path={`beneficios.${i}.periodicidad`} label="Periodicidad" required options={PERIODICIDADES} />
                    {ben[i].periodicidad === 'Otro' && <TextField form={form} path={`beneficios.${i}.periodicidadOtra`} label="¿Cuál periodicidad?" required placeholder="Ej. Bimestral" />}
                  </div>
                </div>
              ))}
            </div>
            {ben.length < MAX_BENEFICIOS && (
              <button type="button" className="sv-btn sv-btn--soft" onClick={() => form.set('beneficios', [...ben, { descripcion: '', valor: '', periodicidad: '' }])}>
                <IconPlus width={18} height={18} /> Agregar beneficio
              </button>
            )}
          </Section>
        </>
      ),
    },
    {
      id: 'autorizacion',
      title: 'Autorización y responsable',
      campos: ['solicitanteNombre', 'solicitanteCargo', 'solicitanteCorreo', 'firma', 'responsableNombre', 'responsableCargo'],
      render: () => (
        <>
          <Section number="5" title="Autorización de contratación" description="Datos de quien diligencia y firma esta solicitud.">
            <div className="sv-grid">
              <TextField form={form} path="solicitanteNombre" label="Nombre del solicitante" required autoComplete="name" />
              <TextField form={form} path="solicitanteCargo" label="Cargo del solicitante" required autoComplete="organization-title" />
              <TextField form={form} path="solicitanteCorreo" label="Tu correo electrónico" type="email" required autoComplete="email" hint="Con este correo y el número de solicitud podrás consultar el estado." className="sv-col-2" />
              <SignaturePad form={form} path="firma" label="Firma del solicitante" required />
              <div className="sv-field sv-col-2">
                <span className="sv-label">Autorización GYS</span>
                <p className="sv-locked"><IconLock width={16} height={16} /> Queda vacía. La diligencia el responsable de Gestión y Servicios.</p>
              </div>
            </div>
          </Section>
          <Section number="6" title="Responsable de contratación" description="Persona que realizará la contratación.">
            <div className="sv-grid">
              <TextField form={form} path="responsableNombre" label="Nombre del responsable de contratación" required />
              <TextField form={form} path="responsableCargo" label="Cargo del responsable de contratación" required />
            </div>
          </Section>
        </>
      ),
    },
    {
      id: 'correo',
      title: 'Mensaje del correo',
      campos: ['mensajeCorreo'],
      render: () => (
        <Section number="7" title="Correo a gerencia" description="Asunto: «Solicitud de Informe de Ingreso». Escribe el mensaje tal como quieres que lo lean; debajo se agregan automáticamente los datos clave y el Excel adjunto.">
          <TextArea form={form} path="mensajeCorreo" label="Mensaje del correo" required rows={9} maxLength={3000} placeholder={'Buenos días,\n\nSolicito la elaboración del informe de ingreso de …'} />
        </Section>
      ),
    },
  ]

  const d = form.datos
  const review = (irA) => (
    <Review
      onEdit={irA}
      groups={[
        { title: 'Persona seleccionada', step: 0, items: [['Fecha de solicitud', formatoFecha(d.fechaSolicitud)], ['Nombres y apellidos', d.nombre], ['Identificación', d.identificacion], ['Cargo', d.cargo], ['Centro de costo', d.centroCosto], ['Teléfono', d.telefono], ['Correo', d.correo], ['Dirección', `${d.direccion} · ${d.barrio}`], ['Fecha probable de ingreso', formatoFecha(d.fechaIngreso)]] },
        { title: 'Salario y beneficios', step: 1, items: [['Salario', formatoPesos(d.salario)], ['Auxilio de transporte', formatoPesos(d.auxilioTransporte)], ...ben.map((b, i) => [`Beneficio ${i + 1}`, `${b.descripcion} · ${formatoPesos(b.valor)} · ${b.periodicidad === 'Otro' ? b.periodicidadOtra : b.periodicidad}`])] },
        { title: 'Autorización y responsable', step: 2, items: [['Solicitante', `${d.solicitanteNombre} · ${d.solicitanteCargo}`], ['Tu correo', d.solicitanteCorreo], ['Firma', d.firma ? <img className="sv-review__sign" src={d.firma} alt="Firma del solicitante" /> : ''], ['Responsable de contratación', `${d.responsableNombre} · ${d.responsableCargo}`]] },
        { title: 'Mensaje del correo', step: 3, wide: ['Mensaje'], items: [['Mensaje', <span className="sv-pre">{d.mensajeCorreo}</span>]] },
      ]}
    />
  )

  return (
    <div className="sv">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Búsqueda de personal', '#solicitudes-personal'], ['Informe de Ingreso']]}
        eyebrow="Formato FT-OP-10"
        title="Informe de Ingreso"
        lead="Registra la información de la persona seleccionada para iniciar el proceso de contratación y generar el informe de ingreso."
        icon={IconUserCheck}
        photo={FOTOS.equipoOficina}
      />
      <div className="sv-wrap sv-page">
        <FormWizard form={form} steps={steps} labels={LABELS} review={review} correoSolicitante={(x) => x.solicitanteCorreo} volverHref="#solicitudes-personal" aside={<FormAside code="FT-OP-10" tips={['Documento de identidad de la persona seleccionada', 'Salario y auxilio de transporte acordados', 'Centro de costo que asume el pago', 'Nombre y cargo de quien hará la contratación']} photo={FOTOS.equipoBanner} />} />
      </div>
    </div>
  )
}
