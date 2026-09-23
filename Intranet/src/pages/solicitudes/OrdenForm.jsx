import { useState } from 'react'
import { N_COMPETENCIAS, N_DOCUMENTOS, N_FUNCIONES, PORCENTAJES, SERVICIOS, TIPOS_CONTRATO, formatoFecha, formatoPesos, hoyISO } from '../../../shared/solicitudes.js'
import FormWizard from './FormWizard.jsx'
import { fieldId, useSolicitudForm } from './form.js'
import { FOTOS } from './brand.js'
import { DigitsField, FormAside, MoneyField, PageHeader, Review, Section, SelectField, SignaturePad, TextArea, TextField } from './ui.jsx'
import { IconAlert, IconCheck, IconClipboard, IconLock } from './icons.jsx'

const nuevo = () => ({
  fechaSolicitud: hoyISO(), fechaIngreso: '', correo: '', centroCosto: '', justificacion: '',
  cargo: '', ciudadSede: '', cantidad: '', salario: '', tipoContratacion: '', tipoContratacionOtro: '', adicionales: '',
  horario: '', formacion: '', experiencia: '', habilidades: '',
  competencias: Array(N_COMPETENCIAS).fill(''), documentos: Array(N_DOCUMENTOS).fill(''), funciones: Array(N_FUNCIONES).fill(''),
  servicios: Object.fromEntries(SERVICIOS.map(([k]) => [k, false])),
  porcentajes: { estudios: '', pruebas: '', experiencia: '', entrevista: '' },
  observaciones: '', solicitanteNombre: '', solicitanteCargo: '', firma: '',
  mensajeCorreo: '',
})

const LABELS = {
  fechaSolicitud: 'Fecha de solicitud', fechaIngreso: 'Fecha de ingreso', correo: 'Correo del solicitante', centroCosto: 'Centro de costo', justificacion: 'Justificación de la necesidad',
  cargo: 'Nombre del cargo', ciudadSede: 'Ciudad o sede', cantidad: 'Cantidad requerida', salario: 'Salario', tipoContratacion: 'Tipo de contratación', tipoContratacionOtro: 'Otro tipo de contratación', adicionales: 'Adicionales al salario',
  horario: 'Horario o jornada', formacion: 'Formación académica', experiencia: 'Experiencia requerida', habilidades: 'Habilidades requeridas',
  competencias: 'Competencia', documentos: 'Documento adicional', funciones: 'Responsabilidad', porcentajes: 'Porcentajes de evaluación',
  observaciones: 'Observaciones', solicitanteNombre: 'Nombre del solicitante', solicitanteCargo: 'Cargo del solicitante', firma: 'Firma', mensajeCorreo: 'Mensaje del correo',
}

/* Lista de campos cortos numerados (competencias, documentos, funciones). */
function Lista({ form, base, n, requeridos, label, placeholder }) {
  return (
    <ol className="sv-numlist">
      {Array.from({ length: n }, (_, i) => (
        <li key={i}>
          <TextField form={form} path={`${base}.${i}`} label={`${label} ${i + 1}`} required={i < requeridos} placeholder={placeholder(i)} />
        </li>
      ))}
    </ol>
  )
}

export default function OrdenForm() {
  const [inicial] = useState(nuevo)
  const form = useSolicitudForm('orden_servicio', inicial, 'gys-borrador-orden-servicio')
  const d = form.datos
  const total = PORCENTAJES.reduce((s, [k]) => s + (Number(d.porcentajes?.[k]) || 0), 0)

  const steps = [
    {
      id: 'solicitud',
      title: 'Solicitud',
      campos: ['fechaSolicitud', 'fechaIngreso', 'correo', 'centroCosto', 'justificacion'],
      render: () => (
        <>
          <Section number="1" title="Datos de la solicitud">
            <div className="sv-grid">
              <TextField form={form} path="fechaSolicitud" label="Fecha de solicitud" type="date" required hint="Se carga la fecha de hoy; puedes cambiarla." />
              <TextField form={form} path="fechaIngreso" label="Fecha de ingreso" type="date" required hint="Fecha en la que se espera que la persona inicie." />
              <TextField form={form} path="correo" label="Correo electrónico del solicitante" type="email" required autoComplete="email" hint="Con este correo y el número podrás consultar el estado." className="sv-col-2" />
            </div>
          </Section>
          <Section number="2" title="Información administrativa">
            <div className="sv-grid">
              <TextField form={form} path="centroCosto" label="Centro de costo" required hint="De dónde sale el pago del cargo." />
            </div>
          </Section>
          <Section number="3" title="Justificación">
            <TextArea form={form} path="justificacion" label="Justificación de la necesidad" required rows={4} maxLength={600} placeholder="¿Por qué se necesita este cargo? Ej. apertura de una nueva zona, reemplazo, aumento de la operación…" />
          </Section>
        </>
      ),
    },
    {
      id: 'cargo',
      title: 'Perfil del cargo',
      campos: ['cargo', 'ciudadSede', 'cantidad', 'salario', 'tipoContratacion', 'tipoContratacionOtro', 'adicionales', 'horario', 'formacion', 'experiencia', 'habilidades'],
      render: () => (
        <Section number="4" title="Información del cargo" description="Perfil solicitado, tal como aparecerá en la orden de servicio.">
          <div className="sv-grid">
            <TextField form={form} path="cargo" label="Nombre del cargo" required className="sv-col-2" />
            <TextField form={form} path="ciudadSede" label="Ciudad o sede" required />
            <DigitsField form={form} path="cantidad" label="Cantidad requerida" required maxLength={3} hint="Número de vacantes." />
            <MoneyField form={form} path="salario" label="Salario" required />
            <SelectField form={form} path="tipoContratacion" label="Tipo de contratación" required options={TIPOS_CONTRATO} />
            {d.tipoContratacion === 'Otro' && <TextField form={form} path="tipoContratacionOtro" label="¿Cuál tipo de contratación?" required />}
            <TextField form={form} path="horario" label="Horario, jornada o turnos" required placeholder="Ej. Lunes a viernes, 8:00 a. m. a 5:00 p. m." className="sv-col-2" />
            <TextArea form={form} path="adicionales" label="Adicionales al salario" rows={2} maxLength={300} placeholder="Rodamiento, bonificaciones, comisiones, auxilios, otros" className="sv-col-2" />
            <TextField form={form} path="formacion" label="Formación académica" required placeholder="Ej. Técnico en sistemas" />
            <TextField form={form} path="experiencia" label="Años de experiencia requerida" required placeholder="Ej. 2 años" />
            <TextField form={form} path="habilidades" label="Habilidades requeridas" required className="sv-col-2" placeholder="Ej. Manejo de Excel, comunicación asertiva" />
          </div>
        </Section>
      ),
    },
    {
      id: 'funciones',
      title: 'Competencias y funciones',
      campos: ['competencias', 'documentos', 'funciones'],
      render: () => (
        <>
          <Section number="5" title="Competencias requeridas" description="Relaciona al menos 4.">
            <div className="sv-grid">
              <Lista form={form} base="competencias" n={N_COMPETENCIAS} requeridos={4} label="Competencia" placeholder={(i) => ['Ej. Trabajo en equipo', 'Ej. Orientación al servicio', 'Ej. Liderazgo', 'Ej. Comunicación'][i]} />
            </div>
          </Section>
          <Section number="6" title="Documentos o certificados adicionales" description="Opcional.">
            <Lista form={form} base="documentos" n={N_DOCUMENTOS} requeridos={0} label="Documento" placeholder={() => 'Ej. Licencia de conducción'} />
          </Section>
          <Section number="7" title="Responsabilidades y funciones principales" description="Relaciona al menos 4.">
            <Lista form={form} base="funciones" n={N_FUNCIONES} requeridos={4} label="Responsabilidad" placeholder={() => 'Describe una función principal'} />
          </Section>
        </>
      ),
    },
    {
      id: 'evaluacion',
      title: 'Evaluación',
      campos: ['servicios', 'porcentajes'],
      render: () => (
        <>
          <Section number="8" title="Servicios complementarios" description="Marca los servicios que necesitas en el proceso de selección.">
            <div className="sv-checks">
              {SERVICIOS.map(([k, label]) => (
                <label key={k} className={`sv-check ${d.servicios?.[k] ? 'is-on' : ''}`}>
                  <input type="checkbox" checked={Boolean(d.servicios?.[k])} onChange={(e) => form.set(`servicios.${k}`, e.target.checked)} />
                  <span className="sv-check__box" aria-hidden="true"><IconCheck width={14} height={14} /></span>
                  {label}
                </label>
              ))}
            </div>
          </Section>
          <Section number="9" title="Porcentajes para evaluar al candidato" description="Indica el peso de cada criterio. Deben sumar 100 %.">
            <div className="sv-grid sv-grid--4">
              {PORCENTAJES.map(([k, label]) => (
                <DigitsField key={k} form={form} path={`porcentajes.${k}`} label={`${label} (%)`} required maxLength={3} />
              ))}
            </div>
            <div className={`sv-total ${total === 100 ? 'is-ok' : 'is-bad'}`} id={fieldId('porcentajes')} tabIndex={-1} aria-live="polite">
              <div className="sv-total__bar"><span style={{ width: `${Math.min(total, 100)}%` }} /></div>
              <b>{total} %</b>
              <span>{total === 100 ? <><IconCheck width={16} height={16} /> Suma correcta</> : <><IconAlert width={16} height={16} /> {total < 100 ? `Faltan ${100 - total} %` : `Sobran ${total - 100} %`}</>}</span>
            </div>
          </Section>
        </>
      ),
    },
    {
      id: 'firma',
      title: 'Observaciones y firma',
      campos: ['observaciones', 'solicitanteNombre', 'solicitanteCargo', 'firma'],
      render: () => (
        <>
          <Section number="10" title="Observaciones" description="Información adicional a tener en cuenta (opcional).">
            <TextArea form={form} path="observaciones" label="Observaciones adicionales" rows={3} maxLength={600} />
          </Section>
          <Section number="11" title="Solicitante" description="Quien diligencia y firma la orden.">
            <div className="sv-grid">
              <TextField form={form} path="solicitanteNombre" label="Nombre del solicitante" required autoComplete="name" />
              <TextField form={form} path="solicitanteCargo" label="Cargo del solicitante" required autoComplete="organization-title" />
              <SignaturePad form={form} path="firma" label="Firma del solicitante" required />
              <div className="sv-field sv-col-2">
                <span className="sv-label">Autorización GYS</span>
                <p className="sv-locked"><IconLock width={16} height={16} /> Queda vacía. La diligencia Gestión y Servicios.</p>
              </div>
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
        <Section number="12" title="Correo a gerencia" description="Asunto: «Solicitud de Orden de Servicio». Escribe el mensaje completo; los datos clave y el Excel se agregan automáticamente.">
          <TextArea form={form} path="mensajeCorreo" label="Mensaje del correo" required rows={9} maxLength={3000} placeholder={'Buenos días,\n\nSolicito la apertura de la orden de servicio para …'} />
        </Section>
      ),
    },
  ]

  const lista = (arr) => (arr || []).filter(Boolean).map((x, i) => <span key={i} className="sv-review__li">{x}</span>)
  const review = (irA) => (
    <Review
      onEdit={irA}
      groups={[
        { title: 'Solicitud', step: 0, wide: ['Justificación'], items: [['Fecha de solicitud', formatoFecha(d.fechaSolicitud)], ['Fecha de ingreso', formatoFecha(d.fechaIngreso)], ['Correo', d.correo], ['Centro de costo', d.centroCosto], ['Justificación', d.justificacion]] },
        { title: 'Perfil del cargo', step: 1, items: [['Cargo', d.cargo], ['Ciudad o sede', d.ciudadSede], ['Vacantes', d.cantidad], ['Salario', formatoPesos(d.salario)], ['Contratación', d.tipoContratacion === 'Otro' ? d.tipoContratacionOtro : d.tipoContratacion], ['Horario', d.horario], ['Formación', d.formacion], ['Experiencia', d.experiencia], ['Habilidades', d.habilidades], ['Adicionales', d.adicionales]] },
        { title: 'Competencias y funciones', step: 2, wide: ['Responsabilidades'], items: [['Competencias', lista(d.competencias)], ['Documentos', d.documentos?.some(Boolean) ? lista(d.documentos) : ''], ['Responsabilidades', lista(d.funciones)]] },
        { title: 'Evaluación', step: 3, items: [['Servicios', SERVICIOS.filter(([k]) => d.servicios?.[k]).map(([, l]) => l).join(', ')], ['Porcentajes', PORCENTAJES.map(([k, l]) => `${l} ${d.porcentajes?.[k] || 0} %`).join(' · ')]] },
        { title: 'Observaciones y firma', step: 4, items: [['Observaciones', d.observaciones], ['Solicitante', `${d.solicitanteNombre} · ${d.solicitanteCargo}`], ['Firma', d.firma ? <img className="sv-review__sign" src={d.firma} alt="Firma del solicitante" /> : '']] },
        { title: 'Mensaje del correo', step: 5, wide: ['Mensaje'], items: [['Mensaje', <span className="sv-pre">{d.mensajeCorreo}</span>]] },
      ]}
    />
  )

  return (
    <div className="sv">
      <PageHeader
        crumbs={[['Solicitudes', '#solicitudes'], ['Búsqueda de personal', '#solicitudes-personal'], ['Petición de Orden de Servicio']]}
        eyebrow="Formato FT-OP-03"
        title="Petición de Orden de Servicio"
        lead="Solicita el cargo que necesitas cubrir. Con esta información se genera la orden de servicio oficial para iniciar la búsqueda."
        icon={IconClipboard}
        photo={FOTOS.equipoBanner}
      />
      <div className="sv-wrap sv-page">
        <FormWizard form={form} steps={steps} labels={LABELS} review={review} correoSolicitante={(x) => x.correo} volverHref="#solicitudes-personal" aside={<FormAside code="FT-OP-03" tips={['Perfil, funciones y horario del cargo', 'Salario y tipo de contratación', 'Al menos 4 competencias y 4 responsabilidades', 'Porcentajes de evaluación (deben sumar 100 %)']} photo={FOTOS.equipoOficina} note="Con esta orden, el equipo de selección inicia la búsqueda del candidato ideal." />} />
      </div>
    </div>
  )
}
